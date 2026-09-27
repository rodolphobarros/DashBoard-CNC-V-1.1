import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const gcodeDirectoryPath = path.resolve('data/gcode');
const activeGcodeFilePath = path.join(gcodeDirectoryPath, 'execute.gcode');

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

  return {
    fileName: 'execute.gcode',
  };
}

const gcodeService = {
  hasActiveGcodeFile,
  saveActiveGcodeFile,
};

export default gcodeService;
