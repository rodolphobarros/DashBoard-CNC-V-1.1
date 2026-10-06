import assert from 'node:assert/strict';
import test from 'node:test';

import { resetState, updateState } from '../../src/cnc/cncState.js';
import cncService from '../../src/server/services/cncService.js';

function prepareMachineService(stateUpdate) {
  const originalActiveSource = cncService.activeSource;

  cncService.activeSource = 'MACHINE';

  updateState({
    source: 'MACHINE',
    connection: 'CONNECTED',
    status: 'IDLE',
    emergency: false,
    ...stateUpdate,
  });

  return () => {
    cncService.activeSource = originalActiveSource;
    resetState();
  };
}

test('continues G-code execution immediately while Grbl is RUN', async () => {
  const restore = prepareMachineService({
    status: 'RUN',
  });

  try {
    const state = await cncService.waitUntilExecutionCanContinue();

    assert.equal(state.connection, 'CONNECTED');
    assert.equal(state.status, 'RUN');
  } finally {
    restore();
  }
});

test('waits during HOLD and continues after Grbl returns to RUN', async () => {
  const restore = prepareMachineService({
    status: 'HOLD',
  });

  try {
    const waiting = cncService.waitUntilExecutionCanContinue();

    let settled = false;

    waiting.finally(() => {
      settled = true;
    });

    await Promise.resolve();

    assert.equal(settled, false);

    const state = updateState({
      status: 'RUN',
    });

    cncService.notifyStateChange(state);

    const result = await waiting;

    assert.equal(result.status, 'RUN');
  } finally {
    restore();
  }
});

test('rejects execution wait when communication is lost during HOLD', async () => {
  const restore = prepareMachineService({
    status: 'HOLD',
  });

  try {
    const waiting = cncService.waitUntilExecutionCanContinue();

    const state = updateState({
      connection: 'DISCONNECTED',
      status: null,
    });

    cncService.notifyStateChange(state);

    await assert.rejects(
      waiting,
      /CNC communication lost during G-code execution/
    );
  } finally {
    restore();
  }
});

test('rejects execution wait when Grbl enters ALARM during HOLD', async () => {
  const restore = prepareMachineService({
    status: 'HOLD',
  });

  try {
    const waiting = cncService.waitUntilExecutionCanContinue();

    const state = updateState({
      status: 'ALARM',
    });

    cncService.notifyStateChange(state);

    await assert.rejects(waiting, /G-code execution interrupted by Grbl ALARM/);
  } finally {
    restore();
  }
});

test('rejects execution wait when emergency becomes active during HOLD', async () => {
  const restore = prepareMachineService({
    status: 'HOLD',
  });

  try {
    const waiting = cncService.waitUntilExecutionCanContinue();

    const state = updateState({
      emergency: true,
    });

    cncService.notifyStateChange(state);

    await assert.rejects(waiting, /G-code execution interrupted by emergency/);
  } finally {
    restore();
  }
});
