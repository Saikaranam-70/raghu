// src/components/ui/AllSubjectsList.jsx
import { getPctColor, getSubjectFullName } from '../../utils/helpers'

export default function AllSubjectsList({ subjects, onSelect }) {
  return (
    <div className="all-subjects-card">
      <div className="section-label" style={{ marginBottom: '1rem' }}>All Subjects</div>
      {subjects.map((s, i) => {
        const color = getPctColor(s.percentage)
        return (
          <div key={s.subject} className="subj-row" onClick={() => onSelect(i)}>
            <div className="subj-row-header">
              <span className="subj-row-name">{getSubjectFullName(s.subject)}</span>
              <span className="subj-row-pct" style={{ color }}>
                {s.percentage !== null ? `${s.percentage}%` : 'N/A'}
              </span>
            </div>
            <div className="mini-bar-track">
              <div
                className="mini-bar-fill"
                style={{ width: `${Math.min(s.percentage || 0, 100)}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
