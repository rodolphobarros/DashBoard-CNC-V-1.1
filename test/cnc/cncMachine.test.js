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
