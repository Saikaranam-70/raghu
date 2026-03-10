import { useState } from "react";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML", "CSD"];
const SECTIONS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i)); // A–O

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid var(--border)",
    padding: "0 32px",
    height: 60,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: "var(--shadow)",
  },
  brand: { fontWeight: 800, fontSize: 18, color: "#0f172a" },
  brandAcc: { color: "var(--primary)" },
  logoutBtn: {
    padding: "8px 18px", borderRadius: 8,
    border: "1.5px solid var(--border)", background: "none",
    fontSize: 13, fontWeight: 600, color: "var(--muted)",
    transition: "all .2s",
  },
  body: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 24px",
  },
  heading: { fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 8, textAlign: "center" },
  sub: { fontSize: 15, color: "var(--muted)", marginBottom: 48, textAlign: "center" },
  steps: { display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  stepNum: {
    width: 36, height: 36, borderRadius: "50%",
    background: "var(--primary)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 15,
  },
  stepNumDone: { background: "var(--success)" },
  stepLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 },
  arrow: { fontSize: 24, color: "var(--muted2)", alignSelf: "center", marginTop: 20 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    maxWidth: 340,
  },
  secGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    maxWidth: 320,
  },
  chip: {
    padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid var(--border)", background: "#fff",
    fontSize: 14, fontWeight: 600, color: "var(--text2)",
    transition: "all .18s", textAlign: "center",
  },
  chipActive: {
    borderColor: "var(--primary)", background: "var(--primary-l)",
    color: "var(--primary)",
    boxShadow: "0 0 0 3px rgba(79,70,229,.12)",
  },
  ctaBtn: {
    marginTop: 48, padding: "14px 48px",
    background: "linear-gradient(135deg,var(--primary),#7c3aed)",
    color: "#fff", border: "none", borderRadius: 14,
    fontSize: 16, fontWeight: 700,
    boxShadow: "0 8px 24px rgba(79,70,229,.3)",
    transition: "opacity .2s, transform .15s",
    letterSpacing: ".3px",
  },
};

export default function SelectorPage({ onSelect, onLogout }) {
  const [branch,  setBranch]  = useState("");
  const [section, setSection] = useState("");

  return (
    <div style={s.page}>
      {/* topbar */}
      <div style={s.topbar}>
        <div style={s.brand}>Attend<span style={s.brandAcc}>X</span></div>
        <button
          style={s.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => { e.target.style.borderColor="#ef4444"; e.target.style.color="#ef4444"; }}
          onMouseLeave={e => { e.target.style.borderColor="var(--border)"; e.target.style.color="var(--muted)"; }}
        >
          Logout
        </button>
      </div>

      {/* body */}
      <div style={s.body} className="fade-in">
        <div style={s.heading}>Select Your Class</div>
        <div style={s.sub}>Choose a branch and section to view the attendance dashboard</div>

        <div style={s.steps}>
          {/* BRANCH */}
          <div style={s.step}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ ...s.stepNum, ...(branch ? s.stepNumDone : {}) }}>
                {branch ? "✓" : "1"}
              </div>
              <div style={s.stepLabel}>Branch</div>
            </div>
            <div style={s.grid}>
              {BRANCHES.map(b => (
                <button
                  key={b}
                  style={{ ...s.chip, ...(branch === b ? s.chipActive : {}) }}
                  onClick={() => { setBranch(b); setSection(""); }}
                  onMouseEnter={e => { if (branch !== b) e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseLeave={e => { if (branch !== b) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div style={s.arrow}>→</div>

          {/* SECTION */}
          <div style={s.step}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ ...s.stepNum, ...(section ? s.stepNumDone : {}), ...(!branch ? { background: "var(--border2)", color: "#fff" } : {}) }}>
                {section ? "✓" : "2"}
              </div>
              <div style={s.stepLabel}>Section</div>
            </div>
            <div style={s.secGrid}>
              {SECTIONS.map(sec => (
                <button
                  key={sec}
                  style={{
                    ...s.chip,
                    ...(section === sec ? s.chipActive : {}),
                    ...(!branch ? { opacity: .4, pointerEvents: "none" } : {}),
                  }}
                  onClick={() => setSection(sec)}
                  onMouseEnter={e => { if (section !== sec) e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseLeave={e => { if (section !== sec) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {branch && section && (
          <button
            style={s.ctaBtn}
            className="scale-in"
            onClick={() => onSelect({ branch, section })}
            onMouseEnter={e => { e.currentTarget.style.opacity=".88"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity="1";    e.currentTarget.style.transform="translateY(0)"; }}
          >
            Open {branch}-{section} Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
