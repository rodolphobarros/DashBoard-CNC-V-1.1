const SIMULATOR_STATUS = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  HOLD: 'HOLD',
  ALARM: 'ALARM',
};

function createLifecycle() {
  let status = SIMULATOR_STATUS.IDLE;

  function getStatus() {
    return status;
  }

  function run() {
    status = SIMULATOR_STATUS.RUN;
  }

  function hold() {
    status = SIMULATOR_STATUS.HOLD;
  }

  function alarm() {
    status = SIMULATOR_STATUS.ALARM;
  }

  function reset() {
    status = SIMULATOR_STATUS.IDLE;
  }

  return {
    getStatus,
    run,
    hold,
    alarm,
    reset,
  };
}

export { SIMULATOR_STATUS, createLifecycle };
