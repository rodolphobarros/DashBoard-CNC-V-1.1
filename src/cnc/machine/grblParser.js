function parseNumberList(value) {
  return value.split(',').map(Number);
}

function parseStatusReport(line) {
  const content = line.slice(1, -1);
  const fields = content.split('|');

  const statusField = fields.shift();
  const status = statusField.split(':')[0];

  const report = {
    type: 'STATUS',
    raw: line,
    status,
    machinePosition: null,
    workPosition: null,
    workCoordinateOffset: null,
    feedRate: null,
    spindleSpeed: null,
  };

  fields.forEach((field) => {
    const separatorIndex = field.indexOf(':');

    if (separatorIndex === -1) {
      return;
    }

    const name = field.slice(0, separatorIndex);
    const value = field.slice(separatorIndex + 1);

    switch (name) {
      case 'MPos': {
        const [x, y, z] = parseNumberList(value);

        report.machinePosition = {
          x,
          y,
          z,
        };
        break;
      }

      case 'WPos': {
        const [x, y, z] = parseNumberList(value);

        report.workPosition = {
          x,
          y,
          z,
        };
        break;
      }

      case 'WCO': {
        const [x, y, z] = parseNumberList(value);

        report.workCoordinateOffset = {
          x,
          y,
          z,
        };
        break;
      }

      case 'FS': {
        const [feedRate, spindleSpeed] = parseNumberList(value);

        report.feedRate = feedRate;
        report.spindleSpeed = spindleSpeed;
        break;
      }
    }
  });

  return report;
}

function parseGrblLine(line) {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return null;
  }

  if (trimmedLine === 'ok') {
    return {
      type: 'OK',
      raw: trimmedLine,
    };
  }

  if (trimmedLine.startsWith('error:')) {
    return {
      type: 'ERROR',
      raw: trimmedLine,
      code: trimmedLine.slice('error:'.length),
    };
  }

  if (trimmedLine.startsWith('ALARM:')) {
    return {
      type: 'ALARM',
      raw: trimmedLine,
      code: trimmedLine.slice('ALARM:'.length),
    };
  }

  if (trimmedLine.startsWith('<') && trimmedLine.endsWith('>')) {
    return parseStatusReport(trimmedLine);
  }

  return {
    type: 'UNKNOWN',
    raw: trimmedLine,
  };
}

export { parseGrblLine };
