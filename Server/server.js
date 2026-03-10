// src/server.js
// Entry point — starts the HTTP server.

const createApp = require("./app");
const config = require("./config");
const logger = require("./logger");
const mongoose = require("mongoose");

const app = createApp();

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("MongoDB Connected Successfully")
}).catch((err)=>console.log("Mongo Error :", err))

const server = app.listen(config.port, () => {
  logger.info(`🚀  Student Attendance API running on http://localhost:${config.port}`);
  logger.info(`    Environment : ${config.nodeEnv}`);
  logger.info(`    Sheet       : ${config.sheetName}`);
  logger.info(`    Cache TTL   : ${config.cacheTtlSeconds}s`);
  logger.info(`    Rate limit  : ${config.rateLimitMaxRequests} req / ${config.rateLimitWindowMinutes}min`);
  logger.info(`    API docs    : http://localhost:${config.port}/`);
});

// ── Graceful shutdown ────────────────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully.`);
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ── Catch unhandled errors (don't crash silently) ────────────
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception: " + err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection: " + reason);
  process.exit(1);
});

module.exports = server;
