import { Router } from 'express';

import gcodeService from '../gcode/gcodeService.js';

const router = Router();

router.get('/status', async (_request, response, next) => {
  try {
    const loaded = await gcodeService.hasActiveGcodeFile();

    response.json({
      loaded,
      fileName: loaded ? 'execute.gcode' : null,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', expressRawGcode(), async (request, response, next) => {
  try {
    const activeGcodeFile = await gcodeService.saveActiveGcodeFile(
      request.body
    );

    response.json({
      success: true,
      fileName: activeGcodeFile.fileName,
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
