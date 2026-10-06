import { readFile } from 'node:fs/promises';
import path from 'node:path';

import cncService from '../server/services/cncService.js';

const activeGcodeFilePath = path.resolve('data/gcode/execute.gcode');

class GcodeExecutor {
  constructor() {
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  async execute() {
    if (this.running) {
      throw new Error('G-code program is already running');
    }

    this.running = true;

    try {
      const fileContent = await readFile(activeGcodeFilePath, 'utf8');
      const lines = this.prepareLines(fileContent);

      for (const line of lines) {
        await cncService.waitUntilExecutionCanContinue();
        await cncService.sendGcodeLine(line);
      }

      await cncService.waitUntilIdle();
    } finally {
      this.running = false;
    }
  }

  prepareLines(fileContent) {
    return fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith(';'));
  }
}

const gcodeExecutor = new GcodeExecutor();

export default gcodeExecutor;
