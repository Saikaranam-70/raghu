// // src/services/sheetsService.js
// // Connects to Google Sheets API using a read-only service account.
// // All data is cached in-memory with TTL to avoid hammering the API.
// // The spreadsheet ID is NEVER sent to clients — server-side only.

// const { google } = require("googleapis");
// const NodeCache = require("node-cache");
// const config = require("../config");
// const logger = require("../logger");

// // ── Column positions (0-based) — adjust if your sheet changes ──
// const COL = {
//   sno: 0,
//   regd_no: 1,
//   name: 2,
//   uhv: 3,     uhv_pct: 4,
//   dlacc: 5,   dlacc_pct: 6,
//   adsa: 7,    adsa_pct: 8,
//   java: 9,    java_pct: 10,
//   foss_l: 11, foss_l_pct: 12,
//   dmag: 13,   dmag_pct: 14,
//   pp: 15,     pp_pct: 16,
//   nptel: 17,  nptel_pct: 18,
//   crt: 19,    crt_pct: 20,
//   total: 21,
// };

// const SUBJECTS = [
//   { label: "UHV",    att: "uhv",    pct: "uhv_pct"    },
//   { label: "DLACC",  att: "dlacc",  pct: "dlacc_pct"  },
//   { label: "ADSA",   att: "adsa",   pct: "adsa_pct"   },
//   { label: "JAVA",   att: "java",   pct: "java_pct"   },
//   { label: "FOSS L", att: "foss_l", pct: "foss_l_pct" },
//   { label: "DMAG",   att: "dmag",   pct: "dmag_pct"   },
//   { label: "PP",     att: "pp",     pct: "pp_pct"     },
//   { label: "NPTEL",  att: "nptel",  pct: "nptel_pct"  },
//   { label: "CRT",    att: "crt",    pct: "crt_pct"    },
// ];

// const VALID_SUBJECTS = new Set(SUBJECTS.map((s) => s.label));
// const CACHE_KEY = "all_students";

// // ── Helpers ─────────────────────────────────────────────────────
// function safeInt(v) {
//   const n = parseInt(v, 10);
//   return isNaN(n) ? null : n;
// }

// function safeFloat(v) {
//   const n = parseFloat(v);
//   return isNaN(n) ? null : Math.round(n * 100) / 100;
// }

// function attendanceStatus(pct) {
//   if (pct === null || pct === undefined) return "UNKNOWN";
//   if (pct >= 75) return "OK";
//   if (pct >= 60) return "LOW";
//   return "CRITICAL";
// }

// function rowToStudent(row) {
//   // Pad row so index access never throws
//   const r = [...row, ...Array(30).fill("")];

//   const snoRaw = String(r[COL.sno] ?? "").trim();
//   if (!snoRaw || !/^\d+$/.test(snoRaw)) return null; // skip header / empty

//   const subjects = SUBJECTS.map(({ label, att, pct }) => {
//     const pctVal = safeFloat(String(r[COL[pct]] ?? "").trim());
//     return {
//       subject: label,
//       attended: safeInt(String(r[COL[att]] ?? "").trim()),
//       percentage: pctVal,
//       status: attendanceStatus(pctVal),
//     };
//   });

//   const validPcts = subjects.map((s) => s.percentage).filter((p) => p !== null);
//   const overall =
//     validPcts.length > 0
//       ? Math.round((validPcts.reduce((a, b) => a + b, 0) / validPcts.length) * 100) / 100
//       : null;

//   return {
//     sno: parseInt(snoRaw, 10),
//     regd_no: String(r[COL.regd_no] ?? "").trim(),
//     name: String(r[COL.name] ?? "").trim(),
//     subjects,
//     overall_percentage: overall,
//     attendance_status: attendanceStatus(overall),
//     total_classes: safeInt(String(r[COL.total] ?? "").trim()),
//   };
// }

// // ── SheetsService class ──────────────────────────────────────────
// class SheetsService {
//   constructor() {
//     this._cache = new NodeCache({ stdTTL: config.cacheTtlSeconds, useClones: false });
//     this._sheetsApi = null;
//   }

//   _buildApi() {
//     if (this._sheetsApi) return this._sheetsApi;
//     try {
//       const auth = new google.auth.GoogleAuth({
//         keyFile: config.googleServiceAccountFile,
//         scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
//       });
//       this._sheetsApi = google.sheets({ version: "v4", auth });
//       logger.info("Google Sheets API client initialised.");
//       return this._sheetsApi;
//     } catch (err) {
//       logger.error("Failed to initialise Sheets API client: " + err.message);
//       throw new Error("Could not connect to Google Sheets.");
//     }
//   }

