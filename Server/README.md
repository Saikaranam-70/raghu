# Student Attendance API — Node.js + Express

Secure REST API that reads student attendance from your Google Sheet.

---

## All Available Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | API health check *(public)* |
| GET | `/` | List all routes *(public)* |
| GET | `/students` | All students with full data |
| GET | `/students/:pin` | One student by registration number |
| GET | `/students/:pin/subjects` | Subject-wise attendance |
| GET | `/students/:pin/summary` | Quick summary + defaulter status |
| GET | `/students/:pin/rank` | Class rank by attendance |
| GET | `/students/:pin/defaulter-risk` | Classes needed to reach 75% |
| GET | `/students/:pin/subject/:subject` | Single subject detail |
| GET | `/students/defaulters` | All students below 75% |
| GET | `/students/defaulters/subject/:subject` | Subject-wise defaulters |
| GET | `/students/class-stats` | Overall class statistics |

All `/students/*` routes require `X-API-Key` header.

---

## Setup (Step by Step)

### 1. Install Node.js
Download from https://nodejs.org (get LTS version — 20 or 22)

Verify:
```bash
node --version   # should show v20.x or higher
npm --version
```

### 2. Install dependencies
```bash
cd student_api_node
npm install
```

### 3. Set up Google Sheets access

**a) Create a Service Account:**
1. Go to https://console.cloud.google.com
2. Create a project (or select existing)
3. Go to **APIs & Services → Library** → enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Name it anything (e.g. `attendance-reader`)
6. Click Done (skip role assignment)
7. Click the service account → **Keys → Add Key → JSON**
8. Save the file as `secrets/service_account.json` in this folder

**b) Share your Google Sheet:**
1. Open your Google Sheet
2. Click **Share** (top right)
3. Paste the service account email (from the JSON file, field `client_email`)
4. Set role to **Viewer** ← very important, read-only!
5. Click Share

### 4. Configure .env
```bash
# Copy the example file
cp .env.example .env
```

Open `.env` and fill in:

```env
# From your Google Sheet URL:
# https://docs.google.com/spreadsheets/d/PUT_THIS_PART/edit
SPREADSHEET_ID=your_sheet_id_here

# Tab name at bottom of your sheet
SHEET_NAME=Sheet1

# Generate a key:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEYS=paste_generated_key_here
```

### 5. Start the server
```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

You should see:
```
🚀  Student Attendance API running on http://localhost:3000
    Sheets connected: true
```

### 6. Test it
```bash
# Health check (no API key needed)
curl http://localhost:3000/health

# Get student by PIN (replace with your API key and student PIN)
curl http://localhost:3000/students/24981A05PS \
  -H "X-API-Key: your_api_key_here"

# All students
curl http://localhost:3000/students \
  -H "X-API-Key: your_api_key_here"

# Defaulters
curl "http://localhost:3000/students/defaulters?threshold=75" \
  -H "X-API-Key: your_api_key_here"
```

### 7. Run tests
```bash
npm test
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| `Missing SPREADSHEET_ID` | Fill in `.env` file |
| `Service account JSON not found` | Save the JSON file to `secrets/service_account.json` |
| `401 Invalid API key` | Pass the correct key in `X-API-Key` header |
| `The caller does not have permission` | Share the sheet with the service account email as **Viewer** |
| `Port 3000 already in use` | Change `PORT=3001` in `.env` |
