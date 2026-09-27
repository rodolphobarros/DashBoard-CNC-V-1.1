function movePosition(position, axisLimits, stepSize, currentSegment) {
  switch (currentSegment) {
    case 0:
      position.x += stepSize;

      if (position.x >= axisLimits.x.max) {
        position.x = axisLimits.x.max;
        currentSegment = 1;
      }
      break;

    case 1:
      position.y += stepSize;

      if (position.y >= axisLimits.y.max) {
        position.y = axisLimits.y.max;
        currentSegment = 2;
      }
      break;

    case 2:
      position.x -= stepSize;

      if (position.x <= axisLimits.x.min) {
        position.x = axisLimits.x.min;
        currentSegment = 3;
      }
      break;

    case 3:
      position.y -= stepSize;

      if (position.y <= axisLimits.y.min) {
        position.y = axisLimits.y.min;
        currentSegment = 0;
      }
      break;
  }

  return currentSegment;
}

export { movePosition };
