import cncService from '../services/cncService.js';

function registerSocketRouter(socketServer) {
  cncService.subscribe((state) => {
    socketServer.emit('cnc:state', state);
  });

  socketServer.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.emit('cnc:state', cncService.getState());

    socket.on('cnc:connect', async ({ source } = {}) => {
      try {
        console.log(`[Socket] CNC connection requested: ${source}`);

        await cncService.connect(source);

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:connect',
          message: `Connected to ${source}`,
        });
      } catch (error) {
        console.error('[Socket] CNC connection failed:', error.message);

        socket.emit('cnc:connect-error', {
          message: error.message,
        });

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:connect',
          message: error.message,
        });
      }
    });

    socket.on('cnc:disconnect', async () => {
      try {
        console.log('[Socket] CNC disconnection requested');

        await cncService.disconnect();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:disconnect',
          message: 'CNC disconnected',
        });
      } catch (error) {
        console.error('[Socket] CNC disconnection failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:disconnect',
          message: error.message,
        });
      }
    });

    socket.on('cnc:hold', () => {
      try {
        console.log('[Socket] CNC hold requested');

        cncService.hold();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:hold',
          message: 'CNC paused',
        });
      } catch (error) {
        console.error('[Socket] CNC hold failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:hold',
          message: error.message,
        });
      }
    });

    socket.on('cnc:resume', () => {
      try {
        console.log('[Socket] CNC resume requested');

        cncService.resume();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:resume',
          message: 'CNC resumed',
        });
      } catch (error) {
        console.error('[Socket] CNC resume failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:resume',
          message: error.message,
        });
      }
    });

    socket.on('cnc:emergency', () => {
      try {
        console.log('[Socket] Emergency stop requested');

        cncService.emergencyStop();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:emergency',
          message: 'Emergency stop activated',
        });
      } catch (error) {
        console.error('[Socket] Emergency stop failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:emergency',
          message: error.message,
        });
      }
    });

    socket.on('cnc:emergency:reset', () => {
      try {
        console.log('[Socket] Emergency reset requested');

        cncService.resetEmergency();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:emergency:reset',
          message: 'Emergency reset completed',
        });
      } catch (error) {
        console.error('[Socket] Emergency reset failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:emergency:reset',
          message: error.message,
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });
}

export default registerSocketRouter;
