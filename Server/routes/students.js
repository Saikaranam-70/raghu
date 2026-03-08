// src/routes/students.js
// All student-facing API routes.
// Every route requires a valid X-API-Key header.

const express = require("express");
const router = express.Router();
const sheets = require("../services/sheetsService");
const { validatePin } = require("../middleware/security");
const logger = require("../logger");

// ── Helpers ──────────────────────────────────────────────────
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const VALID_SUBJECTS = new Set([
  "UHV", "DLACC", "ADSA", "JAVA", "FOSS L", "DMAG", "PP", "NPTEL", "CRT",
]);


// ════════════════════════════════════════════════════════════
//   GET /students
//   Returns full attendance data for ALL students.
// ════════════════════════════════════════════════════════════
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const students = await sheets.getAllStudents();
    res.json({
      total: students.length,
      students,
    });
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/class-stats
//   Overall class attendance statistics.
//   (Must be defined BEFORE /:pin to avoid route conflict)
// ════════════════════════════════════════════════════════════
router.get(
  "/class-stats",
  asyncHandler(async (req, res) => {
    const stats = await sheets.getClassStats();
    if (!stats) {
      return res.status(503).json({ error: "Could not compute statistics." });
    }
    res.json(stats);
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/defaulters?threshold=75
//   All students below overall attendance threshold.
// ════════════════════════════════════════════════════════════
router.get(
  "/defaulters",
  asyncHandler(async (req, res) => {
    const threshold = parseFloat(req.query.threshold ?? "75");
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      return res.status(422).json({
        error: "Invalid threshold. Must be a number between 0 and 100.",
      });
    }
    const defaulters = await sheets.getDefaulters(threshold);
    res.json({
      threshold_percentage: threshold,
      total_defaulters: defaulters.length,
      students: defaulters,
    });
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/defaulters/subject/:subject?threshold=75
//   Defaulters in a specific subject.
// ════════════════════════════════════════════════════════════
router.get(
  "/defaulters/subject/:subject",
  asyncHandler(async (req, res) => {
    const subject = req.params.subject.trim().toUpperCase();
    const threshold = parseFloat(req.query.threshold ?? "75");

    if (!VALID_SUBJECTS.has(subject)) {
      return res.status(422).json({
        error: `Unknown subject: "${subject}".`,
        valid_subjects: [...VALID_SUBJECTS],
      });
    }
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      return res.status(422).json({ error: "Invalid threshold value." });
    }

    const defaulters = await sheets.getSubjectDefaulters(subject, threshold);
    res.json({
      subject,
      threshold_percentage: threshold,
      total_defaulters: defaulters.length,
      students: defaulters,
    });
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin
//   Full attendance record for a single student by PIN.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin",
  validatePin,
  asyncHandler(async (req, res) => {
    const student = await sheets.getStudentByPin(req.params.pin);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    res.json(student);
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin/subjects
//   Subject-wise attendance breakdown for a student.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin/subjects",
  validatePin,
  asyncHandler(async (req, res) => {
    const data = await sheets.getStudentSubjects(req.params.pin);
    if (!data) return res.status(404).json({ error: "Student not found." });
    res.json(data);
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin/summary
//   Quick overview — overall %, status, low subjects.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin/summary",
  validatePin,
  asyncHandler(async (req, res) => {
    const data = await sheets.getStudentSummary(req.params.pin);
    if (!data) return res.status(404).json({ error: "Student not found." });
    res.json(data);
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin/rank
//   Student's attendance rank within the class.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin/rank",
  validatePin,
  asyncHandler(async (req, res) => {
    const data = await sheets.getStudentRank(req.params.pin);
    if (!data) return res.status(404).json({ error: "Student not found." });
    res.json(data);
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin/defaulter-risk
//   Shows how many classes a student needs to attend
//   to reach the 75% threshold in each low subject.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin/defaulter-risk",
  validatePin,
  asyncHandler(async (req, res) => {
    const student = await sheets.getStudentByPin(req.params.pin);
    if (!student) return res.status(404).json({ error: "Student not found." });

    const riskSubjects = student.subjects
      .filter((s) => s.percentage !== null && s.percentage < 75)
      .map((s) => {
        // Classes needed: solve for x where (attended + x) / (total + x) >= 0.75
        let classesNeeded = null;
        if (s.attended !== null && student.total_classes) {
          // x = (0.75 * total - attended) / (1 - 0.75)
          const needed = Math.ceil((0.75 * student.total_classes - s.attended) / 0.25);
          classesNeeded = needed > 0 ? needed : 0;
        }
        return {
          subject: s.subject,
          current_percentage: s.percentage,
          status: s.status,
          classes_needed_to_reach_75: classesNeeded,
        };
      });

    res.json({
      regd_no: student.regd_no,
      name: student.name,
      overall_percentage: student.overall_percentage,
      is_defaulter: student.overall_percentage < 75,
      at_risk_subjects: riskSubjects,
      total_at_risk: riskSubjects.length,
    });
  })
);


// ════════════════════════════════════════════════════════════
//   GET /students/:pin/subject/:subject
//   Attendance details for one specific subject.
// ════════════════════════════════════════════════════════════
router.get(
  "/:pin/subject/:subject",
  validatePin,
  asyncHandler(async (req, res) => {
    const subject = req.params.subject.trim().toUpperCase();

    if (!VALID_SUBJECTS.has(subject)) {
      return res.status(422).json({
        error: `Unknown subject: "${subject}".`,
        valid_subjects: [...VALID_SUBJECTS],
      });
    }

    const student = await sheets.getStudentByPin(req.params.pin);
    if (!student) return res.status(404).json({ error: "Student not found." });

    const subData = student.subjects.find((s) => s.subject === subject);
    if (!subData) return res.status(404).json({ error: "Subject data not found." });

    res.json({
      regd_no: student.regd_no,
      name: student.name,
      subject: subData,
    });
  })
);

module.exports = router;
