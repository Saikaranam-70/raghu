import { useState } from "react";
import '../../pages/Login.css'

// ── REPLACE THESE WITH YOUR ACTUAL ENDPOINTS ──────────────────────────────────
const BASE_URL   = import.meta.env.VITE_API_URL;
const LOGIN_PATH = "/admin/login";        // POST → { token: "..." }
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute", width: 400, height: 400,
    borderRadius: "50%",
    background: "rgba(255,255,255,.07)",
    top: -100, right: -80,
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 300, height: 300,
    borderRadius: "50%",
    background: "rgba(255,255,255,.05)",
    bottom: -60, left: -60,
    pointerEvents: "none",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "48px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 32px 64px rgba(79,70,229,.25), 0 8px 24px rgba(0,0,0,.12)",
    position: "relative",
    zIndex: 1,
    animation: "scaleIn .4s ease both",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
  },
  logoBox: {
    width: 42, height: 42, borderRadius: 12,
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 800, fontSize: 18,
  },
  brand: { fontWeight: 800, fontSize: 18, color: "#0f172a" },
  brandAccent: { color: "#4f46e5" },
  title: { fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 6, lineHeight: 1.2 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 36 },
  label: {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#334155", marginBottom: 6, letterSpacing: ".3px",
  },
  inputWrap: { position: "relative", marginBottom: 16 },
  input: {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12, fontSize: 14, color: "#0f172a",
    outline: "none", transition: "border-color .2s, box-shadow .2s",
    background: "#f8fafc",
  },
  pwToggle: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#94a3b8",
    fontSize: 18, lineHeight: 1, padding: 0,
  },
  btn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 700, marginTop: 8,
    transition: "opacity .2s, transform .1s",
    letterSpacing: ".3px",
  },
  err: {
    marginTop: 12, padding: "10px 14px",
    background: "#fee2e2", borderRadius: 8,
    fontSize: 13, color: "#dc2626",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "24px 0", color: "#94a3b8", fontSize: 12,
  },
  divLine: { flex: 1, height: 1, background: "#e2e8f0" },
  footer: { marginTop: 28, textAlign: "center", fontSize: 12, color: "#94a3b8" },
};

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      onLogin(data.token || data.jwt || data.access_token);
    } catch (e) {
      setError(e.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
        <div className="admin-btn-wrap">
  <button 
    className="admin-btn"
    onClick={() => navigate("/admin")}
  >
    <i className="bi bi-mortarboard"></i> Student
  </button>
</div>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>R</div>
          <div style={styles.brand}>Raghu<span style={styles.brandAccent}></span></div>
        </div>
        <div style={styles.title}>Faculty Portal</div>
        <div style={styles.sub}>Sign in to access your attendance dashboard</div>

        <div>
          <label style={styles.label}>Username / Email</label>
          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your username"
              onFocus={e => { e.target.style.borderColor="#4f46e5"; e.target.style.boxShadow="0 0 0 3px rgba(79,70,229,.12)"; }}
              onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
            />
          </div>

          <label style={styles.label}>Password</label>
          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              onFocus={e => { e.target.style.borderColor="#4f46e5"; e.target.style.boxShadow="0 0 0 3px rgba(79,70,229,.12)"; }}
              onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
            />
            <button style={styles.pwToggle} onClick={() => setShowPw(!showPw)} type="button">
              {showPw ? "🙈" : "👁"}
            </button>
          </div>

          <button
            style={{ ...styles.btn, opacity: loading ? .7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
            onMouseEnter={e => !loading && (e.target.style.opacity = ".88")}
            onMouseLeave={e => (e.target.style.opacity = "1")}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          {error && <div style={styles.err}>⚠ {error}</div>}
        </div>

        <div style={styles.footer}>
          Raghu · Admin Dashboard · Attendance
        </div>
      </div>
    </div>
  );
}
