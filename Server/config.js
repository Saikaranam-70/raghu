// src/config.js
// Loads and validates all environment variables at startup.
// If anything is missing, the server refuses to start.

require("dotenv").config();
const path = require("path");
const fs = require("fs");

function required(key) {
  const val = process.env[key];
  if (!val || val.trim() === "") {
    throw new Error(
      `❌  Missing required environment variable: ${key}\n` +
        `    Copy .env.example → .env and fill in all values.`
    );
  }
  return val.trim();
}

function optional(key, defaultVal) {
  return process.env[key]?.trim() || defaultVal;
}

// ── Validate service account file exists ────────────────
const serviceAccountFile = required("GOOGLE_SERVICE_ACCOUNT_FILE");
const absoluteServiceAccountPath = path.resolve(process.cwd(), serviceAccountFile);
if (!fs.existsSync(absoluteServiceAccountPath)) {
  throw new Error(
    `❌  Service account JSON not found at: ${absoluteServiceAccountPath}\n` +
      `    Download it from Google Cloud Console and place it there.`
  );
}

// ── Parse API keys ───────────────────────────────────────
const rawApiKeys = required("API_KEYS");
const apiKeys = rawApiKeys
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

if (apiKeys.length === 0) {
  throw new Error("❌  API_KEYS must contain at least one key.");
}

// ── Export validated config ──────────────────────────────
const config = {
  // Google
  googleServiceAccountFile: absoluteServiceAccountPath,
  spreadsheetId: required("SPREADSHEET_ID"),
  sheetName: optional("SHEET_NAME", "Sheet1"),

  // API Keys
  apiKeys,

  // Rate limiting
  rateLimitWindowMinutes: parseInt(optional("RATE_LIMIT_WINDOW_MINUTES", "15")),
  rateLimitMaxRequests: parseInt(optional("RATE_LIMIT_MAX_REQUESTS", "100")),

  // Cache
  cacheTtlSeconds: parseInt(optional("CACHE_TTL_SECONDS", "300")),

  // App
  port: parseInt(optional("PORT", "3000")),
  nodeEnv: optional("NODE_ENV", "development"),
  logLevel: optional("LOG_LEVEL", "info"),

  get isProduction() {
    return this.nodeEnv === "production";
  },
};

module.exports = config;
