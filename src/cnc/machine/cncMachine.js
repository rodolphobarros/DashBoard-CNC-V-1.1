import config from '../../config/config.js';
import { logError, logInfo } from '../../core/logger.js';
import { SerialConnection } from '../connection/serialConnection.js';

import { parseGrblLine } from './grblParser.js';
import { readThermalSensors } from './sensors/thermalSensors.js';

const THERMAL_POLLING_INTERVAL_MS = 5000;

class CNCMachine {
  constructor() {
    this.connection = 'DISCONNECTED';

    this.serialConnection = new SerialConnection();

    this.statusIntervalId = null;
    this.startupTimeoutId = null;
    this.statusTimeoutId = null;
    this.thermalIntervalId = null;

    this.status = null;
    this.position = null;

    this.feedRate = null;
    this.spindleSpeed = null;

    this.driverTemp = null;
    this.humidity = null;

    this.alarms = [];

    this.stateListeners = new Set();

    this.pendingCommand = null;
    this.idleWaiter = null;
  }

  async open(serialPath = config.cnc.serialPort) {
    if (this.serialConnection.isOpen()) {
      throw new Error('Serial port is already open');
    }

    this.stopTimers();
    this.resetMachineData();

    this.connection = 'CONNECTING';
    this.notifyStateChange();

    try {
      await this.serialConnection.open(serialPath, {
        onData: (line) => {
          this.handleGrblLine(line);
        },

        onClose: () => {
          this.handleCommunicationLoss(
            new Error('Serial connection closed unexpectedly')
          );
        },

        onError: (error) => {
          this.handleCommunicationLoss(error);
        },
      });

      logInfo('Machine', `Waiting for Grbl: ${serialPath}`);

      this.startStartupTimeout();
      this.startStatusPolling();

      return this.getData();
    } catch (error) {
      this.stopTimers();

      this.connection = 'DISCONNECTED';
      this.resetMachineData();
      this.notifyStateChange();

      logError('Machine', `Failed to open serial connection: ${error.message}`);

      throw error;
    }
  }

  async close() {
    this.rejectPendingCommand(new Error('CNC machine connection closed'));
    this.rejectIdleWaiter(new Error('CNC machine connection closed'));

    this.stopTimers();

    try {
      await this.serialConnection.close();
    } finally {
      this.connection = 'DISCONNECTED';
      this.resetMachineData();
      this.notifyStateChange();
    }

    return this.getData();
  }

  handleGrblLine(line) {
    const response = parseGrblLine(line);

    if (!response) {
      return;
    }

    switch (response.type) {
      case 'OK':
        logInfo('Machine', 'Grbl response: OK');
        this.resolvePendingCommand();
        break;

      case 'ERROR':
        logError('Machine', `Grbl error: ${response.code}`);
        this.rejectPendingCommand(
          new Error(`Grbl rejected command with error ${response.code}`)
        );
        break;

      case 'ALARM':
        this.confirmGrblConnection();
        this.resetStatusTimeout();

        this.status = 'ALARM';

        this.alarms = [
          {
            code: response.code,
            message: response.raw,
          },
        ];

        this.rejectPendingCommand(
          new Error(`Grbl entered alarm state: ${response.code}`)
        );
        this.rejectIdleWaiter(
          new Error(`Grbl entered alarm state: ${response.code}`)
        );

        logError('Machine', `Grbl alarm: ${response.code}`);

        this.notifyStateChange();
        break;

      case 'STATUS':
        this.confirmGrblConnection();
        this.resetStatusTimeout();

        this.updateStatus(response);
        this.resolveIdleWaiterIfReady();
        this.notifyStateChange();
        break;

      default:
        logInfo('Machine', `Grbl: ${response.raw}`);
    }
  }

  updateStatus(response) {
    this.status = response.status.toUpperCase();

    if (response.machinePosition) {
      this.position = {
        ...response.machinePosition,
      };
    } else if (response.workPosition) {
      this.position = {
        ...response.workPosition,
      };
    }

    this.feedRate = response.feedRate;

    // Telemetria somente.
    // O Dashboard não controla a velocidade do spindle.
    this.spindleSpeed = response.spindleSpeed;

    if (this.status !== 'ALARM') {
      this.alarms = [];
    }
  }