//   async _fetchAllRows() {
//     // Return from cache if valid
//     const cached = this._cache.get(CACHE_KEY);
//     if (cached) {
//       logger.debug("Returning sheet data from cache.");
//       return cached;
//     }

//     logger.info("Cache miss — fetching from Google Sheets API.");
//     try {
//       const api = this._buildApi();
//       const response = await api.spreadsheets.values.get({
//         spreadsheetId: config.spreadsheetId,   // ← never sent to clients
//         range: config.sheetName,
//         valueRenderOption: "UNFORMATTED_VALUE",
//       });

//       const rows = response.data.values || [];
//       // Keep only rows where first column is a number (skip headers)
//       const dataRows = rows.filter(
//         (r) => r && r[0] !== undefined && /^\d+$/.test(String(r[0]).trim())
//       );

//       this._cache.set(CACHE_KEY, dataRows);
//       logger.info(`Fetched ${dataRows.length} student rows from Google Sheets.`);
//       return dataRows;
//     } catch (err) {
//       // Never leak Google API error details to caller
//       logger.error("Google Sheets API error: " + err.message);
//       throw new Error("Failed to read attendance data.");
//     }
//   }

//   // ── Public methods ─────────────────────────────────────────────

//   async getAllStudents() {
//     const rows = await this._fetchAllRows();
//     return rows.map(rowToStudent).filter(Boolean);
//   }

//   async getStudentByPin(pin) {
//     const pinClean = pin.trim().toUpperCase();
//     const rows = await this._fetchAllRows();
//     for (const row of rows) {
//       const regd = String(row[COL.regd_no] ?? "").trim().toUpperCase();
//       if (regd === pinClean) return rowToStudent(row);
//     }
//     return null;
//   }

//   async getStudentSubjects(pin) {
//     const student = await this.getStudentByPin(pin);
//     if (!student) return null;
//     return {
//       regd_no: student.regd_no,
//       name: student.name,
//       subjects: student.subjects,
//     };
//   }

//   async getStudentSummary(pin) {
//     const student = await this.getStudentByPin(pin);
//     if (!student) return null;
//     const lowSubjects = student.subjects
//       .filter((s) => s.percentage !== null && s.percentage < 75)
//       .map((s) => ({ subject: s.subject, percentage: s.percentage }));

//     return {
//       regd_no: student.regd_no,
//       name: student.name,
//       overall_percentage: student.overall_percentage,
//       attendance_status: student.attendance_status,
//       total_classes: student.total_classes,
//       subjects_below_75: lowSubjects,
//       total_subjects_below_75: lowSubjects.length,
//       is_defaulter: student.overall_percentage !== null && student.overall_percentage < 75,
//     };
//   }

//   async getStudentRank(pin) {
//     const all = await this.getAllStudents();
//     const sorted = all
//       .filter((s) => s.overall_percentage !== null)
//       .sort((a, b) => b.overall_percentage - a.overall_percentage);

//     const idx = sorted.findIndex(
//       (s) => s.regd_no.toUpperCase() === pin.trim().toUpperCase()
//     );
//     if (idx === -1) return null;

//     const student = sorted[idx];
//     return {
//       regd_no: student.regd_no,
//       name: student.name,
//       overall_percentage: student.overall_percentage,
//       rank: idx + 1,
//       total_students: sorted.length,
//       percentile: Math.round(((sorted.length - idx) / sorted.length) * 100),
//     };
//   }

//   async getDefaulters(threshold = 75) {
//     const all = await this.getAllStudents();
//     return all.filter(
//       (s) => s.overall_percentage !== null && s.overall_percentage < threshold
//     );
//   }

//   async getSubjectDefaulters(subject, threshold = 75) {
//     const subjectClean = subject.trim().toUpperCase();
//     if (!VALID_SUBJECTS.has(subjectClean)) return null; // null = invalid subject

//     const all = await this.getAllStudents();
//     return all.filter((s) =>
//       s.subjects.some(
//         (sub) =>
//           sub.subject.toUpperCase() === subjectClean &&
//           sub.percentage !== null &&
//           sub.percentage < threshold
//       )
//     );
//   }

//   async getClassStats() {
//     const all = await this.getAllStudents();
//     const withPct = all.filter((s) => s.overall_percentage !== null);
//     if (withPct.length === 0) return null;

//     const percentages = withPct.map((s) => s.overall_percentage);
//     const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
//     const max = Math.max(...percentages);
//     const min = Math.min(...percentages);

