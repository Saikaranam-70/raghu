// src/components/ui/SubjectDetailCard.jsx
import { useState } from 'react'
import {
  getPctStatus, getPctColor, calcSkipOrNeed,
  generateHistory, getSubjectFullName,
} from '../../utils/helpers'

export default function SubjectDetailCard({ subject, totalClasses }) {
  const [cpd, setCpd] = useState(7)

  const pct    = subject.percentage
  const status = getPctStatus(pct)
  const color  = getPctColor(pct)
  const info   = calcSkipOrNeed(subject.attended, totalClasses, cpd)
  const { absent, history } = generateHistory(subject.attended, totalClasses)
  const fullName = getSubjectFullName(subject.subject)

  const dotClass    = status === 'ok' ? 'dot-ok' : status === 'warn' ? 'dot-warn' : 'dot-danger'
  const pctClass    = status === 'ok' ? 'pct-ok' : status === 'warn' ? 'pct-warn' : 'pct-danger'
  const alertClass  = status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'danger'
  const alertIcon   = status === 'ok' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'

  return (
    <div className="subj-card">

      {/* Header */}
      <div className="subj-card-header">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className={`subj-dot ${dotClass}`} />
          <div>
            <div className="subj-name">{fullName}</div>
            <div className="subj-code">{subject.subject}</div>
          </div>
        </div>
        <div className="subj-pct-right">
          <div className={`subj-pct-val ${pctClass}`}>
            {pct !== null ? `${pct}%` : 'N/A'}
          </div>
          {subject.attended !== null && totalClasses && (
            <div className="subj-pct-lbl">{subject.attended} / {totalClasses} classes</div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="subj-bar-track">
        <div
          className="subj-bar-fill"
          style={{ width: `${Math.min(pct || 0, 100)}%`, background: color }}
        />
      </div>

      {/* Skip / Need alert */}
      {info && (
        <div className={`alert-box ${alertClass}`}>
          <i className={`bi ${alertIcon}`} />
          <div>
            <div>
              {info.type === 'skip'
                ? `Can skip ${info.count} more classes (~${info.days} day${info.days !== 1 ? 's' : ''})`
                : `Need ${info.count} more classes to reach 75% (~${info.days} day${info.days !== 1 ? 's' : ''})`
              }
            </div>
            <div className="alert-sub">
              Based on {cpd} classes/day · 75% minimum requirement
            </div>
          </div>
        </div>
      )}

      {/* Classes per day picker */}
      {/* <div className="cpd-row">
        <span className="cpd-label">Classes per day:</span>
        <div className="cpd-btns">
          {[5, 6, 7, 8].map(n => (
            <button
              key={n}
              className={`cpd-btn ${cpd === n ? 'active' : ''}`}
              onClick={() => setCpd(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div> */}


      {/* {absent.length > 0 && (
        <>
          <div className="section-label">Absent on ({absent.length})</div>
          <div className="chips-row">
            {absent.map((d, i) => (
              <span key={i} className="chip-absent">{d}</span>
            ))}
          </div>
        </>
      )} */}


      {/* {history.length > 0 && (
        <>
          <div className="section-label">Lecture History ({history.length})</div>
          <div className="lh-grid">
            {history.map((h, i) => (
              <div key={i} className={`lh-dot ${h === 'present' ? 'lh-present' : 'lh-absent'}`} />
            ))}
          </div>
          <div className="lh-legend">
            <div className="lh-item">
              <div className="lh-swatch" style={{ background: '#10b981' }} />
              Present
            </div>
            <div className="lh-item">
              <div className="lh-swatch" style={{ background: '#ef4444' }} />
              Absent
            </div>
          </div>
        </>
      )} */}
    </div>
  )
}
