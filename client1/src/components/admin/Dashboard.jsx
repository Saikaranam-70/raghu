import { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend,
} from "recharts";

// ── CONFIG ─────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL;
const API_KEY  = import.meta.env.VITE_API_KEY;
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  good:    "#10b981",
  warn:    "#f59e0b",
  danger:  "#ef4444",
  primary: "#4f46e5",
  purple:  "#8b5cf6",
  blue:    "#3b82f6",
  indigo:  "#6366f1",
};

const api = (path) =>
  fetch(`${BASE_URL}${path}`, { headers: { "X-API-Key": API_KEY } }).then((r) => r.json());

// ── THRESHOLDS ──────────────────────────────────────────────────────────────
const T_GOOD     = 75;   // ≥ 75% → Good
const T_CRITICAL = 50;   // < 40% → Critical  (40–74% → Warning)
// ─────────────────────────────────────────────────────────────────────────────


function pctColor(p) {
  if (p === null || p === undefined) return COLORS.warn;
  return p >= T_GOOD ? COLORS.good : p >= T_CRITICAL ? COLORS.warn : COLORS.danger;
}
function pctBg(p) {
  if (p === null || p === undefined) return "#fef3c7";
  return p >= T_GOOD ? "#d1fae5" : p >= T_CRITICAL ? "#fef3c7" : "#fee2e2";
}

// ── RESPONSIVE HOOK ───────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, width: w };
}

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon, delay = 0 }) {
  return (
    <div
      className="fade-up"
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,.08)",
        border: "1px solid #e2e8f0",
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color || COLORS.primary }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: color || "#0f172a", lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 5 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 24, opacity: .12, flexShrink: 0, marginLeft: 8 }}>{icon}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ pct, height = 8 }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 99, height, overflow: "hidden", flex: 1, minWidth: 0 }}>
      <div style={{
        height: "100%", borderRadius: 99,
        background: pctColor(pct),
        width: `${Math.min(pct ?? 0, 100)}%`,
        transition: "width .8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

function PctChip({ pct }) {
  if (pct === null || pct === undefined)
    return <span style={{ fontSize: 11, color: "#64748b" }}>N/A</span>;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 9px",
      borderRadius: 99, background: pctBg(pct), color: pctColor(pct),
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {pct.toFixed(1)}%
    </span>
  );
}

function SectionHeader({ title, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 32 }}>
      <div style={{ width: 4, height: 20, borderRadius: 2, background: accent || COLORS.primary, flexShrink: 0 }} />
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
  );
}

