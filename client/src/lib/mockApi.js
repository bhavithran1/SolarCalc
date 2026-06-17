// In-browser demo backend for GitHub Pages (no server required).
// Mirrors server.js against localStorage. DEMO auth only (plain-text passwords).
import { calculate } from "./solar.js";

const DB_KEY = "solarcalc_mockdb";

function seed() {
  return {
    seq: 100,
    users: [{ id: 1, name: "Faiz Rahman", email: "faiz@demo.com", password: "password123" }],
    scenarios: [
      { id: 1, user_id: 1, name: "My terrace house", monthly_bill: 350, roof_area: 40, sun_hours: 4.5, system_kw: 5.0, cost: 20000, annual_savings: 3201, payback_years: 6.2, co2_tonnes: 3.1, created_at: new Date().toISOString() },
    ],
  };
}

function load() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  const db = seed(); save(db); return db;
}
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
const nextId = (db) => ++db.seq;
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const tokenFor = (u) => `mock.${u.id}`;
const userFromToken = (db, t) => db.users.find((u) => u.id === Number(String(t || "").replace("mock.", ""))) || null;
const err = (s, m) => { const e = new Error(m); e.status = s; throw e; };

export async function mockApi(rawPath, { method = "GET", body, token } = {}) {
  const db = load();
  const [path] = rawPath.split("?");
  const me = userFromToken(db, token);

  if (path === "/auth/register" && method === "POST") {
    const { name, email, password } = body || {};
    if (!name || !email || !password) err(400, "Missing fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err(400, "Please enter a valid email");
    if (password.length < 6) err(400, "Password must be at least 6 characters");
    if (db.users.some((u) => u.email === email.toLowerCase())) err(409, "Email already registered");
    const u = { id: nextId(db), name, email: email.toLowerCase(), password };
    db.users.push(u); save(db);
    return { token: tokenFor(u), user: publicUser(u) };
  }
  if (path === "/auth/login" && method === "POST") {
    const u = db.users.find((x) => x.email === String(body?.email || "").toLowerCase());
    if (!u || u.password !== body?.password) err(401, "Invalid email or password");
    return { token: tokenFor(u), user: publicUser(u) };
  }
  if (path === "/auth/me") { if (!me) err(401, "Not authenticated"); return { user: publicUser(me) }; }

  // public calculator
  if (path === "/calculate" && method === "POST") return calculate(body || {});

  if (path === "/scenarios" && method === "GET") {
    if (!me) err(401, "Not authenticated");
    return { scenarios: db.scenarios.filter((s) => s.user_id === me.id).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")) };
  }
  if (path === "/scenarios" && method === "POST") {
    if (!me) err(401, "Not authenticated");
    const { name, monthly_bill, roof_area, sun_hours } = body || {};
    if (!name) err(400, "Name your scenario");
    const r = calculate({ monthly_bill, roof_area, sun_hours });
    const s = { id: nextId(db), user_id: me.id, name, monthly_bill, roof_area, sun_hours, system_kw: r.system_kw, cost: r.cost, annual_savings: r.annual_savings, payback_years: r.payback_years, co2_tonnes: r.co2_tonnes, created_at: new Date().toISOString() };
    db.scenarios.push(s); save(db); return { scenario: s };
  }
  const sm = path.match(/^\/scenarios\/(\d+)$/);
  if (sm && method === "DELETE") {
    const s = db.scenarios.find((x) => x.id === Number(sm[1]));
    if (!me || !s || s.user_id !== me.id) err(404, "Not found");
    db.scenarios = db.scenarios.filter((x) => x.id !== s.id); save(db); return { ok: true };
  }

  if (path === "/stats") {
    return {
      scenarios: db.scenarios.length,
      co2_tonnes: +db.scenarios.reduce((s, x) => s + x.co2_tonnes, 0).toFixed(1),
      annual_savings: db.scenarios.reduce((s, x) => s + x.annual_savings, 0),
    };
  }
  if (path === "/health") return { ok: true, service: "solarcalc-mock" };

  err(404, "Not found");
}
