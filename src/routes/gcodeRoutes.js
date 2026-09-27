import { Router } from 'express';

import gcodeService from '../gcode/gcodeService.js';

const router = Router();

router.get('/status', async (_request, response, next) => {
  try {
    const state = await gcodeService.getState();

    response.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/upload', expressRawGcode(), async (request, response, next) => {
  try {
    const state = await gcodeService.saveActiveGcodeFile(request.body);

    response.json({
      success: true,
      ...state,
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
