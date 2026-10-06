import assert from 'node:assert/strict';
import test from 'node:test';

import config from '../../src/config/config.js';
import cncMachine from '../../src/cnc/machine/cncMachine.js';

function createFakeSerialConnection() {
  const writes = [];

  return {
    writes,

    isOpen() {
      return true;
    },

    write(data) {
      writes.push(data);
    },
  };
}

function prepareConnectedMachine() {
  const originalSerialConnection = cncMachine.serialConnection;
  const fakeSerialConnection = createFakeSerialConnection();

  cncMachine.serialConnection = fakeSerialConnection;
  cncMachine.connection = 'CONNECTED';
  cncMachine.pendingCommand = null;

  return {
    fakeSerialConnection,

    restore() {
      cncMachine.rejectPendingCommand(
        new Error('Test cleanup: pending command cancelled')
      );

      cncMachine.serialConnection = originalSerialConnection;
      cncMachine.connection = 'DISCONNECTED';
    },
  };
}

test('rejects pending command when Grbl responds with error:n', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();

  try {
    const commandPromise = cncMachine.sendGcodeLine('INVALID_COMMAND');

    assert.deepEqual(fakeSerialConnection.writes, ['INVALID_COMMAND\n']);

    cncMachine.handleGrblLine('error:20');

    await assert.rejects(commandPromise, /Grbl rejected command with error 20/);

    assert.equal(cncMachine.pendingCommand, null);
  } finally {
    restore();
  }
});

test('rejects a concurrent command while another command awaits Grbl', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();

  try {
    const firstCommandPromise = cncMachine.sendGcodeLine('G0 X1');

    assert.deepEqual(fakeSerialConnection.writes, ['G0 X1\n']);

    await assert.rejects(
      cncMachine.sendGcodeLine('G0 Y1'),
      /Another Grbl command is awaiting response/
    );

    assert.deepEqual(fakeSerialConnection.writes, ['G0 X1\n']);

    cncMachine.handleGrblLine('ok');

    await firstCommandPromise;

    assert.equal(cncMachine.pendingCommand, null);
  } finally {
    restore();
  }
});

test('rejects command when Grbl acknowledgement times out', async () => {
  const originalCommandTimeoutMs = config.grbl.commandTimeoutMs;
  const { fakeSerialConnection, restore } = prepareConnectedMachine();

  config.grbl.commandTimeoutMs = 20;

  try {
    const commandPromise = cncMachine.sendGcodeLine('G0 X1');

    assert.deepEqual(fakeSerialConnection.writes, ['G0 X1\n']);

    await assert.rejects(
      commandPromise,
      /Grbl did not acknowledge command within 20 ms/
    );

    assert.equal(cncMachine.pendingCommand, null);
  } finally {
    config.grbl.commandTimeoutMs = originalCommandTimeoutMs;
    restore();
  }
});

test('sends Grbl Feed Hold realtime command while machine is running', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'RUN';

  try {
    const state = cncMachine.hold();

    assert.deepEqual(fakeSerialConnection.writes, ['!']);
    assert.equal(state.status, 'RUN');
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});

