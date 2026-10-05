import assert from 'node:assert/strict';
import test from 'node:test';

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
