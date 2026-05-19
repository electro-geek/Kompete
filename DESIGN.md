# Rivalytics — Design Document

## Overview

Rivalytics is a decoupled web application with a Python/FastAPI backend and a Next.js frontend. The backend handles all AI orchestration, web research, and PDF generation. The frontend is a standalone Next.js app that communicates with the backend exclusively via REST API. There is no server-side rendering of report content — all report data flows as JSON from the API to the frontend, which renders it client-side.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                    Next.js Frontend                     │
│         (React components, Tailwind CSS, TypeScript)    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                       │
│                  (Python, Uvicorn)                      │
│                                                         │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────┐  │
│   │ Orchestrator│   │  Sub-agents  │   │   Report   │  │
│   │   Agent     │──▶│  (4 parallel)│──▶│  Generator │  │
│   └─────────────┘   └──────────────┘   └────────────┘  │
│           │                                    │        │
│           ▼                                    ▼        │
│   ┌─────────────┐                    ┌──────────────┐   │
│   │  Gemini API │                    │  WeasyPrint  │   │
│   │ (web search)│                    │  PDF Engine  │   │
│   └─────────────┘                    └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Design (Next.js)

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing page — hero, value prop, search input |
| `/research/[company]` | Research progress page — live status updates via SSE |
| `/report/[company]` | Full rendered report — SWOT, financials, insights |

### Component Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing / search
│   ├── research/[company]/
│   │   └── page.tsx              # Progress tracker
│   └── report/[company]/
│       └── page.tsx              # Report view
├── components/
│   ├── SearchBar.tsx             # Main company input
│   ├── ProgressTracker.tsx       # Live agent status steps
│   ├── report/
│   │   ├── ExecutiveSummary.tsx  # Summary card
│   │   ├── SwotGrid.tsx          # 2x2 SWOT matrix
│   │   ├── FinancialSnapshot.tsx # 4 metric cards
│   │   ├── SentimentScore.tsx    # Score bar + breakdown
│   │   ├── InsightsList.tsx      # Key insights
│   │   ├── Recommendations.tsx   # Strategy cards
│   │   └── SourcesList.tsx       # Data attribution
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Spinner.tsx
├── lib/
│   ├── api.ts                    # All fetch calls to FastAPI
│   └── types.ts                  # TypeScript interfaces
└── hooks/
    └── useResearchStream.ts      # SSE hook for live progress
```

### Key Design Decisions

**Server-Sent Events (SSE) for live progress** — Research takes 30–60 seconds. Rather than a blank loading screen, the frontend subscribes to a `/stream/{company}` SSE endpoint and shows live status updates as each agent completes (News agent done, Financials agent done, etc.). This makes the wait feel fast and demonstrates the agentic nature of the system to judges.

**Report as a rich React page** — The report is not a static HTML dump. It is a fully interactive React page with a sticky header, section navigation, and a prominent "Download PDF" button that hits the `/download/{company}` endpoint. This lets judges interact with the data while still producing a printable artefact.

**No client-side AI calls** — All Gemini API calls happen exclusively in the FastAPI backend. The frontend only ever receives structured JSON. This keeps the API key server-side and makes the frontend portable.

---

## Backend Design (FastAPI)

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/research` | Start a research job, returns job ID |
| `GET` | `/stream/{company}` | SSE stream of agent progress |
| `GET` | `/report/{company}` | Return full report JSON |
| `GET` | `/download/{company}` | Return PDF as binary |

### Agent Pipeline

Research runs as four parallel async tasks using `asyncio.gather`, then a synthesis step:

```
research_news()  ─┐
research_financials() ─┤─▶ asyncio.gather() ─▶ synthesize_swot()
research_reviews() ─┤
research_social()  ─┘
```

Running the four sub-agents in parallel cuts total research time from ~120s to ~40s.

### In-Memory Job Store

For hackathon scope, completed reports are stored in a Python dict keyed by company name (lowercased). In production this would be replaced with Redis or a database.

```python
report_cache: dict[str, dict] = {}
```

### CORS Configuration

The FastAPI app enables CORS for the Next.js dev server (`localhost:3000`) and the production Vultr domain so the frontend can call the API freely.

---

## Data Flow — End to End

```
1. User types "Notion" on the landing page
2. Frontend POST /research { company: "Notion" }
3. Backend starts asyncio research tasks, returns { job_id: "notion" }
4. Frontend navigates to /research/notion
5. Frontend subscribes to GET /stream/notion (SSE)
6. Backend streams: "news_done", "financials_done", "reviews_done", "social_done", "synthesis_done"
7. Frontend shows each step completing in real time
8. On "synthesis_done", frontend navigates to /report/notion
9. Frontend fetches GET /report/notion → receives full JSON
10. React components render the SWOT grid, financials, insights
11. User clicks "Download PDF" → GET /download/notion → PDF file
```

---

## Report Data Schema

```typescript
interface ReportData {
  company: string
  executive_summary: string
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  financial_snapshot: {
    revenue: string
    valuation: string
    growth: string
    funding: string
  }
  sentiment_score: number          // 1–10
  key_insights: string[]
  strategic_recommendations: string[]
  competitive_threats: string[]
  data_sources: string[]
}
```

---

## PDF Generation

WeasyPrint renders the report from a Jinja2 HTML template on the backend (separate from the Next.js frontend). The PDF template shares the same visual structure and colour palette as the React report page so the output feels consistent. The PDF is generated on demand when the user clicks download — it is not pre-generated.

---

## Deployment Architecture

```
Vultr VPS (Ubuntu 24)
├── Port 80/443 → Nginx
│   ├── /api/* → proxy to FastAPI (port 8000)
│   └── /* → proxy to Next.js (port 3000)
├── FastAPI process (uvicorn, systemd service)
└── Next.js process (npm start, systemd service)
```

Both the frontend and backend run on the same Vultr VPS behind an Nginx reverse proxy. The frontend calls `/api/research`, `/api/stream/{company}` etc. and Nginx routes them to FastAPI. This avoids CORS issues in production and keeps everything on one server.