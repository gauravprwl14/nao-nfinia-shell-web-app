// Assuming logger.ts exists as per PRD section 5.3
// If it doesn't exist, this will create a basic placeholder.
// In a real scenario, you'd install winston: npm install winston

// Basic placeholder logger if winston isn't set up
const log = (level, message, meta = {}) => {
  console[level](
    `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`,
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : ""
  );
};

// Redact sensitive info placeholder
const redactSensitiveInfo = (obj) => {
  // Basic placeholder - in reality, implement proper redaction
  if (!obj) return obj;
  const newObj = { ...obj };
  if (newObj.token) newObj.token = "[REDACTED]";
  if (newObj.apiSecret) newObj.apiSecret = "[REDACTED]";
  if (newObj.publicKey) newObj.publicKey = "[REDACTED]";
  // Add more redaction rules as needed
  return newObj;
};

export const logInfo = (message, meta = {}) => {
  log("info", message, redactSensitiveInfo(meta));
};

export const logError = (message, error, meta = {}) => {
  const errorMeta = {
    ...redactSensitiveInfo(meta),
    error: error instanceof Error ? error.toString() : String(error),
    // stack: error instanceof Error ? error.stack : undefined, // Optional: might be too verbose for console
  };
  log("error", message, errorMeta);
};

// You might want other levels like warn, debug, etc.
export const logWarn = (message, meta = {}) => {
  log("warn", message, redactSensitiveInfo(meta));
};
