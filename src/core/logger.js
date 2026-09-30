function formatMessage(level, scope, message) {
  const timestamp = new Date().toISOString();

  return `[${timestamp}] [${level}] [${scope}] ${message}`;
}

function logInfo(scope, message) {
  console.info(formatMessage('INFO', scope, message));
}

function logWarn(scope, message) {
  console.warn(formatMessage('WARN', scope, message));
}

function logError(scope, message) {
  console.error(formatMessage('ERROR', scope, message));
}

function logDebug(scope, message) {
  console.debug(formatMessage('DEBUG', scope, message));
}

export { logInfo, logWarn, logError, logDebug };
