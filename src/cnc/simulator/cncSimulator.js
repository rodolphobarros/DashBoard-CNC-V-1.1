import { createEmergency } from './emergency.js';
import { createLifecycle, SIMULATOR_STATUS } from './lifecycle.js';
import { createTemperature } from './temperature.js';
import { movePosition } from './tick.js';

class CNCSimulator {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };

    this.axisLimits = {
      x: {
        min: 0,
        max: 100,
      },
      y: {
        min: 0,
        max: 100,
      },
      z: {
        min: 0,
        max: 0,
      },
    };

    this.stepSize = 1;
    this.updateIntervalMs = 100;

    this.currentSegment = 0;
    this.intervalId = null;

    this.lifecycle = createLifecycle();
    this.temperature = createTemperature();
    this.emergency = createEmergency();
  }

  start(onUpdate) {
    if (this.intervalId) {
      return;
    }

    this.lifecycle.run();

    this.intervalId = setInterval(() => {
      this.tick();

      onUpdate?.(this.getData());
    }, this.updateIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.lifecycle.reset();
    this.temperature.reset();
  }

  tick() {
    if (this.emergency.getState().emergency) {
      return;
    }

    if (this.lifecycle.getStatus() !== SIMULATOR_STATUS.RUN) {
      return;
    }

    this.currentSegment = movePosition(
      this.position,
      this.axisLimits,
      this.stepSize,
      this.currentSegment
    );

    this.temperature.update();

    if (this.temperature.hasAlarm()) {
      this.lifecycle.alarm();
    }
  }

  hold() {
    if (this.emergency.getState().emergency) {
      return;
    }

    this.lifecycle.hold();
  }

  resume() {
    if (this.emergency.getState().emergency) {
      return;
    }

    if (this.temperature.hasAlarm()) {
      return;
    }

    this.lifecycle.run();
  }

  activateEmergency() {
    this.emergency.activate();
    this.lifecycle.alarm();
  }

  resetEmergency() {
    this.emergency.reset();

    if (this.temperature.hasAlarm()) {
      this.lifecycle.alarm();
      return;
    }

    if (this.intervalId) {
      this.lifecycle.run();
    } else {
      this.lifecycle.reset();
    }
  }

  getData() {
    const temperatures = this.temperature.getTemperatures();
    const temperatureAlarms = this.temperature.getAlarms();
    const emergencyState = this.emergency.getState();

    return {
      source: 'SIMULATOR',
      connection: 'CONNECTED',
      status: this.lifecycle.getStatus(),

      position: {
        ...this.position,
      },

      feedRate: 600,
      spindleSpeed: 12000,

      ...temperatures,
      ...emergencyState,

      holdReason:
        this.lifecycle.getStatus() === SIMULATOR_STATUS.HOLD
          ? 'OPERATOR'
          : null,

      alarms: temperatureAlarms,

      capabilities: {
        jog: false,
        emergency: true,
      },
    };
  }
}

const cncSimulator = new CNCSimulator();

export default cncSimulator;
