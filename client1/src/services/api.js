// // src/services/api.js
// import axios from 'axios'

// const client = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '',
//   headers: {
//     'X-API-Key': import.meta.env.VITE_API_KEY || '',
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
// })

// client.interceptors.response.use(
//   res => res,
//   err => {
//     const msg =
//       err.response?.data?.error ||
//       err.response?.data?.message ||
//       (err.code === 'ECONNABORTED' ? 'Request timed out.' : 'Network error — is the backend running?')
//     return Promise.reject(new Error(msg))
//   }
// )

// export const api = {
//   getStudent:       pin => client.get(`/students/${pin}`).then(r => r.data),
//   getRank:          pin => client.get(`/students/${pin}/rank`).then(r => r.data),
//   getSummary:       pin => client.get(`/students/${pin}/summary`).then(r => r.data),
//   getDefaulterRisk: pin => client.get(`/students/${pin}/defaulter-risk`).then(r => r.data),
//   getAllStudents:    ()  => client.get('/students').then(r => r.data),
//   getClassStats:    ()  => client.get('/students/class-stats').then(r => r.data),
//   health:           ()  => client.get('/health').then(r => r.data),
// }


// src/services/api.js
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY || '',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

client.interceptors.response.use(
  res => res,
  err => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out.' : 'Network error — is the backend running?')
    return Promise.reject(new Error(msg))
  }
)

export const api = {
  // ── Student ──────────────────────────────────────────────────────────────
  getStudent:       pin => client.get(`/students/${pin}`).then(r => r.data),
  getRank:          pin => client.get(`/students/${pin}/rank`).then(r => r.data),
  getSummary:       pin => client.get(`/students/${pin}/summary`).then(r => r.data),
  getDefaulterRisk: pin => client.get(`/students/${pin}/defaulter-risk`).then(r => r.data),

  // ── Subjects (per student) ───────────────────────────────────────────────
  // GET /students/:pin/subjects
  // Returns { regd_no, name, subjects: [{ subject, attended, total_classes, percentage, status }] }
  getStudentSubjects: pin => client.get(`/students/${pin}/subjects`).then(r => r.data),

  // ── Class-wide ───────────────────────────────────────────────────────────
  getAllStudents:  ()      => client.get('/students').then(r => r.data),
  getClassStats:  ()      => client.get('/students/class-stats').then(r => r.data),
  getClassTotals: ()      => client.get('/students/class-totals').then(r => r.data),

  // GET /students/subject-defaulters/:subject?threshold=75
  // Returns list of students below threshold in that subject
  getSubjectDefaulters: (subject, threshold = 75) =>
    client
      .get(`/students/subject-defaulters/${encodeURIComponent(subject)}`, {
        params: { threshold },
      })
      .then(r => r.data),

  // ── Utility ──────────────────────────────────────────────────────────────
  health: () => client.get('/health').then(r => r.data),
}