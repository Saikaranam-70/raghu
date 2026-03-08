// src/pages/LoginPage.jsx
import { useState } from 'react'

const CAMPUSES = [
  { id: 'rec', label: 'REC — Raghu Engineering College' },
  { id: 'other', label: 'Other Campus' },
]

export default function LoginPage({ onLogin }) {
  const [campus, setCampus]   = useState('rec')
  const [roll, setRoll]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const clean = roll.trim().toUpperCase()
    if (!clean) { setError('Please enter your roll number.'); return }
    if (!/^[A-Z0-9]{6,20}$/.test(clean)) { setError('Invalid format — use alphanumeric only (e.g. 24981A05PS).'); return }

    setLoading(true)
    try {
      await onLogin(clean)
    } catch (err) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo">🎓</div>
        </div>

        {/* Heading */}
        <h1 className="login-heading">Welcome Buddies 👋</h1>
        <p className="login-sub">View your attendance instantly and stay on track.</p>

        <form onSubmit={handleSubmit} noValidate>

          {/* Campus */}
          <div className="field-group">
            <label className="field-label">Select Campus</label>
            <select
              className="field-select"
              value={campus}
              onChange={e => setCampus(e.target.value)}
            >
              {CAMPUSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Roll Number */}
          <div className="field-group">
            <label className="field-label">Enter Roll Number</label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. 24981A05PS"
              value={roll}
              onChange={e => setRoll(e.target.value.toUpperCase())}
              autoComplete="off"
              spellCheck={false}
              maxLength={20}
            />
          </div>

          {/* Inline error */}
          {error && (
            <div className="inline-error">
              <i className="bi bi-exclamation-circle-fill"></i>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn-submit"
            type="submit"
            disabled={loading || !roll.trim()}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm" style={{width:'1rem',height:'1rem',borderWidth:'2px'}} /> Fetching...</>
              : <><i className="bi bi-arrow-right-circle-fill"></i> View Attendance</>
            }
          </button>
        </form>

        <p className="login-footer">
          Enter your roll number to plan for <strong>SUCCESS</strong>
        </p>
      </div>
    </div>
  )
}
