// src/components/ui/StatRow.jsx
export default function StatRow({ student }) {
  const totalAttended = student.subjects.reduce((a, s) => a + (s.attended || 0), 0)
  const lowSubjects   = student.subjects.filter(s => s.percentage !== null && s.percentage < 75)
  const totalClasses  = student.total_classes || '—'

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-val">{totalAttended}</div>
        <div className="stat-lbl">Attended</div>
        <div className="stat-sub">out of {totalClasses}</div>
      </div>
      <div className="stat-card">
        <div className="stat-val" style={{ color: student.overall_percentage >= 75 ? '#10b981' : '#ef4444' }}>
          {student.overall_percentage !== null ? `${student.overall_percentage}%` : '—'}
        </div>
        <div className="stat-lbl">Overall</div>
        <div className="stat-sub">attendance</div>
      </div>
      <div className="stat-card">
        <div className="stat-val" style={{ color: lowSubjects.length === 0 ? '#10b981' : '#ef4444' }}>
          {lowSubjects.length}
        </div>
        <div className="stat-lbl">Below 75%</div>
        <div className="stat-sub">subjects</div>
      </div>
    </div>
  )
}