  confirmGrblConnection() {
    if (this.connection === 'CONNECTED') {
      return;
    }

    this.connection = 'CONNECTED';

    this.stopStartupTimeout();
    this.startThermalMonitoring();

    logInfo('Machine', 'Grbl connection confirmed');

    this.notifyStateChange();
  }

  async jog({ axis, direction, step }) {
    const allowedAxes = new Set(['x', 'y', 'z']);
    const allowedSteps = new Set([0.1, 1, 10]);

    if (!allowedAxes.has(axis)) {
      throw new Error(`Invalid JOG axis: ${axis}`);
    }

    if (direction !== 1 && direction !== -1) {
      throw new Error(`Invalid JOG direction: ${direction}`);
    }

    if (!allowedSteps.has(step)) {
      throw new Error(`Invalid JOG step: ${step}`);
    }

    if (!this.serialConnection.isOpen()) {
      throw new Error('Serial port is not open');
    }

    if (this.connection !== 'CONNECTED') {
      throw new Error('Grbl is not connected');
    }

    if (this.status !== 'IDLE' && this.status !== 'JOG') {
      throw new Error(`JOG is not allowed while Grbl is ${this.status}`);
    }

    const axisLetter = axis.toUpperCase();
    const distance = direction * step;
    const command = `$J=G91 ${axisLetter}${distance} F60`;

    await this.sendGcodeLine(command);

    return this.getData();
  }

  async sendGcodeLine(line) {
    if (!this.serialConnection.isOpen()) {
      throw new Error('Serial port is not open');
    }

    if (this.connection !== 'CONNECTED') {
      throw new Error('Grbl is not connected');
    }

    if (this.pendingCommand) {
      throw new Error('Another Grbl command is awaiting response');
    }

    const command = line.trim();

    if (!command) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.pendingCommand) {
          return;
        }

        this.pendingCommand = null;

