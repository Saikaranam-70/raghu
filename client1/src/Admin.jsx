import { useState, useEffect } from "react";
import "./Admin.css";
import LoginPage from "./components/admin/LoginPage";
import SelectorPage from "./components/admin/SelectorPage";
import Dashboard from "./components/admin/Dashboard";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("faculty_jwt"));
  const [selection, setSelection] = useState(() => {
    const s = localStorage.getItem("faculty_selection");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("faculty_jwt", token);
    else localStorage.removeItem("faculty_jwt");
  }, [token]);

  useEffect(() => {
    if (selection) localStorage.setItem("faculty_selection", JSON.stringify(selection));
    else localStorage.removeItem("faculty_selection");
  }, [selection]);

  const handleLogout = () => { setToken(null); setSelection(null); };

  if (!token) return <LoginPage onLogin={setToken} />;
  if (!selection) return <SelectorPage token={token} onSelect={setSelection} onLogout={handleLogout} />;
  return <Dashboard token={token} selection={selection} onBack={() => setSelection(null)} onLogout={handleLogout} />;
}