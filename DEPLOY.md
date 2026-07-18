# Manas & Rupa Sri — Marriage Website

## Quick Start (local)

```bash
npm install
npm run dev        # React frontend on http://localhost:5173
```

RSVPs submitted without MongoDB configured are stored in **browser localStorage** as a fallback,
so the site works fully out of the box without any backend setup.

---

## Adding Your Welcome Video

Drop your video file here:

```
public/videos/welcome.mp4
```

The site detects the file automatically and replaces the placeholder with your video player.
Supported format: **MP4** (H.264, any resolution — recommended 1080p or 720p).

---

## Admin Dashboard

The admin page lives at a hidden URL to keep it private:

```
https://your-site.vercel.app/admin-mr-2026
```

It asks for the owner access code before showing RSVP data or visit logs.

> **Before going live**, change the slug in `src/App.jsx` line with `/admin-mr-2026` to
> something only you know, e.g. `/admin-secret-xyz`.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial marriage website"
git remote add origin https://github.com/YOUR_USER/mr-marriage.git
git push -u origin main
```

### 2. Import project on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

### 3. Set Environment Variables on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name           | Value                                               |
|----------------|-----------------------------------------------------|
| `MONGODB_URI`  | `mongodb+srv://user:pass@cluster.mongodb.net/`      |
| `MONGODB_DB`   | `marriage`                                        |
| `OWNER_ACCESS_CODE` | `manasrupa2026`                              |
| `SITE_ACCESS_SECRET` | A long random secret for admin cookies      |

> If you skip this, RSVPs fall back to localStorage on each visitor's own browser
> (no cross-device persistence). Add MongoDB whenever you're ready.

### 4. Set up MongoDB Atlas (free tier)

1. Go to https://cloud.mongodb.com → Create free cluster
2. **Database Access** → Add user with read/write permissions
3. **Network Access** → Add IP `0.0.0.0/0` (allow all, required for Vercel)
4. **Connect** → Copy the connection string and paste it as `MONGODB_URI` in Vercel

---

## Project Structure

```
mr-marriage/
├── public/
│   └── videos/          ← Put welcome.mp4 here
├── src/
│   ├── components/
│   │   ├── FloralDecor.jsx   # SVG floral decorations
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Home.jsx          # Hero, countdown, video, event details
│   │   ├── Schedule.jsx      # Timeline + calendar invite
│   │   ├── RSVP.jsx          # 2-step RSVP form
│   │   └── Admin.jsx         # Admin dashboard (hidden URL)
│   ├── App.jsx               # Router + layout
│   └── index.css             # Tailwind + global styles
├── api/
│   ├── _db.js                # MongoDB connection helper
│   ├── rsvp.js               # POST /api/rsvp
│   └── guests.js             # GET /api/guests  DELETE /api/guests/:id
├── vercel.json
└── .env.example              # Copy to .env and fill in your values
```

---

## Pages

| Route               | Description                          |
|---------------------|--------------------------------------|
| `/`                 | Home — names, countdown, video, CTA  |
| `/schedule`         | Event timeline + calendar invite     |
| `/rsvp`             | 2-step RSVP form (open to anyone)    |
| `/admin-mr-2026`    | Admin dashboard (change slug!)       |
