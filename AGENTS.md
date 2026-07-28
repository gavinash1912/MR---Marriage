# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-28
**Commit:** 1a8a627
**Branch:** main

## OVERVIEW

Wedding RSVP website for Manas & Rupa Sree (Sep 5, 2026). React 19 + Vite 8 + Tailwind 3 frontend, Vercel serverless API with MongoDB persistence (localStorage fallback).

## STRUCTURE

```
./
├── api/              # Vercel serverless functions (Node, export default handler)
│   ├── _db.js        # Shared MongoDB connection (reused across cold starts)
│   ├── _access.js    # Owner auth guard (cookie + access code)
│   ├── analytics.js  # POST events / GET summary+details (420 lines)
│   ├── rsvp.js       # POST RSVP submission
│   ├── guests.js     # GET/DELETE guest management
│   └── access.js     # POST owner login
├── src/
│   ├── pages/        # Route-level components (Home, Schedule, RSVP, Admin)
│   ├── components/   # Shared UI (Navbar, EventModal, FloralDecor, OrnateInvitation)
│   ├── utils/        # Hooks + helpers (analytics, scrollReveal, events, calendar)
│   └── assets/       # CSS (index.css)
├── public/           # Static assets (images/, videos/)
└── dist/             # Build output (gitignored content served by Vercel)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/change wedding events | `src/utils/events.js` | All event data lives here as constants |
| Modify RSVP flow | `src/pages/RSVP.jsx` | 884-line multi-step form; steps vary by invitation mode |
| Admin dashboard | `src/pages/Admin.jsx` | 1188 lines; protected by owner access code |
| Analytics tracking | `src/utils/analytics.js` + `api/analytics.js` | Client hook + server storage |
| Routing / new pages | `src/App.jsx` | All routes defined in `AppLayout` |
| Auth / access control | `api/_access.js` | Cookie-based owner auth; env vars drive secrets |
| Calendar links | `src/utils/calendar.js` | Google Calendar URL + .ics download |
| Scroll animations | `src/utils/scrollReveal.js` | IntersectionObserver on `[data-reveal]` elements |
| Styling | `src/assets/index.css` + Tailwind utility classes | Custom component classes + Tailwind |
| Deployment config | `vercel.json` | SPA rewrites + CORS headers for /api |

## CODE MAP

| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `getInvitationConfig` | fn | src/utils/events.js:98 | 8 | Returns mode-specific paths, events, labels |
| `useVisitAnalytics` | hook | src/utils/analytics.js:66 | 6 | Page view, scroll depth, section view, click tracking |
| `useScrollReveal` | hook | src/utils/scrollReveal.js:3 | 6 | Animates `[data-reveal]` elements on scroll |
| `getDb` | fn | api/_db.js:26 | 6 | Singleton MongoDB connection |
| `getGoogleCalendarUrl` | fn | src/utils/calendar.js:10 | 4 | Builds Google Calendar event URL |
| `RSVP` | component | src/pages/RSVP.jsx:69 | 3 | Multi-step form with event-per-guest responses |
| `requireOwnerAccess` | fn | api/_access.js | 3 | Guards GET endpoints with signed cookie |
| `Navbar` | component | src/components/Navbar.jsx:5 | 1 | Path-aware nav, adapts to invitation mode |

## CONVENTIONS

- **Two invitation modes**: `"full"` (all celebrations) vs `"wedding-only"` (ceremony only). Every page receives `invitationMode` prop; config from `getInvitationConfig`.
- **API pattern**: Each `api/*.js` exports a single `default async function handler(req, res)`. Underscore-prefixed files (`_db.js`, `_access.js`) are shared helpers, not endpoints.
- **Analytics via data attributes**: Sections use `data-analytics-section="Name"` for automatic view tracking. Clicks tracked via `onClickCapture={handleTrackedClick}`.
- **Scroll reveal via data attributes**: Add `data-reveal="fade-up|scale-up|card|photo"` to animate on scroll. Delay with `style={{ '--reveal-delay': '80ms' }}`.
- **No TypeScript**: Pure JSX. ESLint flat config with react-hooks + react-refresh plugins.
- **No tests**: Zero test infrastructure. Coverage is unmeasured.
- **Icons**: `lucide-react` exclusively.
- **CSS**: Tailwind utilities + custom classes in `src/assets/index.css`. Color palette uses `mauve-*` custom scale.

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER commit `.env`** — secrets (MONGODB_URI, OWNER_ACCESS_CODE, SITE_ACCESS_SECRET) in env vars only
- **NEVER hardcode admin path** — `VITE_ADMIN_PATH` env var drives it; default `/owner-rsvp-mr-2026` is fallback only
- **Do NOT rely on hidden URL for security** — owner access code + signed cookie protect admin, not obscurity
- **localStorage is fallback only** — when MongoDB is unavailable, RSVP submissions go to browser storage; not a primary persistence strategy

## COMMANDS

```bash
npm run dev          # Vite dev server (localhost:5173), proxies /api to :3001
npm run dev:api      # Vercel dev server (localhost:3001) for serverless functions
npm run build        # Production build → dist/
npm run lint         # ESLint (flat config)
npm run preview      # Preview production build locally
```

## NOTES

- **Proxy setup**: Vite proxies `/api` to `localhost:3001` in dev. Run both `dev` and `dev:api` for full local stack.
- **MongoDB Atlas**: Requires `0.0.0.0/0` in Network Access for Vercel serverless (no static IP).
- **Large files**: `Admin.jsx` (1188L) and `RSVP.jsx` (884L) are complexity hotspots. Both are single-component files with inline logic.
- **Geolocation**: `api/analytics.js` calls external APIs (ipwho.is, KeyCDN) for visitor IP geolocation on page_view events.
- **Video**: Place `welcome.mp4` at `public/videos/welcome.mp4` for the invitation video player.
- **Deployment**: Push to `main` → Vercel auto-deploys. No CI pipeline or GitHub Actions.
