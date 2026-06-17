# ☀️ SolarCalc — Improvements Changelog

A hardening & polish pass over the original build.

## Security (backend)
1. Security-headers middleware (nosniff, frame-deny, referrer, XSS, permissions-policy)
2. Rate limiter on auth routes (10/min)
3. JSON body size limit (100kb)
4. `trust proxy` for correct client IPs
5. Server-side email format validation
6. Server-side password length validation
7. Input sanitisation/trimming + max-length clamping
8. Email lowercased on register & login
9. Login tolerant of missing password
10. Centralised error handler
11. JSON 404 handler
12. Health endpoint returns a timestamp

## Accessibility
13. **prefers-reduced-motion** respected across all animations + global CSS override
14. **Skip-to-content** link
15. Semantic `<main id="main">` landmark with focus management
16. `:focus-visible` outlines
17. `aria-label`/`aria-expanded` on mobile menu toggle
18. Decorative emoji `aria-hidden`
19. `aria-live` toast region
20. `.sr-only` utility

## UX
21. Global **toast notifications** wired into scenario save + load errors
22. Replaced inline flash banner with toasts
23. Live, debounce-free calculator results preserved (client engine mirrors server)

## Mobile / responsive
24. **Hamburger menu** with animated dropdown under 720px
25. Reduced section padding on small screens
26. Toast region clamps to viewport width

## SEO
27. Per-page `<title>` + meta description via `useDocumentTitle`
28. Open Graph + Twitter Card tags
29. `theme-color` + `color-scheme` meta

## Resilience / code quality
30. **Error boundary** with recovery screen
31. API client **request timeout** (12s) via AbortController
32. Friendly offline / timeout messages
33. Auto-logout + token clear on 401
34. **Scroll-to-top** on route change
35. Branded **404 page**

> Many items are cross-cutting, so the real surface improved is larger than the count.
