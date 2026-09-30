function logInfo(message) {
  console.info(`[INFO] ${message}`);
}

function logWarn(message) {
  console.warn(`[WARN] ${message}`);
}

function logError(message) {
  console.error(`[ERROR] ${message}`);
}

function logDebug(message) {
  console.debug(`[DEBUG] ${message}`);
}

export { logInfo, logWarn, logError, logDebug };
