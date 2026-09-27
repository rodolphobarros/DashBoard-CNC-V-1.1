const initialState = {
  source: null,
  connection: 'DISCONNECTED',
  status: null,

  position: null,

  feedRate: null,
  spindleSpeed: null,

  driverTemp: null,
  spindleTemp: null,

  emergency: false,
  lastEmergencyAt: null,
  emergencyCount: 0,

  holdReason: null,
  alarms: [],

  capabilities: {
    jog: false,
    emergency: false,
  },
};

let state = structuredClone(initialState);

function getState() {
  return structuredClone(state);
}

function updateState(stateUpdate) {
  state = {
    ...state,
    ...stateUpdate,
    capabilities: {
      ...state.capabilities,
      ...stateUpdate.capabilities,
    },
  };

  return getState();
}

function resetState() {
  state = structuredClone(initialState);

  return getState();
}

export { getState, updateState, resetState };
