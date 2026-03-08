// src/utils/logger.js
// Structured logger. Masks sensitive data before writing.

const { createLogger, format, transports } = require("winston");
const config = require('./config');

// Mask registration numbers in log messages (last 4 chars → ****)
function maskPin(message) {
  if (typeof message !== "string") return message;
  // Matches reg numbers like 24981A05PS — alphanumeric 6-20 chars
  return message.replace(/\b([A-Z0-9]{4})[A-Z0-9]{2,16}\b/g, "$1****");
}

const maskingFormat = format((info) => {
  info.message = maskPin(info.message);
  if (info.path) info.path = maskPin(info.path);
  return info;
});

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    maskingFormat(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    config.isProduction
      ? format.json()
      : format.combine(format.colorize(), format.simple())
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
