import { getState, resetState, updateState } from '../../cnc/cncState.js';

import cncMachine from '../../cnc/machine/cncMachine.js';
import cncSimulator from '../../cnc/simulator/cncSimulator.js';

class CNCService {
  constructor() {
    this.activeSource = null;
    this.machineUnsubscribe = null;
    this.stateListeners = new Set();
  }

  getState() {
    return getState();
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

      const state = resetState();
      this.notifyStateChange(state);

      throw error;
    }
  }

  async disconnect() {
    const source = this.activeSource;
    this.activeSource = null;

    if (source === 'SIMULATOR') {
      cncSimulator.stop();
    }

    if (source === 'MACHINE') {
      this.unsubscribeMachine();

      try {
        await cncMachine.close();
      } catch (error) {
        console.error(
          '[CNCService] Failed to close machine connection:',
          error.message
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

  async jog(command) {
    if (this.activeSource !== 'MACHINE') {
      throw new Error('JOG is only available for the real machine');
    }

    return cncMachine.jog(command);
  }

  hold() {
    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No simulator connected');
    }

    cncSimulator.hold();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  resume() {
    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No simulator connected');
    }

    cncSimulator.resume();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  emergencyStop() {
    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No simulator connected');
    }

    cncSimulator.activateEmergency();

    const state = updateState(cncSimulator.getData());

    this.notifyStateChange(state);

    return state;
  }

  resetEmergency() {
    if (this.activeSource !== 'SIMULATOR') {
      throw new Error('No simulator connected');
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
