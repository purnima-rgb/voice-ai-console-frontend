# voice-ai-console-frontend

React + TypeScript + Vite + Tailwind CSS frontend for the Voice AI Console — a multi-university student data management console with role-based access, CSV upload + validation, and unified Voice AI CSV export.

## Local development

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**.

## Build

```bash
npm run build
```

Output goes to `dist/`. Vercel auto-detects this as a Vite project — no build config needed.

## Backend

The companion Express + TypeScript backend lives in a separate repo:
**`purnima-rgb/voice-ai-console`** (under `backend/`).

The frontend reads its API base URL from `VITE_API_URL`:
- Local dev: defaults to `http://localhost:3001/api` (no env var needed)
- Production: set `VITE_API_URL` in Vercel project settings to your deployed backend URL (e.g. `https://your-backend.up.railway.app/api`)

## Demo logins (when backend is running)

| Role | Email | Password |
|---|---|---|
| System Administrator | `admin@voiceai.com` | `Admin@123` |
| Data Manager | `manager@voiceai.com` | `Manager@123` |
| Support Agent | `agent@voiceai.com` | `Agent@123` |

## Features

- Login + JWT-backed session
- Role-based navigation (admin / data manager / support agent)
- Cascading filters: University → Program → Data Type
- Drag & drop CSV upload with mandatory-column validation
- Downloadable error report (original row + missing columns)
- Data table with horizontal + vertical scroll, sticky header
- Unified Voice AI CSV export (joins student list + calling data by email)
