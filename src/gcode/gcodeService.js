import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const gcodeDirectoryPath = path.resolve('data/gcode');
const activeGcodeFilePath = path.join(gcodeDirectoryPath, 'execute.gcode');

const executionStates = Object.freeze({
  NO_FILE: 'NO_FILE',
  READY: 'READY',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
});

const stateListeners = new Set();

let executionState = executionStates.NO_FILE;

async function initialize() {
  const state = await getState();

  notifyStateChange(state);

  return state;
}

async function getState() {
  const loaded = await hasActiveGcodeFile();

  if (!loaded) {
    executionState = executionStates.NO_FILE;
  } else if (executionState === executionStates.NO_FILE) {
    executionState = executionStates.READY;
  }

  return {
    loaded,
    fileName: loaded ? 'execute.gcode' : null,
    executionState,
  };
}

async function hasActiveGcodeFile() {
  try {
    await access(activeGcodeFilePath);
    return true;
  } catch {
    return false;
  }
}

async function saveActiveGcodeFile(fileContent) {
  await mkdir(gcodeDirectoryPath, { recursive: true });
  await writeFile(activeGcodeFilePath, fileContent);

  executionState = executionStates.READY;

  const state = await getState();

  notifyStateChange(state);

  return state;
}

async function markRunning() {
  const loaded = await hasActiveGcodeFile();

  if (!loaded) {
    executionState = executionStates.NO_FILE;
    throw new Error('No G-code program loaded');
  }

  if (executionState === executionStates.RUNNING) {
    throw new Error('G-code program is already running');
  }

  executionState = executionStates.RUNNING;

  const state = await getState();

  notifyStateChange(state);

  return state;
}

async function markCompleted() {
  const loaded = await hasActiveGcodeFile();

  if (!loaded) {
    executionState = executionStates.NO_FILE;
    throw new Error('No G-code program loaded');
  }

  executionState = executionStates.COMPLETED;

  const state = await getState();

  notifyStateChange(state);

  return state;
}

function subscribe(listener) {
  stateListeners.add(listener);

  return () => {
    stateListeners.delete(listener);
  };
}

function notifyStateChange(state) {
  stateListeners.forEach((listener) => {
    listener(state);
  });
}

const gcodeService = {
  executionStates,
  initialize,
  getState,
  hasActiveGcodeFile,
  saveActiveGcodeFile,
  markRunning,
  markCompleted,
  subscribe,
};

export default gcodeService;
