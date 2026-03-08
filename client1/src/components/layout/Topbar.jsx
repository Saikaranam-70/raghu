// src/components/layout/Topbar.jsx
export default function Topbar({ student, onBack }) {
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <div className="topbar-icon">🎓</div>
        <div>
          <div className="topbar-app-name">Raghu Attendance</div>
          <div className="topbar-app-sub">Live · Google Sheets</div>
        </div>
      </div>
      <div className="topbar-right">
        {student && (
          <div>
            <div className="topbar-name">{student.name}</div>
            <div className="topbar-pin">{student.regd_no}</div>
          </div>
        )}
        <button className="btn-back" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}
