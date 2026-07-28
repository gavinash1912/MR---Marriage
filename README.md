# Manas & Rupa Sree Marriage Website

RSVP website for Manas and Rupa Sree's marriage celebration, built with React, Vite, Tailwind CSS, Vercel serverless functions, and optional MongoDB persistence.

## Local Development

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:5173`.

## Routes

| Route | Description |
| --- | --- |
| `/wedding` | Wedding-only home page with names, countdown, RSVP, and venue details |
| `/wedding/venue` | Wedding-only venue page with address, map link, light schedule, and calendar links |
| `/wedding/rsvp` | Wedding-only RSVP form for guests and additional attendees |
| `/marriage/celebrations` | Full celebration invite with all wedding events |
| `/marriage/celebrations/schedule` | Full celebration schedule |
| `/marriage/celebrations/rsvp` | Full celebration RSVP form |
| `/admin-mr-2026` | Admin dashboard for RSVPs and visitor logs |

The public site is open by default. The admin dashboard asks for the owner access code before showing RSVP data.

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
VITE_ADMIN_PATH=/admin-mr-2026
OWNER_ACCESS_CODE=replace-with-a-private-owner-code
SITE_ACCESS_SECRET=replace-with-a-long-random-cookie-secret
```
