import i2c from 'i2c-bus';

const I2C_BUS_NUMBER = 1;
const DHT20_ADDRESS = 0x38;

const STATUS_REGISTER = 0x71;
const MEASUREMENT_COMMAND = Buffer.from([0xac, 0x33, 0x00]);
const MEASUREMENT_DELAY_MS = 80;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseMeasurement(data) {
  const humidityRaw = (data[1] << 12) | (data[2] << 4) | (data[3] >> 4);

  const temperatureRaw = ((data[3] & 0x0f) << 16) | (data[4] << 8) | data[5];

  const humidity = (humidityRaw / 1048576) * 100;
  const temperature = (temperatureRaw / 1048576) * 200 - 50;

  return {
    driverTemp: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
  };
}

async function readThermalSensors() {
  const bus = await i2c.openPromisified(I2C_BUS_NUMBER);

  try {
    const status = await bus.readByte(DHT20_ADDRESS, STATUS_REGISTER);

    if ((status & 0x08) === 0) {
      throw new Error('DHT20 is not initialized');
    }

    await bus.i2cWrite(
      DHT20_ADDRESS,
      MEASUREMENT_COMMAND.length,
      MEASUREMENT_COMMAND
    );

    await wait(MEASUREMENT_DELAY_MS);

    const data = Buffer.alloc(7);

    const { bytesRead } = await bus.i2cRead(DHT20_ADDRESS, data.length, data);

    if (bytesRead !== data.length) {
      throw new Error(
        `Incomplete DHT20 reading: ${bytesRead}/${data.length} bytes`
      );
    }

    return parseMeasurement(data);
  } finally {
    await bus.close();
  }
}

export { readThermalSensors };
