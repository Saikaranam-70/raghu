// src/pages/LoadingPage.jsx
const PILLS = ['UHV','DL&CO','ADSA','JAVA','FOSS LAB','DM>','PP','NPTEL','CRT']

export default function LoadingPage() {
  return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="spinner" />
        <h2 className="loading-title">Fetching your attendance...</h2>
        <p className="loading-sub">Reading live data from Google Sheets</p>
        <div className="pill-grid">
          {PILLS.map(p => <span key={p} className="pill">{p}</span>)}
        </div>
      </div>
    </div>
  )
}