//     // Subject-wise averages
//     const subjectStats = SUBJECTS.map(({ label }) => {
//       const vals = all
//         .flatMap((s) => s.subjects)
//         .filter((sub) => sub.subject === label && sub.percentage !== null)
//         .map((sub) => sub.percentage);
//       const subAvg = vals.length
//         ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
//         : null;
//       return { subject: label, average_percentage: subAvg, total_students: vals.length };
//     });

//     return {
//       total_students: all.length,
//       overall_average: Math.round(avg * 100) / 100,
//       highest_attendance: max,
//       lowest_attendance: min,
//       students_above_75: all.filter((s) => s.overall_percentage >= 75).length,
//       students_below_75: all.filter((s) => s.overall_percentage < 75).length,
//       students_below_60: all.filter((s) => s.overall_percentage < 60).length,
//       subject_wise_averages: subjectStats,
//     };
//   }

//   invalidateCache() {
//     this._cache.del(CACHE_KEY);
//     logger.info("Cache invalidated.");
//   }

//   isConnected() {
//     try {
//       this._buildApi();
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   get validSubjects() {
//     return [...VALID_SUBJECTS];
//   }
// }

// // Singleton
// module.exports = new SheetsService();





// src/services/sheetsService.js
// Connects to Google Sheets API using a read-only service account.
// The spreadsheet ID is NEVER sent to clients — server-side only.
// NOTE: No caching — every request fetches live data from Google Sheets.
// NOTE: overall_percentage = total_attended / total_classes * 100 (not subject average)

const { google } = require("googleapis");
const config = require("../config");
const logger = require("../logger");

// ── Column Map (0-based) ──────────────────────────────────────────────────────
//
//  A=0  S.No
//  B=1  Regd. No
//  C=2  Name of the student
//  D=3  [blank / merged separator]
//  E=4  UHV %          ← UHV has no separate attended column in this sheet
//  F=5  DL&CO attended    G=6  DL&CO %
//  H=7  ADSA attended     I=8  ADSA %
//  J=9  JAVA attended     K=10 JAVA %
//  L=11 OSS LA attended   M=12 OSS LA %
//  N=13 DM&GT attended    O=14 DM&GT %
//  P=15 PP attended       Q=16 PP %
//  R=17 NPTEL attended    S=18 NPTEL %
//  T=19 CRT attended      U=20 CRT %
//  V=21 TOTAL attended (student row) / TOTAL classes (totals row)
//
// ─────────────────────────────────────────────────────────────────────────────

const COL = {
  sno:     0,
  regd_no: 1,
  name:    2,
  // 3 = blank/merged

  uhv_pct:    4,

  dlacc:  5,  dlacc_pct:  6,
  adsa:   7,  adsa_pct:   8,
  java:   9,  java_pct:  10,
  foss_l: 11, foss_l_pct:12,
  dmag:   13, dmag_pct:  14,
  pp:     15, pp_pct:    16,
  nptel:  17, nptel_pct: 18,
  crt:    19, crt_pct:   20,

  total: 21,
};

const SUBJECTS = [
  { label: "UHV",    attCol: null,     pctCol: "uhv_pct",    totalCol: null     },
  { label: "DL&CO",  attCol: "dlacc",  pctCol: "dlacc_pct",  totalCol: "dlacc"  },
  { label: "ADSA",   attCol: "adsa",   pctCol: "adsa_pct",   totalCol: "adsa"   },
  { label: "JAVA",   attCol: "java",   pctCol: "java_pct",   totalCol: "java"   },
  { label: "OSS LA", attCol: "foss_l", pctCol: "foss_l_pct", totalCol: "foss_l" },
  { label: "DM&GT",  attCol: "dmag",   pctCol: "dmag_pct",   totalCol: "dmag"   },
  { label: "PP",     attCol: "pp",     pctCol: "pp_pct",     totalCol: "pp"     },
  { label: "NPTEL",  attCol: "nptel",  pctCol: "nptel_pct",  totalCol: "nptel"  },
  { label: "CRT",    attCol: "crt",    pctCol: "crt_pct",    totalCol: "crt"    },
];

const VALID_SUBJECTS = new Set(SUBJECTS.map((s) => s.label.toUpperCase()));

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeInt(v) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return isNaN(n) ? null : n;
}

