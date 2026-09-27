const config = {
  port: Number(process.env.PORT) || 3000,

  camera: {
    streamUrl: process.env.CAMERA_STREAM_URL || '',
  },

  cnc: {
    serialPort: process.env.CNC_SERIAL_PORT || '/dev/ttyACM0',
  },

  grbl: {
    statusIntervalMs: Number(process.env.GRBL_STATUS_INTERVAL_MS) || 250,
    statusTimeoutMs: Number(process.env.GRBL_STATUS_TIMEOUT_MS) || 2000,
    startupTimeoutMs: Number(process.env.GRBL_STARTUP_TIMEOUT_MS) || 5000,
    commandTimeoutMs: Number(process.env.GRBL_COMMAND_TIMEOUT_MS) || 5000,
    idleTimeoutMs: Number(process.env.GRBL_IDLE_TIMEOUT_MS) || 30000,
  },
};

export default config;
