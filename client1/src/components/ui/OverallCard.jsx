// src/components/ui/OverallCard.jsx
import { getPctStatus } from '../../utils/helpers'

export default function OverallCard({ student }) {
  const pct    = student.overall_percentage
  const status = getPctStatus(pct)
  const totalAttended = student.subjects.reduce((a, s) => a + (s.attended || 0), 0)

  const statusText = status === 'ok'
    ? "You're Safe 🔴"
    : status === 'warn'
    ? '⚠️ Low Attendance'
    : '🚨 Critical'

  const icon = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '🚨'

  const canSkip = status === 'ok' && student.total_classes
    ? Math.max(0, Math.floor((totalAttended - 0.75 * student.total_classes) / 0.75))
    : null

  return (
    <div className={`overall-card ${status}`}>
      <div className="overall-badge-wrap">{icon}</div>

      <div className="overall-eyebrow">Overall Attendance</div>

      <div className="overall-pct">
        {pct !== null ? pct : '—'}<span>%</span>
      </div>

      <div className="status-pill">{statusText}</div>

      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${Math.min(pct || 0, 100)}%` }} />
      </div>

      <div className="overall-footer">
        <span>
          Attended {totalAttended} of {student.total_classes || '—'} classes
        </span>
        {canSkip !== null && (
          <span>Can skip ~{canSkip} more (~{Math.ceil(canSkip / 7)} days)</span>
        )}
      </div>
    </div>
  )
}
