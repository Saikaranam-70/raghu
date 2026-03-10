import { useState, useEffect } from "react";
// import LoginPage from "./components/LoginPage";
// import SelectorPage from "./components/SelectorPage";
// import Dashboard from "./components/Dashboard";
import "./Admin.css";
import LoginPage from "./components/admin/LoginPage";
import SelectorPage from "./components/admin/SelectorPage";
import Dashboard from "./components/admin/Dashboard";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("faculty_jwt"));
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("faculty_jwt", token);
    else localStorage.removeItem("faculty_jwt");
  }, [token]);

  const handleLogout = () => { setToken(null); setSelection(null); };

  if (!token) return <LoginPage onLogin={setToken} />;
  if (!selection) return <SelectorPage token={token} onSelect={setSelection} onLogout={handleLogout} />;
  return <Dashboard token={token} selection={selection} onBack={() => setSelection(null)} onLogout={handleLogout} />;
}