function safeFloat(v) {
  const n = parseFloat(String(v ?? "").trim());
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

function attendanceStatus(pct) {
  if (pct === null || pct === undefined) return "UNKNOWN";
  if (pct >= 75) return "OK";
  if (pct >= 60) return "LOW";
  return "CRITICAL";
}

function isTotalsRow(row) {
  const col0 = String(row[0] ?? "").trim();
  if (/^\d+$/.test(col0) && parseInt(col0, 10) > 0) return false;
  for (let i = 0; i < 5; i++) {
    if (String(row[i] ?? "").trim().toLowerCase().includes("total")) return true;
  }
  return false;
}

function parseTotalClassesRow(row) {
  const r = [...(row || []), ...Array(30).fill("")];
  const result = { grand_total: safeInt(r[COL.total]), bySubject: {} };
  for (const { label, totalCol } of SUBJECTS) {
    result.bySubject[label] = totalCol ? safeInt(r[COL[totalCol]]) : null;
  }
  return result;
}

function rowToStudent(row, classTotals) {
  const r = [...(row || []), ...Array(30).fill("")];
  const snoRaw = String(r[COL.sno] ?? "").trim();
  if (!snoRaw || !/^\d+$/.test(snoRaw)) return null;

  const subjects = SUBJECTS.map(({ label, attCol, pctCol }) => {
    const pctVal = safeFloat(r[COL[pctCol]]);
    return {
      subject:       label,
      attended:      attCol ? safeInt(r[COL[attCol]]) : null,
      total_classes: classTotals?.bySubject[label] ?? null,
      percentage:    pctVal,
      status:        attendanceStatus(pctVal),
    };
  });

  const total_attended = safeInt(r[COL.total]);
  const total_classes  = classTotals?.grand_total ?? null;

  // overall % = total classes attended / total classes held × 100
  const overall_percentage =
    total_attended !== null && total_classes
      ? Math.round((total_attended / total_classes) * 10000) / 100
      : null;

  return {
    sno:                parseInt(snoRaw, 10),
    regd_no:            String(r[COL.regd_no] ?? "").trim(),
    name:               String(r[COL.name]    ?? "").trim(),
    subjects,
    overall_percentage,
    attendance_status:  attendanceStatus(overall_percentage),
    total_attended,
    total_classes,
  };
}

// ── SheetsService ─────────────────────────────────────────────────────────────
class SheetsService {
  constructor() {
    this._sheetsApi = null;
  }

  _buildApi() {
    if (this._sheetsApi) return this._sheetsApi;
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: config.googleServiceAccountFile,
        scopes:  ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      this._sheetsApi = google.sheets({ version: "v4", auth });
      logger.info("Google Sheets API client initialised.");
      return this._sheetsApi;
    } catch (err) {
      logger.error("Failed to initialise Sheets API client: " + err.message);
      throw new Error("Could not connect to Google Sheets.");
    }
  }

  async _fetchSheetData() {
    logger.info("Fetching live data from Google Sheets API.");
    try {
      const api      = this._buildApi();
      const response = await api.spreadsheets.values.get({
        spreadsheetId:     config.spreadsheetId,
        range:             config.sheetName,
        valueRenderOption: "UNFORMATTED_VALUE",
      });

      const rows        = response.data.values || [];
      let   totalRow    = null;
      const studentRows = [];

      for (const row of rows) {
        const col0 = String(row[0] ?? "").trim();
        if (/^\d+$/.test(col0) && parseInt(col0, 10) > 0) {
          studentRows.push(row);
        } else if (!totalRow && isTotalsRow(row)) {
          totalRow = row;
          logger.info(`Totals row detected: [${row.slice(0, 6).join(", ")}...]`);
        }
      }

      const classTotals = totalRow ? parseTotalClassesRow(totalRow) : null;

      if (classTotals) {
        logger.info(
          `Grand total classes: ${classTotals.grand_total} | ` +
          `Per-subject: ${JSON.stringify(classTotals.bySubject)}`
        );
      } else {
        logger.warn(
          "Totals row NOT found — total_classes will be null.\n" +
          rows
            .filter((r) => !/^\d+$/.test(String(r[0] ?? "").trim()))
            .map((r) => JSON.stringify(r.slice(0, 6)))
            .join("\n")
        );
      }

      logger.info(`Fetched ${studentRows.length} student rows.`);
      return { classTotals, studentRows };
    } catch (err) {
      logger.error("Google Sheets API error: " + err.message);
      throw new Error("Failed to read attendance data.");
    }
  }

  async _getAllStudentsParsed() {
    const { classTotals, studentRows } = await this._fetchSheetData();
    return studentRows.map((row) => rowToStudent(row, classTotals)).filter(Boolean);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async getAllStudents() {
    return this._getAllStudentsParsed();
  }

  async getStudentByPin(pin) {
    const pinClean                     = pin.trim().toUpperCase();
    const { classTotals, studentRows } = await this._fetchSheetData();
    for (const row of studentRows) {
      if (String(row[COL.regd_no] ?? "").trim().toUpperCase() === pinClean)
        return rowToStudent(row, classTotals);
    }
    return null;
  }

  async getStudentSubjects(pin) {
    const student = await this.getStudentByPin(pin);
    if (!student) return null;
    return { regd_no: student.regd_no, name: student.name, subjects: student.subjects };
  }

  async getStudentSummary(pin) {
    const student = await this.getStudentByPin(pin);
    if (!student) return null;

    const lowSubjects = student.subjects
      .filter((s) => s.percentage !== null && s.percentage < 75)
      .map(({ subject, attended, total_classes, percentage, status }) =>
        ({ subject, attended, total_classes, percentage, status })
      );

    return {
      regd_no:                 student.regd_no,
      name:                    student.name,
      overall_percentage:      student.overall_percentage,  // total_attended / total_classes * 100
      attendance_status:       student.attendance_status,
      total_attended:          student.total_attended,
      total_classes:           student.total_classes,
      subjects_below_75:       lowSubjects,
      total_subjects_below_75: lowSubjects.length,
      is_defaulter:            student.overall_percentage !== null && student.overall_percentage < 75,
    };
  }

  async getStudentRank(pin) {
    const all    = await this._getAllStudentsParsed();
    const sorted = all
      .filter((s) => s.overall_percentage !== null)
      .sort((a, b) => b.overall_percentage - a.overall_percentage);

    const idx = sorted.findIndex(
      (s) => s.regd_no.toUpperCase() === pin.trim().toUpperCase()
    );
    if (idx === -1) return null;

    const student = sorted[idx];
    return {
      regd_no:            student.regd_no,
      name:               student.name,
      overall_percentage: student.overall_percentage,       // total_attended / total_classes * 100
      rank:               idx + 1,
      total_students:     sorted.length,
      percentile:         Math.round(((sorted.length - idx) / sorted.length) * 100),
    };
  }

  async getDefaulters(threshold = 75) {
    const all = await this._getAllStudentsParsed();
    return all.filter((s) => s.overall_percentage !== null && s.overall_percentage < threshold);
  }

  async getSubjectDefaulters(subject, threshold = 75) {
    const subjectClean = subject.trim().toUpperCase();
    if (!VALID_SUBJECTS.has(subjectClean)) return null;

    const all = await this._getAllStudentsParsed();
    return all.filter((s) =>
      s.subjects.some(
        (sub) =>
          sub.subject.toUpperCase() === subjectClean &&
          sub.percentage !== null &&
          sub.percentage < threshold
      )
    );
  }

  async getClassStats() {
    const all     = await this._getAllStudentsParsed();
    const withPct = all.filter((s) => s.overall_percentage !== null);
    if (withPct.length === 0) return null;

    const percentages = withPct.map((s) => s.overall_percentage);
    const avg         = percentages.reduce((a, b) => a + b, 0) / percentages.length;

    const subjectStats = SUBJECTS.map(({ label }) => {
      const entries   = all.flatMap((s) => s.subjects).filter((s) => s.subject === label);
      const validPcts = entries.filter((e) => e.percentage !== null).map((e) => e.percentage);
      const subAvg    = validPcts.length
        ? Math.round((validPcts.reduce((a, b) => a + b, 0) / validPcts.length) * 100) / 100
        : null;
      return {
        subject:            label,
        total_classes_held: entries.find((e) => e.total_classes !== null)?.total_classes ?? null,
        average_percentage: subAvg,
        students_counted:   validPcts.length,
      };
    });

    return {
      total_students:     all.length,
      overall_average:    Math.round(avg * 100) / 100,
      highest_attendance: Math.max(...percentages),
      lowest_attendance:  Math.min(...percentages),
      students_above_75:  all.filter((s) => s.overall_percentage >= 75).length,
      students_below_75:  all.filter((s) => s.overall_percentage !== null && s.overall_percentage < 75).length,
      students_below_60:  all.filter((s) => s.overall_percentage !== null && s.overall_percentage < 60).length,
      subject_wise_stats: subjectStats,
    };
  }

  async getClassTotals() {
    const { classTotals } = await this._fetchSheetData();
    if (!classTotals) return null;
    return {
      grand_total: classTotals.grand_total,
      subjects: SUBJECTS.map(({ label }) => ({
        subject:       label,
        total_classes: classTotals.bySubject[label] ?? null,
      })),
    };
  }

  isConnected() {
    try { this._buildApi(); return true; } catch { return false; }
  }

  get validSubjects() {
    return [...VALID_SUBJECTS];
  }
}

module.exports = new SheetsService();