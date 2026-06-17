// Lightweight, dependency-free middleware: security headers, rate limiting,
// validation helpers and async error handling.

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
}

// Simple in-memory sliding-window rate limiter (per IP + route key).
export function rateLimit({ windowMs = 60_000, max = 30, key = "default" } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const arr = (hits.get(id) || []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(id, arr);
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - arr.length));
    if (arr.length > max)
      return res.status(429).json({ error: "Too many requests — please slow down." });
    next();
  };
}

// Wrap async route handlers so thrown errors hit the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---- validation helpers ----
export const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isStrongPassword = (v) => typeof v === "string" && v.length >= 6;
export const clampInt = (v, min, max, dflt) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return dflt;
  return Math.min(max, Math.max(min, n));
};
export const sanitizeStr = (v, maxLen = 500) =>
  typeof v === "string" ? v.trim().slice(0, maxLen) : v;

export function validate(rules, body) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const val = body?.[field];
    if (rule.required && (val === undefined || val === null || val === "")) {
      errors[field] = `${field} is required`;
      continue;
    }
    if (val !== undefined && rule.email && !isEmail(val)) errors[field] = "Invalid email";
    if (val !== undefined && rule.min != null && Number(val) < rule.min) errors[field] = `${field} too small`;
    if (val !== undefined && rule.maxLen && String(val).length > rule.maxLen) errors[field] = `${field} too long`;
  }
  return Object.keys(errors).length ? errors : null;
}

// Final error handler.
export function errorHandler(err, req, res, _next) {
  console.error("✗", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}
