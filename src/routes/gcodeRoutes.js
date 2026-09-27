import { Router } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const router = Router();

const gcodeDirectoryPath = path.resolve('data/gcode');
const activeGcodeFilePath = path.join(gcodeDirectoryPath, 'execute.gcode');

router.post('/upload', expressRawGcode(), async (request, response, next) => {
  try {
    await mkdir(gcodeDirectoryPath, { recursive: true });
    await writeFile(activeGcodeFilePath, request.body);

    response.json({
      success: true,
      fileName: 'execute.gcode',
    });
  } catch (error) {
    next(error);
  }
});

function expressRawGcode() {
  return (request, response, next) => {
    const chunks = [];

    request.on('data', (chunk) => {
      chunks.push(chunk);
    });

    request.on('end', () => {
      request.body = Buffer.concat(chunks);
      next();
    });

    request.on('error', next);
  };
}

export default router;
