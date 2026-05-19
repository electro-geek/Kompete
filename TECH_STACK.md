# Kompete — Tech Stack

## Frontend

| Layer | Technology | Version | Why |
|---|---|---|---|
| Framework | Next.js | 14 (App Router) | File-based routing, React server components, easy deployment |
| Language | TypeScript | 5.x | Type safety for report schema, fewer runtime bugs |
| Styling | Tailwind CSS | 3.x | Rapid UI development, no custom CSS files needed |
| HTTP client | Native `fetch` | — | Built into Next.js, no extra dependency needed |
| SSE (live progress) | Native `EventSource` | — | Browser-native, no library needed for SSE consumption |
| PDF trigger | `window.location` redirect | — | Simple GET to `/download/{company}` endpoint |

### Frontend Dev Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "react-dom": "18.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "postcss": "8.x",
  "autoprefixer": "10.x",
  "@types/node": "20.x",
  "@types/react": "18.x"
}
```

---

## Backend

| Layer | Technology | Version | Why |
|---|---|---|---|
| Framework | FastAPI | 0.111+ | Async support, automatic OpenAPI docs, fast to write |
| Runtime | Python | 3.11+ | asyncio support, rich AI library ecosystem |
| ASGI server | Uvicorn | 0.29+ | Production-grade ASGI server for FastAPI |
| AI model | Gemini 2.0 Flash | — | Best speed/quality tradeoff, built-in Google Search tool |
| AI SDK | google-generativeai | 0.7+ | Official Gemini Python SDK |
| PDF generation | WeasyPrint | 62+ | HTML-to-PDF with full CSS support, runs server-side |
| HTML templating | Jinja2 | 3.x | Used only for the PDF template, not the web frontend |
| Environment | python-dotenv | 1.x | Load API keys from `.env` file |
| HTTP client | httpx | 0.27+ | Async HTTP for any external calls |
| Concurrency | asyncio | built-in | Run 4 research agents in parallel |

### Backend Dependencies (`requirements.txt`)

```
fastapi==0.111.0
uvicorn==0.29.0
google-generativeai==0.7.0
weasyprint==62.3
jinja2==3.1.4
python-dotenv==1.0.1
httpx==0.27.0
```

---

## AI & External Services

| Service | Purpose | Cost |
|---|---|---|
| Gemini 2.0 Flash | All LLM calls — research prompts, SWOT synthesis | Free tier: 15 RPM, 1M tokens/day |
| Google Search (built-in tool) | Live web search within Gemini calls | Included with Gemini API |

No additional search APIs (SerpAPI, Tavily, etc.) are needed. Gemini's built-in `google_search` tool handles all web browsing autonomously.

---

## Infrastructure & Deployment

| Layer | Technology | Why |
|---|---|---|
| VPS | Vultr (Ubuntu 24.04) | Hackathon sponsor, $200 free credits, bonus prize track |
| Reverse proxy | Nginx | Routes `/api/*` to FastAPI, `/*` to Next.js |
| Process manager | systemd | Keeps FastAPI and Next.js running as persistent services |
| SSL (optional) | Let's Encrypt / Certbot | Free HTTPS if using a custom domain |

---

## Development Tools

| Tool | Purpose |
|---|---|
| VS Code | Primary editor |
| ESLint + Prettier | Frontend linting and formatting |
| Ruff | Python linting (fast, zero config) |
| Postman / HTTPie | API testing during development |
| Git + GitHub | Version control |

---

## Why These Choices

**Next.js over plain React** — App Router gives file-based routing for free. The `/research/[company]` and `/report/[company]` dynamic routes map naturally to the app's flow without any router setup.

**FastAPI over Flask/Django** — Native async support lets the four research agents run in parallel with `asyncio.gather`. Flask would require threading or Celery for the same result. FastAPI also auto-generates an OpenAPI spec at `/docs` which is useful for hackathon demos.

**Gemini 2.0 Flash over Gemini Pro** — Flash is significantly faster (important for a 60-second demo) and the quality is more than sufficient for research summarization. The built-in Google Search tool eliminates the need for any external search API.

**WeasyPrint over Puppeteer/Playwright** — WeasyPrint is a pure Python library with no browser dependency. Puppeteer would require a headless Chromium install on the VPS. For a hackathon deploy, WeasyPrint is simpler and lighter.

**SSE over WebSockets** — Research progress is one-way (server → client). SSE is simpler than WebSockets for this use case: no handshake, no socket management, works natively in browsers, and FastAPI supports it with `StreamingResponse`.

**In-memory cache over a database** — For hackathon scope, a Python dict is sufficient. There are no concurrent users to worry about, and reports are ephemeral. Adding Supabase or Redis would be the first scaling step post-hackathon.