// ── CUSTOM PIE LABEL ──────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.08) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────────
function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "overview",   label: "Overview",   icon: "📊" },
    { id: "subjects",   label: "Subjects",   icon: "📚" },
    { id: "defaulters", label: "Defaulters", icon: "⚠️" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", borderTop: "1px solid #e2e8f0",
      display: "flex", zIndex: 200,
      boxShadow: "0 -4px 12px rgba(0,0,0,.08)",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{
            flex: 1, padding: "10px 4px 12px",
            background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: activeTab === t.id ? COLORS.primary : "#94a3b8",
            transition: "color .15s",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 700 : 500 }}>{t.label}</span>
          {activeTab === t.id && (
            <div style={{ position: "absolute", bottom: 0, width: 32, height: 2, background: COLORS.primary, borderRadius: 2 }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard({ token, selection, onBack, onLogout }) {
  const { branch, section } = selection;
  const { isMobile, isTablet } = useBreakpoint();
  const [stats,       setStats]       = useState(null);
  const [defaulters,  setDefaulters]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [lastRefresh, setLastRefresh] = useState("");
  const [activeTab,   setActiveTab]   = useState("overview");
  const [menuOpen,    setMenuOpen]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [s, d] = await Promise.all([
        api("/students/class-stats"),
        api("/students/defaulters?threshold=75"),
      ]);
      setStats(s);
      const defArr = Array.isArray(d) ? d : d?.students || d?.data || [];
      setDefaulters(defArr.sort((a, b) => (a.overall_percentage ?? 0) - (b.overall_percentage ?? 0)));
      setLastRefresh(new Date().toLocaleTimeString("en-IN"));
    } catch {
      setError("Failed to load data. Check your API server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const above   = stats?.students_above_75 || 0;
  const below   = stats?.students_below_75 || 0;
  const total   = stats?.total_students    || 1;
  // Compute critical count from actual defaulters data using T_CRITICAL threshold
  const crit    = defaulters.filter(s => (s.overall_percentage ?? 0) < T_CRITICAL).length;
  const midRisk = below - crit;

  const pieData = [
    { name: "≥75% Good",      value: above,   color: COLORS.good   },
    { name: `${T_CRITICAL}–74% Low`,     value: midRisk, color: COLORS.warn   },
    { name: `<${T_CRITICAL}% Critical`,  value: crit,    color: COLORS.danger },
  ].filter(d => d.value > 0);

  const subjectBarData = (stats?.subject_wise_stats || [])
    .filter(s => s.average_percentage !== null)
    .map(s => ({ name: s.subject, avg: s.average_percentage }));

  const radialData = (stats?.subject_wise_stats || [])
    .filter(s => s.average_percentage !== null)
    .map(s => ({ name: s.subject, value: s.average_percentage, fill: pctColor(s.average_percentage) }));

  const pad = isMobile ? "16px" : "28px 32px";

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: isMobile ? "0 16px" : "0 32px",
        height: isMobile ? 56 : 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        position: "sticky", top: 0, zIndex: 100,
        gap: 8,
      }}>
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: "#0f172a", flexShrink: 0 }}>
            Raghu<span style={{ color: COLORS.primary }}>.</span>
          </div>
          <div style={{
            background: "#eef2ff", padding: "4px 10px",
            borderRadius: 7, border: "1px solid rgba(79,70,229,.15)",
            fontSize: isMobile ? 12 : 13, fontWeight: 700, color: COLORS.primary,
            flexShrink: 0,
          }}>
            {branch}-{section}
          </div>

          {/* DESKTOP TABS */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
              {["overview", "subjects", "defaulters"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  fontSize: 13, fontWeight: 600,
                  background: activeTab === tab ? COLORS.primary : "transparent",
                  color: activeTab === tab ? "#fff" : "#64748b",
                  transition: "all .15s", textTransform: "capitalize", cursor: "pointer",
                }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, flexShrink: 0 }}>
          {lastRefresh && !isMobile && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Updated {lastRefresh}</span>
          )}

          {/* DESKTOP BUTTONS */}
          {!isMobile && <>
            {[
              { label: "↺ Refresh",      onClick: load,     hover: COLORS.primary },
              { label: "← Change Class", onClick: onBack,   hover: COLORS.primary },
              { label: "Logout",         onClick: onLogout, hover: "#ef4444"      },
            ].map(btn => (
              <button key={btn.label} onClick={btn.onClick} style={{
                padding: "7px 14px", borderRadius: 8,
                border: "1.5px solid #e2e8f0", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "#64748b",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = btn.hover; e.currentTarget.style.borderColor = btn.hover; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                {btn.label}
              </button>
            ))}
          </>}

          {/* MOBILE MENU BUTTON */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              width: 36, height: 36, borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 16, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobile && menuOpen && (
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8,
          position: "sticky", top: 56, zIndex: 99,
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}>
          {lastRefresh && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Updated {lastRefresh}</div>}
          {[
            { label: "↺ Refresh Data",   onClick: () => { load(); setMenuOpen(false); } },
            { label: "← Change Class",   onClick: () => { onBack(); setMenuOpen(false); } },
            { label: "Logout",           onClick: onLogout, danger: true },
          ].map(b => (
            <button key={b.label} onClick={b.onClick} style={{
              padding: "10px 14px", borderRadius: 10,
              border: `1.5px solid ${b.danger ? "#fecaca" : "#e2e8f0"}`,
              background: b.danger ? "#fff5f5" : "#fff",
              fontSize: 13, fontWeight: 600,
              color: b.danger ? "#ef4444" : "#334155",
              cursor: "pointer", textAlign: "left",
            }}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{
        flex: 1,
        padding: isMobile ? "16px 16px 90px" : isTablet ? "24px 24px 40px" : "32px 32px 40px",
        maxWidth: 1400, margin: "0 auto", width: "100%",
      }}>

        {/* LOADING */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid #e2e8f0", borderTopColor: COLORS.primary,
              animation: "spin .7s linear infinite",
            }} />
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Loading attendance data…</div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: 60, color: COLORS.danger, fontWeight: 600, fontSize: 14 }}>
            ⚠ {error}
          </div>
        )}

        {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
        {!loading && !error && stats && activeTab === "overview" && (
          <div>
            {/* KPI GRID — 2 cols mobile, 4 cols tablet, 7 desktop */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : isTablet
                  ? "repeat(4, 1fr)"
                  : "repeat(7, 1fr)",
              gap: isMobile ? 10 : 14,
              marginBottom: 4,
            }}>
              <StatCard label="Students"     value={stats.total_students}            color={COLORS.indigo} icon="👥" delay={0}   />
              <StatCard label="Class Avg"    value={`${stats.overall_average}%`}     color={pctColor(stats.overall_average)} icon="📊" delay={50}
                sub={stats.overall_average >= 75 ? "On track" : "Below req."} />
              <StatCard label="Above 75%"    value={above}                           color={COLORS.good}   icon="✅" delay={100}
                sub={`${((above/total)*100).toFixed(0)}% of class`} />
              <StatCard label="Below 75%"    value={below}                           color={COLORS.warn}   icon="⚠️" delay={150} sub="Need attention" />
              <StatCard label="Critical"     value={crit}                            color={COLORS.danger} icon="🚨" delay={200} sub={`Below ${T_CRITICAL}%`} />
              <StatCard label="Highest"      value={`${stats.highest_attendance}%`} color={COLORS.good}   icon="🏆" delay={250} />
              <StatCard label="Lowest"       value={`${stats.lowest_attendance}%`}  color={COLORS.danger} icon="📉" delay={300} />
            </div>

            {/* ── DISTRIBUTION ROW ── */}
            <SectionHeader title="Attendance Distribution" accent={COLORS.indigo} />
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
              gap: isMobile ? 12 : 18,
            }}>

              {/* PIE */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Status Breakdown</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={44}
                      dataKey="value" labelLine={false} label={PieLabel}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} students`, n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMPLIANCE GAUGE */}
              <div style={{
                background: "#fff", borderRadius: 16, padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, alignSelf: "flex-start", color: "#0f172a" }}>Compliance Rate</div>
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: `conic-gradient(${pctColor(above/total*100)} ${(above/total*360).toFixed(0)}deg, #f1f5f9 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 0 0 20px #fff", marginBottom: 14,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: pctColor(above/total*100) }}>
                    {((above/total)*100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
                  {above} of {total} students meeting 75% threshold
                </div>
                <div style={{
                  marginTop: 12, padding: "6px 16px", borderRadius: 99,
                  background: above/total >= .75 ? "#d1fae5" : above/total >= .5 ? "#fef3c7" : "#fee2e2",
                  color: above/total >= .75 ? COLORS.good : above/total >= .5 ? COLORS.warn : COLORS.danger,
                  fontSize: 12, fontWeight: 700, textAlign: "center",
                }}>
                  {above/total >= .75 ? "✓ Class Performing Well" : above/total >= .5 ? "⚠ Needs Improvement" : "✗ Critical Situation"}
                </div>
              </div>

              {/* AT-RISK */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>At-Risk Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "≥ 75% · Good",     count: above,   pct: above/total*100,   color: COLORS.good   },
                    { label: `${T_CRITICAL}–74% · Warning`,  count: midRisk, pct: midRisk/total*100, color: COLORS.warn   },
                    { label: `< ${T_CRITICAL}% · Critical`,  count: crit,    pct: crit/total*100,    color: COLORS.danger },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{row.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.count}</span>
                      </div>
                      <ProgressBar pct={row.pct} height={7} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                    Worst Subjects
                  </div>
                  {(stats.subject_wise_stats || [])
                    .filter(s => s.average_percentage !== null)
                    .sort((a, b) => a.average_percentage - b.average_percentage)
                    .slice(0, 4)
                    .map(s => (
                      <div key={s.subject} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{s.subject}</span>
                        <PctChip pct={s.average_percentage} />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ SUBJECTS TAB ═══════════════════ */}
        {!loading && !error && stats && activeTab === "subjects" && (
          <div>
            <SectionHeader title="Subject-wise Attendance" accent={COLORS.blue} />

            {/* BAR CHART */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>Average Attendance per Subject</div>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                <BarChart data={subjectBarData} margin={{ top: 4, right: 8, bottom: isMobile ? 20 : 4, left: isMobile ? -20 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isMobile ? 9 : 12, fontWeight: 600, fill: "#64748b" }}
                    angle={isMobile ? -40 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Avg"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="avg" radius={[5, 5, 0, 0]}>
                    {subjectBarData.map((entry, i) => <Cell key={i} fill={pctColor(entry.avg)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                {[{ c: COLORS.good, l: "≥ 75%" }, { c: COLORS.warn, l: `${T_CRITICAL}–74%` }, { c: COLORS.danger, l: `< ${T_CRITICAL}%` }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                    {x.l}
                  </div>
                ))}
              </div>
            </div>

            {/* SUBJECT CARDS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? 10 : 14,
              marginBottom: 8,
            }}>
              {(stats.subject_wise_stats || []).map((s, i) => (
                <div key={s.subject} style={{
                  background: "#fff", borderRadius: 12, padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0",
                  borderLeft: `4px solid ${pctColor(s.average_percentage)}`,
                  animationDelay: `${i * 40}ms`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 4 }}>
                    <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: "#0f172a" }}>{s.subject}</div>
                    <PctChip pct={s.average_percentage} />
                  </div>
                  <ProgressBar pct={s.average_percentage} height={6} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#64748b", flexWrap: "wrap", gap: 4 }}>
                    <span>Held: <b style={{ color: "#0f172a" }}>{s.total_classes_held ?? "N/A"}</b></span>
                    <span>Students: <b style={{ color: "#0f172a" }}>{s.students_counted}</b></span>
                  </div>
                </div>
              ))}
            </div>

            {/* RADIAL CHART — hide on mobile (too cramped) */}
            {!isMobile && (
              <>
                <SectionHeader title="Radial View" accent={COLORS.purple} />
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={140} data={radialData} startAngle={180} endAngle={0}>
                      <RadialBar minAngle={15} background={{ fill: "#f8fafc" }} clockWise dataKey="value"
                        label={{ position: "insideStart", fill: "#fff", fontSize: 9, fontWeight: 700 }} />
                      <Legend iconSize={9} layout="vertical" verticalAlign="middle" align="right"
                        formatter={(val) => <span style={{ fontSize: 11, color: "#64748b" }}>{val}</span>} />
                      <Tooltip formatter={(v) => [`${v}%`, "Avg"]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════ DEFAULTERS TAB ═══════════════════ */}
        {!loading && !error && activeTab === "defaulters" && (
          <div>
            {/* SUMMARY */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
              gap: isMobile ? 10 : 16, marginBottom: 4,
            }}>
              <StatCard label="Defaulters"    value={below}   color={COLORS.warn}   delay={0}   sub="Below 75%" />
              <StatCard label="Critical"      value={crit}    color={COLORS.danger}  delay={60}  sub={`Below ${T_CRITICAL}%`} />
              <StatCard label="Moderate"      value={midRisk} color={COLORS.warn}    delay={120} sub={`${T_CRITICAL}–74%`} />
            </div>

            {defaulters.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: "50px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>No Defaulters!</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>All students are above 75% attendance.</div>
              </div>
            ) : (
              <>
                <SectionHeader title={`Defaulters (${defaulters.length})`} accent={COLORS.danger} />
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", fontSize: 12, color: "#c2410c", fontWeight: 600 }}>
                    ⚠ {defaulters.length} student(s) below 75% — lowest first
                  </div>

                  {/* MOBILE: CARD LIST */}
                  {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {defaulters.map((st, i) => (
                        <div key={st.regd_no} style={{
                          padding: "14px 16px",
                          borderBottom: i < defaulters.length - 1 ? "1px solid #f1f5f9" : "none",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{st.name}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginTop: 1 }}>{st.regd_no}</div>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                              background: st.overall_percentage < T_CRITICAL ? "#fee2e2" : "#fef3c7",
                              color: st.overall_percentage < T_CRITICAL ? COLORS.danger : COLORS.warn,
                              flexShrink: 0, marginLeft: 8,
                            }}>
                              {st.overall_percentage < T_CRITICAL ? "CRITICAL" : "LOW"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ProgressBar pct={st.overall_percentage} height={5} />
                            <PctChip pct={st.overall_percentage} />
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                            {st.total_attended ?? "—"} / {st.total_classes ?? "—"} classes
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* DESKTOP/TABLET: TABLE */
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["#", "Name", "Reg No.", "Attended / Total", "Overall %", "Risk"].map(h => (
                              <th key={h} style={{
                                textAlign: "left", padding: "11px 14px",
                                fontSize: 10, fontWeight: 700, color: "#64748b",
                                textTransform: "uppercase", letterSpacing: ".5px",
                                borderBottom: "1px solid #e2e8f0",
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {defaulters.map((st, i) => (
                            <tr key={st.regd_no}
                              style={{ borderBottom: "1px solid #f1f5f9", transition: "background .12s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                              <td style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                              <td style={{ padding: "11px 14px", fontWeight: 700, color: "#0f172a" }}>{st.name}</td>
                              <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{st.regd_no}</td>
                              <td style={{ padding: "11px 14px" }}>
                                <span style={{ fontWeight: 600 }}>{st.total_attended ?? "—"}</span>
                                <span style={{ color: "#94a3b8" }}> / {st.total_classes ?? "—"}</span>
                              </td>
                              <td style={{ padding: "11px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
                                  <ProgressBar pct={st.overall_percentage} height={6} />
                                  <PctChip pct={st.overall_percentage} />
                                </div>
                              </td>
                              <td style={{ padding: "11px 14px" }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                                  background: st.overall_percentage < T_CRITICAL ? "#fee2e2" : "#fef3c7",
                                  color: st.overall_percentage < T_CRITICAL ? COLORS.danger : COLORS.warn,
                                }}>
                                  {st.overall_percentage < T_CRITICAL ? "● CRITICAL" : "▲ LOW"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}

      {/* SPIN KEYFRAME */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up  { animation: fadeUp .35s ease both; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}