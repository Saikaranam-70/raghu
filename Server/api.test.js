// tests/api.test.js
const request = require("supertest");

// ── Mock env before loading app ──────────────────────────────
process.env.SPREADSHEET_ID = "test_sheet_id";
process.env.API_KEYS = "test-api-key-abc123";
process.env.GOOGLE_SERVICE_ACCOUNT_FILE = __filename; // any existing file
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error";

// ── Mock SheetsService ───────────────────────────────────────
const mockStudent = {
  sno: 1,
  regd_no: "24981A05PS",
  name: "AMBALLA JASWANTH",
  subjects: [
    { subject: "UHV", attended: 22, percentage: 66.7, status: "LOW" },
    { subject: "JAVA", attended: 28, percentage: 84.8, status: "OK" },
  ],
  overall_percentage: 75.75,
  attendance_status: "OK",
  total_classes: 279,
};

jest.mock("../src/services/sheetsService", () => ({
  getAllStudents: jest.fn().mockResolvedValue([mockStudent]),
  getStudentByPin: jest.fn().mockResolvedValue(mockStudent),
  getStudentSubjects: jest.fn().mockResolvedValue({ regd_no: "24981A05PS", name: "AMBALLA JASWANTH", subjects: mockStudent.subjects }),
  getStudentSummary: jest.fn().mockResolvedValue({ regd_no: "24981A05PS", name: "AMBALLA JASWANTH", overall_percentage: 75.75, subjects_below_75: [] }),
  getStudentRank: jest.fn().mockResolvedValue({ regd_no: "24981A05PS", rank: 1, total_students: 10 }),
  getDefaulters: jest.fn().mockResolvedValue([]),
  getSubjectDefaulters: jest.fn().mockResolvedValue([]),
  getClassStats: jest.fn().mockResolvedValue({ total_students: 78, overall_average: 80.5 }),
  isConnected: jest.fn().mockReturnValue(true),
  validSubjects: ["UHV", "DLACC", "ADSA", "JAVA"],
}));

const createApp = require("../src/app");
const app = createApp();
const API_KEY = "test-api-key-abc123";
const headers = { "X-API-Key": API_KEY };

// ── Tests ────────────────────────────────────────────────────

describe("Health & Root", () => {
  test("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("GET / returns route list", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.routes).toBeDefined();
  });
});

describe("Authentication", () => {
  test("Rejects request with no API key", async () => {
    const res = await request(app).get("/students/24981A05PS");
    expect(res.status).toBe(401);
  });

  test("Rejects request with wrong API key", async () => {
    const res = await request(app).get("/students/24981A05PS").set("X-API-Key", "wrong");
    expect(res.status).toBe(401);
  });

  test("Accepts request with valid API key", async () => {
    const res = await request(app).get("/students/24981A05PS").set(headers);
    expect(res.status).toBe(200);
  });
});

describe("GET /students", () => {
  test("Returns all students", async () => {
    const res = await request(app).get("/students").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(Array.isArray(res.body.students)).toBe(true);
  });
});

describe("GET /students/:pin", () => {
  test("Returns student by valid PIN", async () => {
    const res = await request(app).get("/students/24981A05PS").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.regd_no).toBe("24981A05PS");
  });

  test("Rejects invalid PIN format", async () => {
    const res = await request(app).get("/students/../../hack").set(headers);
    expect([404, 422]).toContain(res.status);
  });

  test("Returns 404 for unknown student", async () => {
    const sheets = require("../src/services/sheetsService");
    sheets.getStudentByPin.mockResolvedValueOnce(null);
    const res = await request(app).get("/students/UNKNOWN99").set(headers);
    expect(res.status).toBe(404);
  });
});

describe("GET /students/:pin/subjects", () => {
  test("Returns subject breakdown", async () => {
    const res = await request(app).get("/students/24981A05PS/subjects").set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.subjects)).toBe(true);
  });
});

describe("GET /students/:pin/summary", () => {
  test("Returns summary", async () => {
    const res = await request(app).get("/students/24981A05PS/summary").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.overall_percentage).toBeDefined();
  });
});

describe("GET /students/:pin/rank", () => {
  test("Returns rank", async () => {
    const res = await request(app).get("/students/24981A05PS/rank").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.rank).toBe(1);
  });
});

describe("GET /students/defaulters", () => {
  test("Returns defaulters list", async () => {
    const res = await request(app).get("/students/defaulters").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.threshold_percentage).toBe(75);
  });

  test("Rejects invalid threshold", async () => {
    const res = await request(app).get("/students/defaulters?threshold=abc").set(headers);
    expect(res.status).toBe(422);
  });
});

describe("GET /students/class-stats", () => {
  test("Returns class statistics", async () => {
    const res = await request(app).get("/students/class-stats").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.total_students).toBeDefined();
  });
});

describe("Security Headers", () => {
  test("Response includes security headers", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["x-request-id"]).toBeDefined();
  });

  test("X-Powered-By header is removed", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
