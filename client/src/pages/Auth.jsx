import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal from "../components/Reveal.jsx";

export default function Auth() {
  const [params] = useSearchParams();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      navigate("/dashboard");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="container">
      <Reveal className="auth-wrap">
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: "1.7rem" }}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="muted mt-8">{mode === "login" ? "Log in to your saved scenarios." : "Save and compare solar scenarios for free."}</p>
          <div className="toggle mt-24">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Sign up</button>
          </div>
          <form onSubmit={submit} className="mt-24">
            {mode === "register" && (
              <div className="field"><label>Your name</label><input className="input" value={form.name} onChange={set("name")} required placeholder="Faiz Rahman" /></div>
            )}
            <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={set("email")} required placeholder="you@email.com" /></div>
            <div className="field"><label>Password</label><input className="input" type="password" value={form.password} onChange={set("password")} required minLength={6} placeholder="••••••••" /></div>
            {error && <div className="banner banner-error" style={{ marginBottom: 14 }}>{error}</div>}
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
          </form>
          {mode === "login" && <p className="muted mt-16" style={{ fontSize: "0.85rem", textAlign: "center" }}>Demo: <strong>faiz@demo.com</strong> · password123</p>}
        </div>
        <p className="center mt-16"><Link to="/" className="muted">← Back home</Link></p>
      </Reveal>
    </div>
  );
}
