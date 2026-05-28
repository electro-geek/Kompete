# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Kompete is an AI-powered competitive intelligence tool. A user types a company name; four Gemini agents research it sequentially (news, financials, reviews, social signals); a fifth Gemini call synthesizes the results into a structured SWOT report. The report streams to the browser via SSE and can be exported as a PDF.

---

## Development commands

```bash
./start.sh                          # starts both backend and frontend

# Backend only
cd backend && source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
cd frontend
npm run dev        # http://localhost:3001 (or :3000)
npm run build      # production build — always run after significant changes
npm run lint       # ESLint

# Admin dashboard (Streamlit)
streamlit run admin/dashboard.py

# Utility scripts (run from backend/ with venv active)
python check_db.py      # inspect PostgreSQL tables
python test_gemini.py   # smoke-test the Gemini API key

# Docker
cd backend && docker compose up     # backend on 8001→8000
docker compose up                   # frontend on 3000 (root docker-compose.yml)
```

If the frontend throws `Cannot find module './NNN.js'` after file changes, delete `.next/` and restart dev.

---

## Required environment variables

### `backend/.env` (or `backend/config.properties`)

```
GEMINI_API_KEY=...         # Google AI Studio key — required
POSTGRES_URL=...           # or NILEDB_URL — required
FIREBASE_PROJECT_ID=...    # Firebase project ID for JWT validation
ADMIN_EMAILS=...           # comma-separated; bypasses 1-report free limit
ADMIN_SECRET=...           # required for X-Admin-Secret header on /admin/*
ENCRYPTION_KEY=...         # Fernet key for stored user Gemini keys
CORS_ORIGINS=http://localhost:3000,...
GEMINI_MODEL=gemini-2.5-flash   # optional override
```

`config.py` reads `.env` first, then `config.properties` (plain `key=value`). Either file works; both are loaded.

### `frontend/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Dev mode (no Firebase needed):** If the `NEXT_PUBLIC_FIREBASE_*` vars are absent, `AuthContext.tsx` falls back to a mock user (`uid: demo_user_123`, token: `mock-dev-token`). The backend accepts `mock-dev-token` as a valid token in this mode, so the full flow works locally without a Firebase project.

---

## Architecture

### Request flow

```
User types company name
  → POST /research          (FastAPI, authenticated)
  → _do_research()          (FastAPI BackgroundTask)
      → run_research_pipeline() in agents.py
          → 4 sequential Gemini agents: news → financials → reviews → social
            (2-second pauses between calls to respect free-tier RPM limits)
          → synthesize_report() — 5th Gemini call, no search, returns JSON
      → save_report() → PostgreSQL
  → GET /stream/{company}   (SSE)
      → replays job_progress[] for late-joining clients, then pushes live events
      → useResearchStream hook → updates ProgressTracker → navigates on synthesis_done
  → GET /report/{company}   → report_cache hit or Postgres fetch
  → GET /download/{company} → WeasyPrint PDF from report JSON
```

### Backend (`backend/`)

- **`main.py`** — FastAPI app. All routes, in-memory dicts (`report_cache`, `job_progress`, `job_status`, `_sse_subscribers`), Firebase JWT decoding, and the `_do_research` BackgroundTask.
- **`agents.py`** — Five Gemini calls wrapped in `_run_agent()` (6-attempt exponential-backoff retry). The four research agents run sequentially inside `_run_sequentially()` (the function wraps them inside `asyncio.wait_for` with `RESEARCH_TIMEOUT_SECONDS`). `_clean_json()` strips markdown fences and does a state-machine repair pass on truncated Gemini JSON.
- **`config.py`** — Single import point for all settings. Every other module reads from here, never directly from env.
- **`database.py`** — Raw psycopg2, no ORM. Three tables: `reports`, `user_settings` (encrypted Gemini keys), `user_profiles`.
- **`report.py`** — WeasyPrint PDF from `templates/report_pdf.html` (Jinja2).

### Frontend (`frontend/`)

- Next.js 14 App Router. Two dynamic routes: `/research/[company]` and `/report/[company]`.
- **`context/AuthContext.tsx`** — Google OAuth via Firebase with demo-mode fallback. Exports `user: UserSession | null`, `isDemoMode`, `signInWithGoogle`, `logout`.
- **`hooks/useResearchStream.ts`** — `EventSource` → `ResearchProgress` state → auto-navigates to report on `synthesis_done`.
- **`lib/api.ts`** — All backend calls. Token goes as `Authorization: Bearer` header for fetch, and as `?token=` query param for EventSource/PDF URLs (EventSource doesn't support custom headers).
- **`lib/types.ts`** — `ReportData` interface is the canonical shape of the synthesis JSON. Keep in sync with the Gemini prompt in `agents.py`.
- **`components/report/`** — One component per report section: `SwotGrid`, `FinancialSnapshot`, `SentimentScore`, `InsightsList`, `Recommendations`, `StrategicMoves`, `SourcesList`, `ExecutiveSummary`.
- GSAP (`gsap` npm package) is available for animations.

### Admin (`admin/`)

Streamlit app calling `GET /admin/stats` and `GET /admin/users` with `X-Admin-Secret` header. Standalone — no shared code with the main backend.

### Vercel deployment

`api/index.py` (repo root) and `backend/api/index.py` are thin shims that add the correct directory to `sys.path` and re-export `app` from `main.py`. These exist solely for Vercel's serverless function discovery — do not add logic there.

---

## Frontend design system

The UI uses CSS custom properties (defined in `app/globals.css`) as the single source of truth for all colors. Tailwind is used for layout and spacing only; colors are set via inline `style` props referencing CSS vars.

Key variables:
```
--bg / --surface / --elevated / --border   backgrounds and borders
--fg / --fg-dim / --fg-subtle              text hierarchy
--accent / --accent-bg / --accent-border   indigo primary color
--green/amber/red  each with -bg and -border variants for semantic states
```

Typography: **Instrument Serif** (italic, for display headings and report titles) + **Inter** (body) + **system monospace** (numbers, dates, IDs). The `.display`, `.mono`, `.section-label`, and `.badge` utility classes are defined in `globals.css` and used throughout report components.

---

## Auth and access control

- All `/research` requests require a valid Firebase JWT or `mock-dev-token`.
- Free-tier users get 1 report. Supplying a personal Gemini key via `POST /user/settings` bypasses this.
- `ADMIN_EMAILS` in config bypasses the per-user limit server-side.
- `/admin/*` routes require `X-Admin-Secret` header.

---

## Key implementation details

- **In-memory caches are ephemeral.** `report_cache`, `job_progress`, `job_status` are plain dicts — server restart clears them. Only PostgreSQL is persistent.
- **SSE replay.** `_sse_subscribers` holds an `asyncio.Queue` per company. A late-joining client receives the full `job_progress[key]` list replayed before live events.
- **Cache eviction.** `_evict_old_reports()` runs after every job, removing entries older than `REPORT_CACHE_TTL_SECONDS` and capping at `MAX_CACHED_REPORTS`.
- **User Gemini keys** are stored Fernet-encrypted in `user_settings`; decrypted in-memory per request.
- **`backend/kompete.db`** is an unused SQLite artifact — the backend exclusively uses PostgreSQL.