test('rejects Feed Hold when Grbl is not running', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'IDLE';

  try {
    assert.throws(
      () => cncMachine.hold(),
      /Feed hold is not allowed while Grbl is IDLE/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});
test('updates machine status to HOLD from Grbl Hold status report', () => {
  const { restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'RUN';

  try {
    cncMachine.handleGrblLine('<Hold:0|MPos:1.000,2.000,3.000|FS:0,0>');

    assert.equal(cncMachine.status, 'HOLD');
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});
test('sends Grbl Cycle Start realtime command while machine is on HOLD', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'HOLD';

  try {
    const state = cncMachine.resume();

    assert.deepEqual(fakeSerialConnection.writes, ['~']);
    assert.equal(state.status, 'HOLD');
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});

test('rejects resume when Grbl is not on HOLD', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'RUN';

  try {
    assert.throws(
      () => cncMachine.resume(),
      /Resume is not allowed while Grbl is RUN/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});

test('updates machine status to RUN after Grbl resumes from HOLD', () => {
  const { restore } = prepareConnectedMachine();
  const originalStatus = cncMachine.status;

  cncMachine.status = 'HOLD';

  try {
    cncMachine.handleGrblLine('<Run|MPos:1.000,2.000,3.000|FS:60,0>');

    assert.equal(cncMachine.status, 'RUN');
  } finally {
    cncMachine.status = originalStatus;
    restore();
  }
});

test('sends Grbl Soft Reset and activates emergency state', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();

  const originalEmergency = cncMachine.emergency;
  const originalLastEmergencyAt = cncMachine.lastEmergencyAt;
  const originalEmergencyCount = cncMachine.emergencyCount;

  cncMachine.emergency = false;
  cncMachine.lastEmergencyAt = null;
  cncMachine.emergencyCount = 0;

  try {
    const state = cncMachine.emergencyStop();

    assert.deepEqual(fakeSerialConnection.writes, ['\x18']);

    assert.equal(state.emergency, true);
    assert.equal(state.emergencyCount, 1);
    assert.equal(typeof state.lastEmergencyAt, 'string');

    assert.equal(state.capabilities.emergency, true);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.lastEmergencyAt = originalLastEmergencyAt;
    cncMachine.emergencyCount = originalEmergencyCount;
    restore();
  }
});

test('rejects G-code while emergency is active', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;

  cncMachine.emergency = true;

  try {
    await assert.rejects(
      cncMachine.sendGcodeLine('G0 X1'),
      /G-code is not allowed while emergency is active/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    restore();
  }
});

test('rejects G-code while Grbl is in ALARM', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;

  cncMachine.emergency = false;
  cncMachine.status = 'ALARM';

  try {
    await assert.rejects(
      cncMachine.sendGcodeLine('G0 X1'),
      /G-code is not allowed while Grbl is ALARM/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    restore();
  }
});

test('rejects JOG while emergency is active', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;

  cncMachine.emergency = true;
  cncMachine.status = 'IDLE';

  try {
    await assert.rejects(
      cncMachine.jog({
        axis: 'x',
        direction: 1,
        step: 1,
      }),
      /JOG is not allowed while emergency is active/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    restore();
  }
});

test('rejects JOG while Grbl is in ALARM', async () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;

  cncMachine.emergency = false;
  cncMachine.status = 'ALARM';

  try {
    await assert.rejects(
      cncMachine.jog({
        axis: 'x',
        direction: 1,
        step: 1,
      }),
      /JOG is not allowed while Grbl is ALARM/
    );

    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    restore();
  }
});
test('resets emergency while Grbl is IDLE', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;
  const originalLastEmergencyAt = cncMachine.lastEmergencyAt;
  const originalEmergencyCount = cncMachine.emergencyCount;

  cncMachine.emergency = true;
  cncMachine.status = 'IDLE';
  cncMachine.lastEmergencyAt = '2026-10-06T12:00:00.000Z';
  cncMachine.emergencyCount = 1;

  try {
    const state = cncMachine.resetEmergency();

    assert.equal(state.emergency, false);
    assert.equal(state.lastEmergencyAt, '2026-10-06T12:00:00.000Z');
    assert.equal(state.emergencyCount, 1);

    // Resetting the Dashboard emergency must not send anything to Grbl.
    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    cncMachine.lastEmergencyAt = originalLastEmergencyAt;
    cncMachine.emergencyCount = originalEmergencyCount;
    restore();
  }
});

test('resets emergency in ALARM without clearing the Grbl alarm', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;

  cncMachine.emergency = true;
  cncMachine.status = 'ALARM';

  try {
    const state = cncMachine.resetEmergency();

    assert.equal(state.emergency, false);
    assert.equal(state.status, 'ALARM');
    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    restore();
  }
});

test('rejects emergency reset while Grbl is running', () => {
  const { fakeSerialConnection, restore } = prepareConnectedMachine();
  const originalEmergency = cncMachine.emergency;
  const originalStatus = cncMachine.status;

  cncMachine.emergency = true;
  cncMachine.status = 'RUN';

  try {
    assert.throws(
      () => cncMachine.resetEmergency(),
      /Emergency reset is not allowed while Grbl is RUN/
    );

    assert.equal(cncMachine.emergency, true);
    assert.deepEqual(fakeSerialConnection.writes, []);
  } finally {
    cncMachine.emergency = originalEmergency;
    cncMachine.status = originalStatus;
    restore();
  }
});
