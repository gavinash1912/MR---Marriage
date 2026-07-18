# Manas & Rupa Sri Marriage Website

RSVP website for Manas and Rupa Sri's marriage celebration, built with React, Vite, Tailwind CSS, Vercel serverless functions, and optional MongoDB persistence.

## Local Development

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:5173`.

## Routes

| Route | Description |
| --- | --- |
| `/` | Home page with names, countdown, invitation video, and event details |
| `/schedule` | Event schedule, venue details, and calendar links |
| `/rsvp` | RSVP form for guests and additional attendees |
| `/admin-mr-2026` | Hidden admin dashboard for RSVPs and visitor logs |

## Event Video

Place the invitation video at:

```text
public/videos/welcome.mp4
```

The page detects the MP4 automatically and shows the custom video player.

## Data Storage

RSVPs use `/api/rsvp` and `/api/guests`. If `MONGODB_URI` is not configured, submissions fall back to browser `localStorage`.

Copy `.env.example` to `.env` and set:

```text
MONGODB_URI=mongodb+srv://...
MONGODB_DB=marriage
```
