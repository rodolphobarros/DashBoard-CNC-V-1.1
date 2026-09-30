import { logError, logInfo } from '../../core/logger.js';

import { ReadlineParser, SerialPort } from 'serialport';

const SERIAL_BAUD_RATE = 115200;

class SerialConnection {
  constructor() {
    this.serialPort = null;
    this.lineParser = null;
    this.intentionalClose = false;
  }

  async open(serialPath, handlers = {}) {
    if (this.serialPort) {
      throw new Error('Serial port is already open');
    }

    const { onData, onClose, onError } = handlers;

    const serialPort = new SerialPort({
      path: serialPath,
      baudRate: SERIAL_BAUD_RATE,
      autoOpen: false,
    });

    this.serialPort = serialPort;
    this.intentionalClose = false;

    try {
      await new Promise((resolve, reject) => {
        serialPort.open((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      this.lineParser = serialPort.pipe(
        new ReadlineParser({
          delimiter: '\n',
        })
      );

      this.lineParser.on('data', (line) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return;
        }

        onData?.(trimmedLine);
      });

      serialPort.on('error', (error) => {
        logError('Serial', `Port error: ${error.message}`);

        onError?.(error);
      });

      serialPort.on('close', () => {
        const wasIntentional = this.intentionalClose;

        this.serialPort = null;
        this.lineParser = null;
        this.intentionalClose = false;

        logInfo('Serial', `Port closed: ${serialPath}`);

        if (!wasIntentional) {
          onClose?.();
        }
      });

      logInfo('Serial', `Port opened: ${serialPath} @ ${SERIAL_BAUD_RATE}`);
    } catch (error) {
      this.serialPort = null;
      this.lineParser = null;
      this.intentionalClose = false;

      throw error;
    }
  }

  async close() {
    if (!this.serialPort) {
      return;
    }

    const serialPort = this.serialPort;

    this.intentionalClose = true;

    try {
      if (serialPort.isOpen) {
        await new Promise((resolve, reject) => {
          serialPort.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    } finally {
      this.serialPort = null;
      this.lineParser = null;
      this.intentionalClose = false;
    }
  }

  write(data) {
    if (!this.serialPort?.isOpen) {
      throw new Error('Serial port is not open');
    }

    this.serialPort.write(data, (error) => {
      if (error) {
        logError('Serial', `Failed to write: ${error.message}`);
      }
    });
  }

  isOpen() {
    return this.serialPort?.isOpen === true;
  }
}

export { SerialConnection };
