> **✅ Free demo mode (default):** With no backend configured, the live Pages site runs a built-in
> in-browser backend (localStorage) so everything works for free — no server, no signup. Data is
> per-browser. To switch to the real shared backend later, deploy `server/` (steps below) and set
> `VITE_API_URL`.

# Deploying SolarCalc

This repo is a full-stack app:
- **Frontend** (`client/`) → GitHub Pages (automatic via GitHub Actions)
- **Backend** (`server/`, Node/Express + SQLite) → an external host (GitHub Pages can't run servers)

**Live frontend:** https://bhavithran1.github.io/SolarCalc/

## 1. Backend → Render (free, ~3 min)
1. Go to <https://render.com> and sign in with GitHub.
2. **New → Blueprint**, pick this repo. Render reads `render.yaml` and provisions the `solarcalc-api` web service.
3. Click **Apply**. When it's live, copy the URL, e.g. `https://solarcalc-api.onrender.com`.

> Free Render services sleep after ~15 min idle; the first request after sleeping cold-starts in ~30–50s.

## 2. Point the frontend at the backend
Set the backend URL as a repo **Actions variable**, then redeploy:

```bash
gh variable set VITE_API_URL --repo bhavithran1/SolarCalc --body "https://solarcalc-api.onrender.com"
gh workflow run deploy.yml --repo bhavithran1/SolarCalc
```

(Or: repo **Settings → Secrets and variables → Actions → Variables → New variable** `VITE_API_URL`, then re-run the "Deploy frontend to GitHub Pages" workflow.)

## 3. Done
The Pages site now talks to your live backend. Demo logins are in [README.md](README.md).

## Run locally
```bash
cd server && npm install && npm start     # backend
cd client && npm install && npm run dev    # frontend (proxies /api to backend)
```
