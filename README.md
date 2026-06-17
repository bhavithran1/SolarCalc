# ☀️ SolarCalc — Rooftop Solar ROI Calculator

Turn an electricity bill and roof size into a clear answer: system size, upfront cost, annual savings, payback period and CO₂ avoided.

## Stack
- **Frontend:** React + Vite + Framer Motion (scroll-driven animations, live sliders)
- **Backend:** Node/Express + SQLite (`better-sqlite3`)
- **Auth:** email/password with bcrypt + JWT

## Run it
```bash
cd server && npm install && npm start    # http://localhost:4004
cd client && npm install && npm run dev   # http://localhost:5178
```
Vite proxies `/api` → `localhost:4004`. Demo seeds on first run.

### Demo account (password: `password123`)
`faiz@demo.com`

## Features
- Live calculator on the landing page — drag sliders, results update instantly (no login needed)
- Save scenarios to your account and compare them side by side
- "Best payback" highlighting across saved scenarios
- Transparent ROI engine shared between client (instant) and server (authoritative on save)

### ROI assumptions
Tariff RM0.52/kWh · performance ratio 0.78 · 0.15 kW installable per m² · RM4,000/kW installed · 0.585 kg CO₂e/kWh grid factor · 25-year panel life. Estimates for guidance only — get a professional quote before installing.
