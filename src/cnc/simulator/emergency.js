function createEmergency() {
  let active = false;
  let lastEmergencyAt = null;
  let emergencyCount = 0;

  function activate() {
    if (active) {
      return;
    }

    active = true;
    lastEmergencyAt = new Date().toISOString();
    emergencyCount += 1;
  }

  function reset() {
    active = false;
  }

  function getState() {
    return {
      emergency: active,
      lastEmergencyAt,
      emergencyCount,
    };
  }

  return {
    activate,
    reset,
    getState,
  };
}

export { createEmergency };
