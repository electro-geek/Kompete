# Kompete

**Autonomous Competitor Research Agent — boardroom-ready SWOT reports in 60 seconds.**

Kompete is an AI-powered web application that takes a company name and autonomously browses the web, pulls financials, news, customer reviews, and social signals, then synthesizes everything into a structured competitive intelligence report with a SWOT analysis, strategic recommendations, and a downloadable PDF.

Built for the **Milan AI Week — AI Agent Olympics Hackathon 2026**.

---

## What it does

A manager or founder types in a competitor's name. Kompete does the rest:

1. **Launches four parallel research agents** — each one uses Gemini 2.0 Flash with Google Search to autonomously browse the web for a specific data category
2. **Synthesizes the findings** — a final Gemini call reads all four research outputs and produces a structured JSON report
3. **Renders a live report** — the Next.js frontend displays the results as a rich interactive page with a SWOT grid, financial snapshot, sentiment score, and strategic recommendations
4. **Exports to PDF** — one click downloads a polished, print-ready PDF suitable for a boardroom meeting

The entire process takes approximately 45–60 seconds. No human input is required after typing the company name.

---

## Functionalities

### Core research pipeline

- **News agent** — searches for recent headlines about the company: product launches, leadership changes, controversies, partnerships, and major announcements with dates
- **Financials agent** — finds revenue figures, funding rounds, valuation estimates, market share data, and growth trajectory from public sources
- **Reviews agent** — scrapes sentiment from G2, Trustpilot, Glassdoor, Reddit, and app stores; produces a sentiment score out of 10 and a breakdown of common praise and complaints
- **Social signals agent** — analyses LinkedIn following, Twitter/X activity, community engagement, recent campaigns, and overall brand perception

All four agents run in parallel using Python `asyncio`, cutting total research time roughly in half compared to sequential execution.

### AI synthesis

- **SWOT analysis** — four quadrants (Strengths, Weaknesses, Opportunities, Threats) each with four specific, evidence-backed bullet points
- **Executive summary** — three to four sentence overview of the company's current competitive position
- **Financial snapshot** — four key metrics displayed as cards: revenue, valuation, growth rate, total funding
- **Customer sentiment score** — 1–10 score with a visual bar derived from review aggregation
- **Key insights** — three to five non-obvious strategic observations extracted from the research
- **Strategic recommendations** — three actionable recommendations for a competing business
- **Competitive threats** — direct threats the company poses to its rivals
- **Data sources** — full list of sources the agents pulled from, shown in the report footer

### Live progress tracking

The research page shows a live step-by-step progress tracker via Server-Sent Events (SSE). As each agent completes, the UI updates in real time:

```
✓ News agent complete
✓ Financials agent complete
✓ Reviews agent complete
✓ Social signals agent complete
⟳ Synthesizing SWOT analysis...
✓ Report ready
```

This makes the 60-second wait feel transparent and demonstrates the multi-agent architecture to users and judges.

### Report output

- **Interactive HTML report** — rendered in the browser as a structured React page with a sticky navigation header, section anchors, and a clean card-based layout
- **PDF download** — a print-ready PDF generated server-side by WeasyPrint from the same report data; suitable for sharing in meetings or attaching to emails
- **Shareable URL** — each report lives at `/report/{company}` and can be bookmarked or shared (as long as the server is running)

---

## Project Structure

```
kompete/
│
├── backend/                        # FastAPI Python backend
│   ├── main.py                     # FastAPI app, all routes
│   ├── agents.py                   # Gemini research agents + synthesis
│   ├── report.py                   # PDF generation with WeasyPrint
│   ├── templates/
│   │   └── report_pdf.html         # Jinja2 template for PDF only
│   ├── requirements.txt
│   └── .env                        # GEMINI_API_KEY (not committed)
│
├── frontend/                       # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page with search input
│   │   │   ├── research/
│   │   │   │   └── [company]/
│   │   │   │       └── page.tsx    # Live progress tracker
│   │   │   └── report/
│   │   │       └── [company]/
│   │   │           └── page.tsx    # Full report page
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   └── report/
│   │   │       ├── SwotGrid.tsx
│   │   │       ├── FinancialSnapshot.tsx
│   │   │       ├── SentimentScore.tsx
│   │   │       ├── InsightsList.tsx
│   │   │       └── Recommendations.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # API calls to FastAPI
│   │   │   └── types.ts            # TypeScript interfaces
│   │   └── hooks/
│   │       └── useResearchStream.ts # SSE hook
│   ├── package.json
│   └── tailwind.config.ts
│
├── design.md                       # This project's design document
├── tech_stack.md                   # Tech stack details
└── README.md                       # This file
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

### Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create your .env file
echo "GEMINI_API_KEY=your_key_here" > .env

# Start the backend
uvicorn main:app --reload --port 8000
```

The FastAPI backend will be running at `http://localhost:8000`.
Auto-generated API docs available at `http://localhost:8000/docs`.

### Frontend setup

```bash
cd frontend
npm install

# Create your .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the frontend
npm run dev
```

The Next.js frontend will be running at `http://localhost:3000`.

Open your browser at `http://localhost:3000`, type any company name, and hit Research.

---

## API Reference

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/` | Health check | `{ "status": "ok" }` |
| `POST` | `/research` | Start research job | `{ "job_id": "notion" }` |
| `GET` | `/stream/{company}` | SSE — live agent progress | `text/event-stream` |
| `GET` | `/report/{company}` | Get full report as JSON | `ReportData` JSON |
| `GET` | `/download/{company}` | Download report as PDF | `application/pdf` |

### POST /research — Request body

```json
{
  "company": "Notion"
}
```

### GET /report/{company} — Response schema

```json
{
  "company": "Notion",
  "executive_summary": "...",
  "swot": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "financial_snapshot": {
    "revenue": "$...",
    "valuation": "$...",
    "growth": "...%",
    "funding": "$..."
  },
  "sentiment_score": 8,
  "key_insights": ["...", "..."],
  "strategic_recommendations": ["...", "..."],
  "competitive_threats": ["...", "..."],
  "data_sources": ["...", "..."]
}
```

---

## Deployment (Vultr)

```bash
# On a fresh Vultr Ubuntu 24.04 VPS

# Install dependencies
sudo apt update && sudo apt install python3-pip python3-venv nodejs npm nginx -y

# Clone the repo
git clone https://github.com/your-username/rivalytics.git
cd rivalytics

# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env

# Frontend
cd ../frontend && npm install && npm run build

# Start both as background processes
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
nohup npm start --prefix ../frontend -- -p 3000 &

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx config:
```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo nginx -s reload
```

Your app is live at your Vultr public IP.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key from Google AI Studio |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend (e.g. `http://localhost:8000`) |

---

## Limitations (Hackathon Scope)

- Reports are stored in memory — restarting the server clears cached reports
- One research job runs at a time per company name; no queue or job management
- Research quality depends on what Gemini's Google Search tool finds publicly; private companies with limited web presence will produce thinner reports
- PDF styling is basic; production version would match the Next.js design pixel-for-pixel

---

## Built With

- [Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/) — AI model with built-in Google Search
- [FastAPI](https://fastapi.tiangolo.com/) — Python backend framework
- [Next.js 14](https://nextjs.org/) — React frontend framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [WeasyPrint](https://weasyprint.org/) — Server-side PDF generation
- [Vultr](https://vultr.com/) — Cloud infrastructure

---

## License

MIT — free to use, modify, and distribute.