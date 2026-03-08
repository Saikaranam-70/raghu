// src/middleware/security.js
// All security middleware in one file.

const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const logger = require("../logger");

// ── 1. Request ID ─────────────────────────────────────────────
function requestId(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader("X-Request-ID", req.requestId);
  next();
}

// ── 2. Security Headers (via Helmet) ─────────────────────────
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: "deny" },
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" },
  hsts: config.isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
});

// Remove server fingerprinting
function removeServerHeader(req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
}

// ── 3. Rate Limiter ───────────────────────────────────────────
const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMinutes * 60 * 1000,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind a proxy, else direct IP
    return (
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.ip ||
      "unknown"
    );
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded — IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests.",
      detail: `Max ${config.rateLimitMaxRequests} requests per ${config.rateLimitWindowMinutes} minutes.`,
      retry_after_seconds: Math.ceil(config.rateLimitWindowMinutes * 60),
    });
  },
  skip: (req) => req.path === "/health", // don't limit health checks
});

// ── 4. API Key Authentication ─────────────────────────────────
// Uses timing-safe comparison to prevent timing attacks.
function requireApiKey(req, res, next) {
  const provided = req.headers["x-api-key"];

  if (!provided) {
    return res.status(401).json({
      error: "Authentication required.",
      detail: "Include your API key in the X-API-Key header.",
    });
  }

  // Check against all valid keys using timing-safe comparison
  const isValid = config.apiKeys.some((validKey) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(provided.padEnd(64)),
        Buffer.from(validKey.padEnd(64))
      );
    } catch {
      return false;
    }
  });

  if (!isValid) {
    logger.warn(`Invalid API key attempt — IP: ${req.ip} — Request: ${req.requestId}`);
    return res.status(401).json({
      error: "Invalid API key.",
    });
  }

  next();
}

// ── 5. Input Sanitiser ────────────────────────────────────────
// Validates PIN format before it ever reaches the service layer.
const PIN_REGEX = /^[A-Z0-9]{6,20}$/;

function validatePin(req, res, next) {
  const pin = (req.params.pin || "").trim().toUpperCase();

  if (!PIN_REGEX.test(pin)) {
    return res.status(422).json({
      error: "Invalid registration number format.",
      detail: "Must be 6–20 uppercase alphanumeric characters.",
    });
  }

  req.params.pin = pin; // normalised
  next();
}

// ── 6. Audit Logger ───────────────────────────────────────────
function auditLog(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("request", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,         // logger masks PIN numbers
      status: res.statusCode,
      duration_ms: Date.now() - start,
      ip: req.ip,
    });
  });

  next();
}

// ── 7. 404 Handler ────────────────────────────────────────────
function notFound(req, res) {
  res.status(404).json({
    error: "Route not found.",
    path: req.path,
    request_id: req.requestId,
  });
}

// ── 8. Global Error Handler ───────────────────────────────────
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error("Unhandled error: " + err.message);
  // Never leak stack traces or internal error details to clients
  res.status(500).json({
    error: "Internal server error.",
    request_id: req.requestId,
  });
}

module.exports = {
  requestId,
  securityHeaders,
  removeServerHeader,
  rateLimiter,
  requireApiKey,
  validatePin,
  auditLog,
  notFound,
  errorHandler,
};
