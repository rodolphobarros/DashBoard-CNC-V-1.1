import { getState, resetState, updateState } from '../../cnc/cncState.js';
import { logError } from '../../core/logger.js';

import cncMachine from '../../cnc/machine/cncMachine.js';
import cncSimulator from '../../cnc/simulator/cncSimulator.js';

class CNCService {
  constructor() {
    this.activeSource = null;
    this.machineUnsubscribe = null;
    this.stateListeners = new Set();

    // JOG starts locked for safety.
    this.jogLocked = true;
  }

  getState() {
    return getState();
  }

  isJogLocked() {
    return this.jogLocked;
  }

  lockJog() {
    this.jogLocked = true;

    return this.jogLocked;
  }

  unlockJog() {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('JOG can only be unlocked for the real machine');
    }

    const state = this.getState();

    if (state.connection !== 'CONNECTED') {
      throw new Error(
        'JOG cannot be unlocked while the machine is disconnected'
      );
    }

    if (state.status !== 'IDLE') {
      throw new Error(`JOG cannot be unlocked while Grbl is ${state.status}`);
    }

    this.jogLocked = false;

    return this.jogLocked;
  }

  async connect(source) {
    if (source !== 'SIMULATOR' && source !== 'MACHINE') {
      throw new Error(`Unsupported CNC source: ${source}`);
    }

    await this.disconnect();

    this.activeSource = source;

    if (source === 'SIMULATOR') {
      cncSimulator.start((simulatorData) => {
        if (this.activeSource !== 'SIMULATOR') {
          return;
        }

        const state = updateState(simulatorData);
        this.notifyStateChange(state);
      });

      const state = updateState({
        source,
        connection: 'CONNECTED',
      });

      this.notifyStateChange(state);
      return state;
    }

    this.machineUnsubscribe = cncMachine.subscribe((machineData) => {
      if (this.activeSource !== 'MACHINE') {
        return;
      }

      const state = updateState(machineData);
      this.notifyStateChange(state);
    });

    try {
      const machineData = await cncMachine.open();
      const state = updateState(machineData);
      this.notifyStateChange(state);
      return state;
    } catch (error) {
      this.unsubscribeMachine();
      this.activeSource = null;
      this.lockJog();

      const state = resetState();
      this.notifyStateChange(state);

      throw error;
    }
  }

  async disconnect() {
    const source = this.activeSource;
    this.activeSource = null;

    // A new connection must never inherit an unlocked JOG state.
    this.lockJog();

    if (source === 'SIMULATOR') {
      cncSimulator.stop();
    }

    if (source === 'MACHINE') {
      this.unsubscribeMachine();

      try {
        await cncMachine.close();
      } catch (error) {
        logError(
          'CNCService',
          `Failed to close machine connection: ${error.message}`
        );
      }
    } else {
      this.unsubscribeMachine();
    }

    const state = resetState();
    this.notifyStateChange(state);

    return state;
  }

  async sendGcodeLine(line) {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('No CNC machine connected');
    }

    return cncMachine.sendGcodeLine(line);
  }

  async waitUntilIdle() {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('No CNC machine connected');
    }

    return cncMachine.waitUntilIdle();
  }

  async waitUntilExecutionCanContinue() {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('No CNC machine connected');
    }

    const evaluateState = (state) => {
      if (state.connection !== 'CONNECTED') {
        throw new Error('CNC communication lost during G-code execution');
      }

      if (state.emergency) {
        throw new Error('G-code execution interrupted by emergency');
      }

      if (state.status === 'ALARM') {
        throw new Error('G-code execution interrupted by Grbl ALARM');
      }

      return state.status !== 'HOLD';
    };

    const currentState = this.getState();

    if (evaluateState(currentState)) {
      return currentState;
    }

    return new Promise((resolve, reject) => {
      let unsubscribe = null;

      const listener = (state) => {
        try {
          if (!evaluateState(state)) {
            return;
          }

          unsubscribe?.();
          resolve(state);
        } catch (error) {
          unsubscribe?.();
          reject(error);
        }
      };

      unsubscribe = this.subscribe(listener);

      // Recheck after subscribing so a state change cannot be missed
      // between the first check and listener registration.
      try {
        const latestState = this.getState();

        if (evaluateState(latestState)) {
          unsubscribe();
          resolve(latestState);
        }
      } catch (error) {
        unsubscribe();
        reject(error);
      }
    });
  }

  async jog(command) {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('JOG is only available for the real machine');
    }

    if (this.jogLocked) {
      throw new Error('JOG is locked');
    }

    return cncMachine.jog(command);
  }

  hold() {
    if (this.activeSource === 'MACHINE') {
      return cncMachine.hold();
    }

    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No CNC connected');
    }

    cncSimulator.hold();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  resume() {
    if (this.activeSource === 'MACHINE') {
      return cncMachine.resume();
    }

    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No CNC connected');
    }

    cncSimulator.resume();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  emergencyStop() {
    this.lockJog();

    if (this.activeSource === 'MACHINE') {
      return cncMachine.emergencyStop();
    }

    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No CNC connected');
    }

    cncSimulator.activateEmergency();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  resetEmergency() {
    if (this.activeSource === 'MACHINE') {
      return cncMachine.resetEmergency();
    }

    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No CNC connected');
    }

    cncSimulator.resetEmergency();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  unsubscribeMachine() {
    if (!this.machineUnsubscribe) {
      return;
    }

    this.machineUnsubscribe();
    this.machineUnsubscribe = null;
  }

  subscribe(listener) {
    this.stateListeners.add(listener);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  notifyStateChange(state) {
    this.stateListeners.forEach((listener) => {
      listener(state);
    });
  }
}

const cncService = new CNCService();

export default cncService;
