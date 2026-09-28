import gcodeService from '../../gcode/gcodeService.js';
import cncService from '../services/cncService.js';

function registerSocketRouter(socketServer) {
  cncService.subscribe((state) => {
    socketServer.emit('cnc:state', state);
  });

  gcodeService.subscribe((state) => {
    socketServer.emit('gcode:state', state);
  });

  socketServer.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.emit('cnc:state', cncService.getState());

    void gcodeService.getState().then((state) => {
      socket.emit('gcode:state', state);
    });

    socket.on('cnc:jog', async (command) => {
      try {
        const allowedAxes = new Set(['x', 'y', 'z']);
        const allowedSteps = new Set([0.1, 1, 10]);

        if (!command || typeof command !== 'object') {
          throw new Error('Invalid JOG command');
        }

        const { axis, direction, step } = command;

        if (!allowedAxes.has(axis)) {
          throw new Error('Invalid JOG axis');
        }

        if (direction !== 1 && direction !== -1) {
          throw new Error('Invalid JOG direction');
        }

        if (!allowedSteps.has(step)) {
          throw new Error('Invalid JOG step');
        }

        const isGcodeLoaded = await gcodeService.hasActiveGcodeFile();

        if (isGcodeLoaded) {
          throw new Error('JOG blocked while a G-code program is loaded');
        }

        await cncService.jog({ axis, direction, step });

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:jog',
        });
      } catch (error) {
        console.error('[Socket] CNC jog rejected:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:jog',
          message: error.message,
        });
      }
    });

    socket.on('gcode:start', async () => {
      try {
        const state = await gcodeService.executeActiveGcode();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'gcode:start',
          state,
        });
      } catch (error) {
        console.error('[Socket] G-code execution failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'gcode:start',
          message: error.message,
        });
      }
    });

    socket.on('cnc:connect', async ({ source }) => {
      try {
        const state = await cncService.connect(source);

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:connect',
          state,
        });
      } catch (error) {
        console.error('[Socket] CNC connect failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:connect',
          message: error.message,
        });
      }
    });

    socket.on('cnc:disconnect', async () => {
      try {
        const state = await cncService.disconnect();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:disconnect',
          state,
        });
      } catch (error) {
        console.error('[Socket] CNC disconnect failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:disconnect',
          message: error.message,
        });
      }
    });

    socket.on('cnc:hold', () => {
      try {
        const state = cncService.hold();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:hold',
          state,
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
        const state = cncService.resume();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:resume',
          state,
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
        const state = cncService.emergencyStop();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:emergency',
          state,
        });
      } catch (error) {
        console.error('[Socket] CNC emergency failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:emergency',
          message: error.message,
        });
      }
    });

    socket.on('cnc:emergency:reset', () => {
      try {
        const state = cncService.resetEmergency();

        socket.emit('cnc:command-result', {
          ok: true,
          command: 'cnc:emergency:reset',
          state,
        });
      } catch (error) {
        console.error('[Socket] CNC emergency reset failed:', error.message);

        socket.emit('cnc:command-result', {
          ok: false,
          command: 'cnc:emergency:reset',
          message: error.message,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

export default registerSocketRouter;
