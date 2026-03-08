// src/config.js
require("dotenv").config();

function required(key) {
  const val = process.env[key];
  if (!val || val.trim() === "") {
    throw new Error(
      `❌ Missing required environment variable: ${key}`
    );
  }
  return val.trim();
}

function optional(key, defaultVal) {
  return process.env[key]?.trim() || defaultVal;
}

// Google credentials from ENV
const serviceAccountJson = required("GOOGLE_SERVICE_ACCOUNT_JSON");

let googleCredentials;

try {
  googleCredentials = JSON.parse(serviceAccountJson);
} catch {
  throw new Error("❌ GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.");
}

// API Keys
const rawApiKeys = required("API_KEYS");
const apiKeys = rawApiKeys.split(",").map((k) => k.trim()).filter(Boolean);

if (apiKeys.length === 0) {
  throw new Error("❌ API_KEYS must contain at least one key.");
}

const config = {
  // Google
  googleCredentials,
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