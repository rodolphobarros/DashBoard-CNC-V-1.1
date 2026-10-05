import { logError, logInfo, logWarn } from '../core/util.js';

const socket = io();

function dispatchWindowEvent(name, detail) {
  window.dispatchEvent(
    new CustomEvent(name, {
      detail,
    })
  );
}

function createDisconnectedState() {
  return {
    source: null,
    connection: 'DISCONNECTED',
    status: null,
    emergency: false,
    lastEmergencyAt: null,
    emergencyCount: 0,
    holdReason: null,
    position: null,
    feedRate: null,
    spindleSpeed: null,
    driverTemp: null,
    spindleTemp: null,
    humidity: null,
    alarms: [],
    capabilities: {
      jog: false,
      emergency: false,
    },
  };
}

socket.on('connect', () => {
  logInfo(`[Socket] Server connected: ${socket.id}`);

  dispatchWindowEvent('cnc:server-state', {
    connected: true,
    reason: null,
  });
});

socket.on('disconnect', (reason) => {
  logWarn(`[Socket] Server disconnected: ${reason}`);

  dispatchWindowEvent('cnc:server-state', {
    connected: false,
    reason,
  });

  dispatchWindowEvent('cnc:state', createDisconnectedState());

  dispatchWindowEvent('cnc:jog-lock-state', {
    locked: true,
  });
});

socket.on('connect_error', (error) => {
  logError(`[Socket] Failed to connect to server: ${error.message}`);

  dispatchWindowEvent('cnc:server-state', {
    connected: false,
    reason: error.message,
  });

  dispatchWindowEvent('cnc:state', createDisconnectedState());

  dispatchWindowEvent('cnc:jog-lock-state', {
    locked: true,
  });

  dispatchWindowEvent('cnc:connect-error', {
    message: `Servidor indisponível: ${error.message}`,
  });
});

socket.on('cnc:state', (state) => {
  dispatchWindowEvent('cnc:state', state);
});

socket.on('cnc:jog-lock-state', (state) => {
  dispatchWindowEvent('cnc:jog-lock-state', state);
});

socket.on('gcode:state', (state) => {
  dispatchWindowEvent('gcode:state', state);
});

socket.on('cnc:connect-error', (error) => {
  logError(`[Socket] CNC connection error: ${error?.message ?? error}`);

  dispatchWindowEvent('cnc:connect-error', error);
});

socket.on('cnc:command-result', (result) => {
  const message = `[Socket] ${result?.command}: ${result?.message}`;

  if (result?.ok) {
    logInfo(message);
  } else {
    logWarn(message);
  }

  dispatchWindowEvent('cnc:command-result', result);
});

socket.on('cnc:serial-data', (line) => {
  dispatchWindowEvent('cnc:serial-data', line);
});

function emitCommand(eventName, payload) {
  if (!socket.connected) {
    dispatchWindowEvent('cnc:command-result', {
      ok: false,
      command: eventName,
      message: 'Servidor indisponível',
    });

    return false;
  }

  if (payload === undefined) {
    socket.emit(eventName);
  } else {
    socket.emit(eventName, payload);
  }

  return true;
}

function connectCNC(source) {
  return emitCommand('cnc:connect', { source });
}

function disconnectCNC() {
  return emitCommand('cnc:disconnect');
}

function holdCNC() {
  return emitCommand('cnc:hold');
}

function resumeCNC() {
  return emitCommand('cnc:resume');
}

function lockJog() {
  return emitCommand('cnc:jog-lock');
}

function unlockJog() {
  return emitCommand('cnc:jog-unlock');
}

function jog(axis, direction, step) {
  return emitCommand('cnc:jog', { axis, direction, step });
}

function startGcode() {
  return emitCommand('gcode:start');
}

function emergencyStop() {
  return emitCommand('cnc:emergency');
}

function resetEmergency() {
  return emitCommand('cnc:emergency:reset');
}

export {
  connectCNC,
  disconnectCNC,
  holdCNC,
  resumeCNC,
  lockJog,
  unlockJog,
  jog,
  startGcode,
  emergencyStop,
  resetEmergency,
};

export default socket;
