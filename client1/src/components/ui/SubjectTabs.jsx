// src/components/ui/SubjectTabs.jsx
import { getTabClass } from '../../utils/helpers'

export default function SubjectTabs({ subjects, active, onChange }) {
  return (
    <div className="tabs-scroll">
      <div className="tabs-row">
        {subjects.map((s, i) => (
          <button
            key={s.subject}
            className={`tab-btn ${getTabClass(s.percentage)} ${active === i ? 'active' : ''}`}
            onClick={() => onChange(i)}
          >
            {s.subject}
            {s.percentage !== null && (
              <span className="tab-pct">{s.percentage}%</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
