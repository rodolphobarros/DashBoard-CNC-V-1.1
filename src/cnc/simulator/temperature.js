const TEMPERATURE_LIMITS = {
  driver: {
    min: 30,
    max: 80,
    alarm: 70,
  },
  spindle: {
    min: 30,
    max: 90,
    alarm: 80,
  },
};

function createTemperature() {
  let driverTemperature = 35;
  let spindleTemperature = 40;

  function getTemperatures() {
    return {
      driverTemp: driverTemperature,
      spindleTemp: spindleTemperature,
    };
  }

  function update() {
    driverTemperature = Math.min(
      TEMPERATURE_LIMITS.driver.max,
      driverTemperature + 0.1
    );

    spindleTemperature = Math.min(
      TEMPERATURE_LIMITS.spindle.max,
      spindleTemperature + 0.1
    );

    return getTemperatures();
  }

  function getAlarms() {
    const alarms = [];

    if (driverTemperature >= TEMPERATURE_LIMITS.driver.alarm) {
      alarms.push({
        code: 'DRIVER_OVER_TEMPERATURE',
        message: 'Temperatura do driver acima do limite',
      });
    }

    if (spindleTemperature >= TEMPERATURE_LIMITS.spindle.alarm) {
      alarms.push({
        code: 'SPINDLE_OVER_TEMPERATURE',
        message: 'Temperatura do spindle acima do limite',
      });
    }

    return alarms;
  }

  function hasAlarm() {
    return getAlarms().length > 0;
  }

  function reset() {
    driverTemperature = 35;
    spindleTemperature = 40;
  }

  return {
    getTemperatures,
    update,
    getAlarms,
    hasAlarm,
    reset,
  };
}

export { TEMPERATURE_LIMITS, createTemperature };
