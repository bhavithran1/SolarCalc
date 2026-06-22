import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { securityHeaders, rateLimit, errorHandler, isEmail, isStrongPassword, sanitizeStr } from "./middleware.js";

const app = express();
const PORT = process.env.PORT || 4004;
const JWT_SECRET = process.env.JWT_SECRET || "solarcalc-dev-secret";

app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(securityHeaders);
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, key: "auth" });

const sign = (u) => jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user; next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

// ---------- ROI engine (shared assumptions) ----------
const TARIFF = 0.52;            // RM per kWh (Malaysia tiered average)
const EXPORT_RATE = 0.08;       // RM per exported kWh, conservative planning value
const PERFORMANCE_RATIO = 0.78; // real-world derating
const KW_PER_M2 = 0.15;         // installable capacity per m² of roof
const COST_PER_KW = 4000;       // RM installed
const CO2_PER_KWH = 0.585;      // kg CO2e per kWh (grid factor)
const PANEL_LIFETIME = 25;      // years
const DEGRADATION_PCT = 0.5;
const SELF_CONSUMPTION_PCT = 92;
const valueOr = (value, fallback) => Number.isFinite(+value) ? +value : fallback;

export function calculate({
  monthly_bill,
  roof_area,
  sun_hours,
  tariff = TARIFF,
  cost_per_kw = COST_PER_KW,
  performance_ratio = PERFORMANCE_RATIO,
  self_consumption_pct = SELF_CONSUMPTION_PCT,
  export_rate = EXPORT_RATE,
  degradation_pct = DEGRADATION_PCT,
}) {
  const bill = Math.max(0, valueOr(monthly_bill, 0));
  const area = Math.max(0, valueOr(roof_area, 0));
  const sun = Math.max(1, valueOr(sun_hours, 4.5));
  const energyRate = Math.max(0.01, valueOr(tariff, TARIFF));
  const installRate = Math.max(1000, valueOr(cost_per_kw, COST_PER_KW));
  const pr = Math.min(0.95, Math.max(0.55, valueOr(performance_ratio, PERFORMANCE_RATIO)));
  const selfUse = Math.min(100, Math.max(0, valueOr(self_consumption_pct, SELF_CONSUMPTION_PCT))) / 100;
  const exportCredit = Math.max(0, valueOr(export_rate, EXPORT_RATE));
  const degradation = Math.min(2, Math.max(0, valueOr(degradation_pct, DEGRADATION_PCT))) / 100;

  // size system to roof, but never far beyond annual consumption need
  const annualConsumptionKwh = (bill / energyRate) * 12;
  const roofKw = area * KW_PER_M2;
  const neededKw = annualConsumptionKwh / (sun * 365 * pr);
  const system_kw = +Math.min(roofKw, neededKw * 1.1).toFixed(2);

  const annual_gen = system_kw * sun * 365 * pr;
  const self_consumed_kwh = Math.min(annual_gen * selfUse, annualConsumptionKwh);
  const exported_kwh = Math.max(0, annual_gen - self_consumed_kwh);
  const offset_kwh = Math.min(self_consumed_kwh, annualConsumptionKwh);
  const annual_savings = +(self_consumed_kwh * energyRate + exported_kwh * exportCredit).toFixed(0);
  const cost = +(system_kw * installRate).toFixed(0);
  const payback_years = annual_savings > 0 ? +(cost / annual_savings).toFixed(1) : 0;
  const co2_tonnes = +((annual_gen * CO2_PER_KWH) / 1000).toFixed(2);
  const degradationFactor = 1 - degradation * ((PANEL_LIFETIME - 1) / 2);
  const lifetime_savings = +(annual_savings * PANEL_LIFETIME * degradationFactor - cost).toFixed(0);
  const offset_pct = annualConsumptionKwh > 0 ? Math.min(100, Math.round((offset_kwh / annualConsumptionKwh) * 100)) : 0;

  return { system_kw, annual_gen: Math.round(annual_gen), annual_savings, cost, payback_years, co2_tonnes, lifetime_savings, offset_pct };
}

// ---------- auth ----------
app.post("/api/auth/register", authLimiter, (req, res) => {
  let { name, email, password } = req.body || {};
  name = sanitizeStr(name, 80); email = sanitizeStr(email, 120)?.toLowerCase();
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  if (!isEmail(email)) return res.status(400).json({ error: "Please enter a valid email" });
  if (!isStrongPassword(password)) return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (db.prepare("SELECT id FROM users WHERE email=?").get(email)) return res.status(409).json({ error: "Email already registered" });
  const info = db.prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)").run(name, email, bcrypt.hashSync(password, 10));
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(info.lastInsertRowid);
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post("/api/auth/login", authLimiter, (req, res) => {
  const email = sanitizeStr(req.body?.email, 120)?.toLowerCase();
  const { password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- calculate (public) ----------
app.post("/api/calculate", (req, res) => res.json(calculate(req.body || {})));

// ---------- scenarios ----------
app.get("/api/scenarios", auth, (req, res) => {
  res.json({ scenarios: db.prepare("SELECT * FROM scenarios WHERE user_id=? ORDER BY created_at DESC").all(req.user.id) });
});

app.post("/api/scenarios", auth, (req, res) => {
  const { name, monthly_bill, roof_area, sun_hours } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name your scenario" });
  const r = calculate(req.body || {});
  const info = db.prepare(`INSERT INTO scenarios (user_id,name,monthly_bill,roof_area,sun_hours,system_kw,cost,annual_savings,payback_years,co2_tonnes)
    VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(req.user.id, name, monthly_bill, roof_area, sun_hours, r.system_kw, r.cost, r.annual_savings, r.payback_years, r.co2_tonnes);
  res.json({ scenario: db.prepare("SELECT * FROM scenarios WHERE id=?").get(info.lastInsertRowid) });
});

app.delete("/api/scenarios/:id", auth, (req, res) => {
  const s = db.prepare("SELECT * FROM scenarios WHERE id=?").get(req.params.id);
  if (!s || s.user_id !== req.user.id) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM scenarios WHERE id=?").run(s.id);
  res.json({ ok: true });
});

app.get("/api/stats", (req, res) => {
  const agg = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(co2_tonnes),0) AS co2, COALESCE(SUM(annual_savings),0) AS save FROM scenarios").get();
  res.json({ scenarios: agg.n, co2_tonnes: +agg.co2.toFixed(1), annual_savings: agg.save });
});

app.get("/api/health", (req, res) => res.json({ ok: true, service: "solarcalc", time: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);
app.listen(PORT, () => console.log(`☀️  SolarCalc API on http://localhost:${PORT}`));
