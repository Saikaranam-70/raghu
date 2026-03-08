// src/components/ui/RankCard.jsx
export default function RankCard({ rank }) {
  if (!rank) return null
  return (
    <div className="rank-card">
      <div className="rank-left">
        <div className="lbl">Class Rank</div>
        <div className="num">#{rank.rank}</div>
        <div className="total">out of {rank.total_students} students</div>
      </div>
      <div className="rank-right">
        <div className="pct-num">{rank.percentile}%</div>
        <div className="pct-lbl">Percentile</div>
      </div>
    </div>
  )
}
