import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;
const API_KEY  = import.meta.env.VITE_API_KEY;

const COLORS = {
  primary: "#4f46e5",
  danger:  "#ef4444",
  success: "#10b981",
};

function Field({ label, type = "text", value, onChange, placeholder, show, onToggle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: "#334155", marginBottom: 6, letterSpacing: ".3px",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show !== undefined ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "11px 40px 11px 14px",
            border: "1.5px solid #e2e8f0", borderRadius: 10,
            fontSize: 14, color: "#0f172a", background: "#f8fafc",
            outline: "none", fontFamily: "inherit",
            transition: "border-color .2s, box-shadow .2s",
          }}
          onFocus={e => {
            e.target.style.borderColor = COLORS.primary;
            e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,.1)";
            e.target.style.background = "#fff";
          }}
          onBlur={e => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
            e.target.style.background = "#f8fafc";
          }}
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              fontSize: 16, cursor: "pointer", color: "#94a3b8",
              padding: 0, lineHeight: 1,
            }}
          >
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChangeCredentials({ token, onClose }) {
  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPw) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    const localToken = localStorage.getItem("faculty_jwt")

    setLoading(true); setError(""); setSuccess(false);
    try {
        
      const res = await fetch(`${BASE_URL}/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      console.log(localToken);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);

      setSuccess(true);
      setUsername(""); setPassword(""); setConfirmPw("");
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,.45)",
          backdropFilter: "blur(4px)",
          zIndex: 300,
          animation: "fadeIn .2s ease",
        }}
      />

      {/* MODAL */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 301,
        width: "100%", maxWidth: 440,
        padding: "0 16px",
        animation: "scaleIn .25s ease",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 48px rgba(79,70,229,.18), 0 8px 16px rgba(0,0,0,.1)",
          overflow: "hidden",
        }}>

          {/* HEADER */}
          <div style={{
            padding: "22px 28px 18px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                Update Credentials
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Change admin username and password
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontSize: 14, cursor: "pointer", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div style={{ padding: "24px 28px 28px" }}>

            {/* SUCCESS STATE */}
            {success && (
              <div style={{
                padding: "14px 16px", borderRadius: 10,
                background: "#d1fae5", border: "1px solid #a7f3d0",
                marginBottom: 20,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>Credentials updated!</div>
                  <div style={{ fontSize: 12, color: "#047857", marginTop: 1 }}>Your new credentials are active immediately.</div>
                </div>
              </div>
            )}

            <Field
              label="New Username"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="Enter new username"
            />
            <Field
              label="New Password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 6 characters"
              show={showPw}
              onToggle={() => setShowPw(!showPw)}
            />
            <Field
              label="Confirm Password"
              value={confirmPw}
              onChange={v => { setConfirmPw(v); setError(""); }}
              placeholder="Re-enter password"
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />

            {/* MATCH INDICATOR */}
            {password && confirmPw && (
              <div style={{
                fontSize: 12, fontWeight: 600, marginTop: -12, marginBottom: 16,
                color: password === confirmPw ? COLORS.success : COLORS.danger,
              }}>
                {password === confirmPw ? "✓ Passwords match" : "✗ Passwords don't match"}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "#fee2e2", border: "1px solid #fecaca",
                fontSize: 13, color: "#dc2626", fontWeight: 500,
                marginBottom: 16,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "12px",
                  border: "1.5px solid #e2e8f0", borderRadius: 10,
                  background: "#fff", fontSize: 14, fontWeight: 600,
                  color: "#64748b", cursor: "pointer", transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2, padding: "12px",
                  background: loading ? "#c7d2fe" : `linear-gradient(135deg, ${COLORS.primary}, #7c3aed)`,
                  border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity .15s",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(79,70,229,.3)",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = ".88"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? "Updating…" : "Update Credentials"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -48%) scale(.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
      `}</style>
    </>
  );
}