        reject(
          new Error(
            `Grbl did not acknowledge command within ${config.grbl.commandTimeoutMs} ms`
          )
        );
      }, config.grbl.commandTimeoutMs);

      this.pendingCommand = {
        resolve,
        reject,
        timeoutId,
      };

      try {
        this.serialConnection.write(`${command}\n`);
      } catch (error) {
        clearTimeout(timeoutId);
        this.pendingCommand = null;
        reject(error);
      }
    });
  }

  resolvePendingCommand() {
    if (!this.pendingCommand) {
      return;
    }

    const { resolve, timeoutId } = this.pendingCommand;

    this.pendingCommand = null;

    clearTimeout(timeoutId);
    resolve();
  }

  rejectPendingCommand(error) {
    if (!this.pendingCommand) {
      return;
    }

    const { reject, timeoutId } = this.pendingCommand;

    this.pendingCommand = null;

    clearTimeout(timeoutId);
    reject(error);
  }

  async waitUntilIdle() {
    if (!this.serialConnection.isOpen()) {
      throw new Error('Serial port is not open');
    }

    if (this.connection !== 'CONNECTED') {
      throw new Error('Grbl is not connected');
    }

    if (this.idleWaiter) {
      throw new Error('Already waiting for Grbl idle state');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.idleWaiter) {
          return;
        }

        this.idleWaiter = null;

        reject(
          new Error(
            `Grbl did not become idle within ${config.grbl.idleTimeoutMs} ms`
          )
        );
      }, config.grbl.idleTimeoutMs);

      this.idleWaiter = {
        resolve,
        reject,
        timeoutId,
      };

      this.requestStatus();
    });
  }

  resolveIdleWaiterIfReady() {
    if (!this.idleWaiter || this.status !== 'IDLE') {
      return;
    }

    const { resolve, timeoutId } = this.idleWaiter;

    this.idleWaiter = null;

    clearTimeout(timeoutId);
    resolve();
  }

  rejectIdleWaiter(error) {
    if (!this.idleWaiter) {
      return;
    }

    const { reject, timeoutId } = this.idleWaiter;

    this.idleWaiter = null;

    clearTimeout(timeoutId);
    reject(error);
  }

  requestStatus() {
    if (!this.serialConnection.isOpen()) {
      return;
    }

    try {
      this.serialConnection.write('?');
    } catch (error) {
      this.handleCommunicationLoss(error);
    }
  }

  startStatusPolling() {
    if (this.statusIntervalId) {
      return;
    }

    this.requestStatus();

    this.statusIntervalId = setInterval(() => {
      this.requestStatus();
    }, config.grbl.statusIntervalMs);
  }

  stopStatusPolling() {
    if (!this.statusIntervalId) {
      return;
    }

    clearInterval(this.statusIntervalId);
    this.statusIntervalId = null;
  }

  startStartupTimeout() {
    this.stopStartupTimeout();

    this.startupTimeoutId = setTimeout(() => {
      if (this.connection !== 'CONNECTING') {
        return;
      }

      this.handleCommunicationLoss(
        new Error(
          `Grbl did not respond within ${config.grbl.startupTimeoutMs} ms`
        )
      );
    }, config.grbl.startupTimeoutMs);
  }

  stopStartupTimeout() {
    if (!this.startupTimeoutId) {
      return;
    }

    clearTimeout(this.startupTimeoutId);
    this.startupTimeoutId = null;
  }

  resetStatusTimeout() {
    this.stopStatusTimeout();

    this.statusTimeoutId = setTimeout(() => {
      if (this.connection !== 'CONNECTED') {
        return;
      }

      this.handleCommunicationLoss(
        new Error(
          `Grbl communication lost after ${config.grbl.statusTimeoutMs} ms without status response`
        )
      );
    }, config.grbl.statusTimeoutMs);
  }

  stopStatusTimeout() {
    if (!this.statusTimeoutId) {
      return;
    }

    clearTimeout(this.statusTimeoutId);
    this.statusTimeoutId = null;
  }

  startThermalMonitoring() {
    if (this.thermalIntervalId) {
      return;
    }

    void this.updateThermalSensors();

    this.thermalIntervalId = setInterval(() => {
      void this.updateThermalSensors();
    }, THERMAL_POLLING_INTERVAL_MS);
  }

  stopThermalMonitoring() {
    if (!this.thermalIntervalId) {
      return;
    }

    clearInterval(this.thermalIntervalId);
    this.thermalIntervalId = null;
  }

  async updateThermalSensors() {
    try {
      const thermalData = await readThermalSensors();

      if (this.connection !== 'CONNECTED') {
        return;
      }

      this.driverTemp = thermalData.driverTemp;
      this.humidity = thermalData.humidity;

      this.notifyStateChange();
    } catch (error) {
      if (this.connection !== 'CONNECTED') {
        return;
      }

      this.driverTemp = null;
      this.humidity = null;

      logError('Machine', `Thermal sensor reading failed: ${error.message}`);

      this.notifyStateChange();
    }
  }

  stopTimers() {
    this.stopStatusPolling();
    this.stopStartupTimeout();
    this.stopStatusTimeout();
    this.stopThermalMonitoring();
  }

  handleCommunicationLoss(error) {
    if (this.connection === 'DISCONNECTED') {
      return;
    }

    this.rejectPendingCommand(error);
    this.rejectIdleWaiter(error);
    this.stopTimers();

    this.connection = 'DISCONNECTED';
    this.resetMachineData();

    logError('Machine', `Communication lost: ${error.message}`);

    this.notifyStateChange();
  }

  resetMachineData() {
    this.status = null;
    this.position = null;

    this.feedRate = null;
    this.spindleSpeed = null;

    this.driverTemp = null;
    this.humidity = null;

    this.alarms = [];
  }

  subscribe(listener) {
    this.stateListeners.add(listener);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  notifyStateChange() {
    const state = this.getData();

    this.stateListeners.forEach((listener) => {
      listener(state);
    });
  }

  getData() {
    return {
      source: 'MACHINE',
      connection: this.connection,
      status: this.status,

      position: this.position ? { ...this.position } : null,

      feedRate: this.feedRate,

      // Telemetria somente.
      // Nenhum controle de velocidade do spindle é implementado.
      spindleSpeed: this.spindleSpeed,

      driverTemp: this.driverTemp,
      spindleTemp: null,
      humidity: this.humidity,

      emergency: false,
      lastEmergencyAt: null,
      emergencyCount: 0,

      holdReason: null,

      alarms: this.alarms.map((alarm) => ({
        ...alarm,
      })),

      capabilities: {
        jog: true,
        emergency: false,
      },
    };
  }
}

const cncMachine = new CNCMachine();

export default cncMachine;
