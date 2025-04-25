/**
 * Logger utility for application-wide logging
 * @module logger
 */

// Assuming logger.ts exists as per PRD section 5.3
// If it doesn't exist, this will create a basic placeholder.
// In a real scenario, you'd install winston: npm install winston

// Define valid log levels for TypeScript safety
type LogLevel = "info" | "error" | "warn" | "debug" | "log";

/**
 * Basic placeholder logger
 * @description Logs messages to console with timestamp and level formatting
 * @param {LogLevel} level - The log level
 * @param {string} message - Message to be logged
 * @param {Record<string, any>} meta - Additional metadata to include in the log
 */
const log = (
  level: LogLevel,
  message: string,
  meta: Record<string, unknown> = {}
) => {
  console[level](
    `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`,
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : ""
  );
};

// Redact sensitive info placeholder
const redactSensitiveInfo = (obj: Record<string, unknown>) => {
  // Basic placeholder - in reality, implement proper redaction
  if (!obj) return obj;
  const newObj = { ...obj };
  if (newObj.token) newObj.token = "[REDACTED]";
  if (newObj.apiSecret) newObj.apiSecret = "[REDACTED]";
  if (newObj.publicKey) newObj.publicKey = "[REDACTED]";
  // Add more redaction rules as needed
  return newObj;
};

export const logInfo = (
  message: string,
  meta: Record<string, unknown> = {}
) => {
  log("info", message, redactSensitiveInfo(meta));
};

export const logError = (
  message: string,
  error: unknown,
  meta: Record<string, unknown> = {}
) => {
  const errorMeta = {
    ...redactSensitiveInfo(meta),
    error: error instanceof Error ? error.toString() : String(error),
    // stack: error instanceof Error ? error.stack : undefined, // Optional: might be too verbose for console
  };
  log("error", message, errorMeta);
};

// You might want other levels like warn, debug, etc.
export const logWarn = (
  message: string,
  meta: Record<string, unknown> = {}
) => {
  log("warn", message, redactSensitiveInfo(meta));
};
