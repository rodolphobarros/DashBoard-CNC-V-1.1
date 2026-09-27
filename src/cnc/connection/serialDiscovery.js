import { SerialPort } from 'serialport';

const SUPPORTED_SERIAL_PATHS = [/^\/dev\/ttyACM\d+$/, /^\/dev\/ttyUSB\d+$/];

function isSupportedSerialPath(path) {
  return SUPPORTED_SERIAL_PATHS.some((pattern) => pattern.test(path));
}

async function listSerialPorts() {
  const ports = await SerialPort.list();

  return ports
    .filter((port) => isSupportedSerialPath(port.path))
    .map((port) => ({
      path: port.path,
      manufacturer: port.manufacturer ?? null,
      serialNumber: port.serialNumber ?? null,
      vendorId: port.vendorId ?? null,
      productId: port.productId ?? null,
    }));
}

export { isSupportedSerialPath, listSerialPorts };
