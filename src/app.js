import express from 'express';

import config from './config/config.js';
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
  console.log(`Server started on port ${config.port}`);
});
