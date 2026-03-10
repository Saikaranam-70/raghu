// src/app.js
// Express application factory.

const express = require("express");
const cors = require("cors");
const config = require("./config");
const logger = require("./logger");

const {
  requestId,
  securityHeaders,
  removeServerHeader,
  rateLimiter,
  requireApiKey,
  auditLog,
  notFound,
  errorHandler,
} = require("./middleware/security");
const studentRoutes = require("./routes/students");
const { admin } = require("googleapis/build/src/apis/admin");
const adminRoutes = require("./routes/admin")

function createApp() {
  const app = express();

  // ── Body parsing ─────────────────────────────────────────

  app.use(express.json({ limit: "10kb" }));   // limit body size

  // ── Security middleware (order matters) ──────────────────
  app.use(removeServerHeader);
  app.use(securityHeaders);
  app.use(requestId);
  app.use(auditLog);
  app.use(rateLimiter);

  // ── CORS ─────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.isProduction
        ? (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim())
        : "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["X-API-Key", "Content-Type", "Authorization"],
    })
  );

  // ── Health check (public, no API key needed) ─────────────
  app.get("/health", (req, res) => {
    const sheets = require("./services/sheetsService");
    res.json({
      status: "ok",
      version: "1.0.0",
      sheets_connected: sheets.isConnected(),
      timestamp: new Date().toISOString(),
    });
  });

  // ── API info (public) ────────────────────────────────────
  app.get("/", (req, res) => {
    res.json({
      name: "Student Attendance API",
      version: "1.0.0",
      authentication: "X-API-Key header required for all /students routes",
      routes: {
        health: "GET /health",
        all_students: "GET /students",
        student_by_pin: "GET /students/:pin",
        student_subjects: "GET /students/:pin/subjects",
        student_summary: "GET /students/:pin/summary",
        student_rank: "GET /students/:pin/rank",
        defaulter_risk: "GET /students/:pin/defaulter-risk",
        specific_subject: "GET /students/:pin/subject/:subject",
        all_defaulters: "GET /students/defaulters?threshold=75",
        subject_defaulters: "GET /students/defaulters/subject/:subject?threshold=75",
        class_stats: "GET /students/class-stats",
      },
    });
  });

  // ── Protected student routes ─────────────────────────────
  // All /students/* routes require a valid API key
  app.use("/students", requireApiKey, studentRoutes);
  app.use("/admin", adminRoutes)

  // ── 404 + error handlers ─────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
