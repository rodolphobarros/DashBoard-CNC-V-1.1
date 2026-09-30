import express from 'express';

import config from './config/config.js';
import { logInfo } from './core/logger.js';
import gcodeRoutes from './routes/gcodeRoutes.js';
import { app, httpServer } from './server/server.js';

app.use(express.static('public'));

app.use('/api/gcode', gcodeRoutes);

app.get('/api/hello', (_request, response) => {
  response.send('Olá, mundo!');
});

app.get('/api/config', (_request, response) => {
  response.json({
    cameraStreamUrl: config.camera.streamUrl,
  });
});

httpServer.listen(config.port, '0.0.0.0', () => {
  logInfo('Server', `Started on port ${config.port}`);
});
