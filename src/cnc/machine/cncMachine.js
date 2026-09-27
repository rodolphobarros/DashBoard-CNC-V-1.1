import config from '../../config/config.js';
import { SerialConnection } from '../connection/serialConnection.js';

import { parseGrblLine } from './grblParser.js';

class CNCMachine {
  constructor() {
    this.connection = 'DISCONNECTED';

    this.serialConnection = new SerialConnection();

    this.statusIntervalId = null;
    this.startupTimeoutId = null;
    this.statusTimeoutId = null;

    this.status = null;
    this.position = null;

    this.feedRate = null;
    this.spindleSpeed = null;

    this.alarms = [];

    this.stateListeners = new Set();
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

      console.log(`[Machine] Waiting for Grbl: ${serialPath}`);

      this.startStartupTimeout();
      this.startStatusPolling();

      return this.getData();
    } catch (error) {
      this.stopTimers();

      this.connection = 'DISCONNECTED';
      this.resetMachineData();
      this.notifyStateChange();

      console.error(
        '[Machine] Failed to open serial connection:',
        error.message
      );

      throw error;
    }
  }

  async close() {
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
        console.log('[Machine] Grbl response: OK');
        break;

      case 'ERROR':
        console.error(`[Machine] Grbl error: ${response.code}`);
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

        console.error(`[Machine] Grbl alarm: ${response.code}`);

        this.notifyStateChange();
        break;

      case 'STATUS':
        this.confirmGrblConnection();
        this.resetStatusTimeout();

        this.updateStatus(response);
        this.notifyStateChange();
        break;

      default:
        console.log(`[Machine] Grbl: ${response.raw}`);
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

    console.log('[Machine] Grbl connection confirmed');

    this.notifyStateChange();
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

  stopTimers() {
    this.stopStatusPolling();
    this.stopStartupTimeout();
    this.stopStatusTimeout();
  }

  handleCommunicationLoss(error) {
    if (this.connection === 'DISCONNECTED') {
      return;
    }

    this.stopTimers();

    this.connection = 'DISCONNECTED';

    console.error('[Machine] Communication lost:', error.message);

    this.notifyStateChange();
  }

  resetMachineData() {
    this.status = null;
    this.position = null;

    this.feedRate = null;
    this.spindleSpeed = null;

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

      driverTemp: null,
      spindleTemp: null,

      emergency: false,
      lastEmergencyAt: null,
      emergencyCount: 0,

      holdReason: null,

      alarms: this.alarms.map((alarm) => ({
        ...alarm,
      })),

      capabilities: {
        jog: false,
        emergency: false,
      },
    };
  }
}

const cncMachine = new CNCMachine();

export default cncMachine;
