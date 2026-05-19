"""
Kompete — main.py
FastAPI application: all routes for research, SSE streaming, report retrieval, and PDF download.
"""

from __future__ import annotations

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

import asyncio
import json
import logging
import time
import urllib.parse
from collections import OrderedDict
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

from config import (
    HOST,
    PORT,
    RELOAD,
    LOG_LEVEL,
    CORS_ORIGINS,
    REPORT_CACHE_TTL_SECONDS,
    MAX_CACHED_REPORTS,
)
from agents import run_research_pipeline
from report import generate_pdf

# ── Logging setup ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("kompete")

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Kompete API",
    description="Autonomous competitor research agent — boardroom-ready SWOT reports in 60 seconds.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

from fastapi import Request

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# ── Database & Optional Authentication Helpers ───────────────────────────────
import base64
from config import FIREBASE_PROJECT_ID
from database import init_db, save_report, get_reports_for_user

@app.on_event("startup")
async def startup_event():
    init_db()

def decode_firebase_token(token: str, project_id: str = "") -> dict | None:
    try:
        if token.startswith("mock-") or token == "mock-dev-token":
            return {
                "uid": "demo_user_123",
                "email": "demo@kompete.ai",
                "name": "Demo Competitor"
            }
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_bytes = base64.b64decode(payload_b64)
        claims = json.loads(payload_bytes.decode("utf-8"))
        if "exp" in claims and claims["exp"] < time.time():
            logger.warning("Token has expired")
            return None
        if project_id:
            # Safely clean project_id if it contains service account suffixes or file extensions
            clean_project_id = project_id.strip()
            if ".json" in clean_project_id:
                clean_project_id = clean_project_id.split(".json")[0]
            if "-firebase-adminsdk" in clean_project_id:
                clean_project_id = clean_project_id.split("-firebase-adminsdk")[0]

            expected_iss = f"https://securetoken.google.com/{clean_project_id}"
            if claims.get("iss") != expected_iss:
                logger.warning(f"Invalid issuer: {claims.get('iss')}, expected: {expected_iss}")
                return None
            if claims.get("aud") != clean_project_id:
                logger.warning(f"Invalid audience: {claims.get('aud')}, expected: {clean_project_id}")
                return None
        return claims
    except Exception as e:
        logger.error(f"Error parsing firebase token: {e}")
        return None

async def get_current_user_id(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    if not token:
        token = request.query_params.get("token")
    if not token:
        return None
    claims = decode_firebase_token(token, FIREBASE_PROJECT_ID)
    if claims:
        return claims.get("uid") or claims.get("sub")
    return None

# ── In-memory stores ───────────────────────────────────────────────────────────
# Keyed by lowercased company name
report_cache: dict[str, dict] = {}          # { company: report_data }
job_progress: dict[str, list[str]] = {}     # { company: [event, event, ...] }
job_status: dict[str, str] = {}             # { company: "running" | "done" | "error" }
job_timestamps: dict[str, float] = {}       # { company: created_at }

# SSE subscriber queues: { company: [asyncio.Queue, ...] }
_sse_subscribers: dict[str, list[asyncio.Queue]] = {}


def _normalise(company: str) -> str:
    return company.strip().lower()


def _evict_old_reports():
    """Remove reports older than TTL to keep memory bounded."""
    now = time.time()
    to_delete = [
        k for k, ts in job_timestamps.items()
        if now - ts > REPORT_CACHE_TTL_SECONDS
    ]
    for k in to_delete:
        report_cache.pop(k, None)
        job_progress.pop(k, None)
        job_status.pop(k, None)
        job_timestamps.pop(k, None)
        _sse_subscribers.pop(k, None)

    # Also cap at MAX_CACHED_REPORTS (evict oldest)
    if len(report_cache) > MAX_CACHED_REPORTS:
        sorted_keys = sorted(job_timestamps, key=lambda k: job_timestamps[k])
        for k in sorted_keys[:len(report_cache) - MAX_CACHED_REPORTS]:
            report_cache.pop(k, None)
            job_progress.pop(k, None)
            job_status.pop(k, None)
            job_timestamps.pop(k, None)
            _sse_subscribers.pop(k, None)


# ── Background research task ───────────────────────────────────────────────────

async def _broadcast(company_key: str, event: str):
    """Push an SSE event to all active subscribers."""
    queues = _sse_subscribers.get(company_key, [])
    for q in queues:
        await q.put(event)
    job_progress.setdefault(company_key, []).append(event)


async def _do_research(company: str, user_id: str | None = None):
    key = _normalise(company)
    job_status[key] = "running"
    job_timestamps[key] = time.time()

    async def progress_callback(event: str):
        await _broadcast(key, event)

    try:
        report = await run_research_pipeline(company, progress_callback=progress_callback)
        report_cache[key] = report
        job_status[key] = "done"
        if user_id:
            save_report(user_id, company, report)
        await _broadcast(key, "done")
    except Exception as e:
        logger.exception(f"Research failed for '{company}': {e}")
        job_status[key] = "error"
        await _broadcast(key, f"error:{e}")
    finally:
        # Signal all subscribers that the stream is finished
        for q in _sse_subscribers.get(key, []):
            await q.put(None)  # sentinel
        _evict_old_reports()



# ── Routes ─────────────────────────────────────────────────────────────────────

class ResearchRequest(BaseModel):
    company: str


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "Kompete API"}


@app.post("/research", tags=["Research"])
async def start_research(body: ResearchRequest, request: Request, background_tasks: BackgroundTasks):
    """
    Start a research job for the given company.
    Returns immediately with the job_id (company slug).
    If a completed report already exists in cache, returns that.
    """
    company = body.company.strip()
    if not company:
        raise HTTPException(status_code=400, detail="company name cannot be empty")

    key = _normalise(company)
    user_id = await get_current_user_id(request)

    if job_status.get(key) == "running":
        return {"job_id": key, "status": "already_running"}

    if key in report_cache:
        # If user is logged in, ensure it is also saved to their database history
        if user_id:
            save_report(user_id, company, report_cache[key])
        return {"job_id": key, "status": "cached"}

    # Check database fallback if cached in database
    if user_id:
        try:
            import sqlite3
            from database import DB_PATH
            conn = sqlite3.connect(str(DB_PATH))
            cursor = conn.cursor()
            cursor.execute("SELECT report_data FROM reports WHERE user_id = ? AND company = ?", (user_id, key))
            row = cursor.fetchone()
            conn.close()
            if row:
                report_data = json.loads(row[0])
                report_cache[key] = report_data
                job_status[key] = "done"
                return {"job_id": key, "status": "cached"}
        except Exception as e:
            logger.error(f"Failed database lookup on start_research: {e}")

    # Reset any stale state
    job_progress[key] = []
    _sse_subscribers.setdefault(key, [])

    background_tasks.add_task(_do_research, company, user_id)
    return {"job_id": key, "status": "started"}


@app.get("/stream/{company}", tags=["Research"])
async def stream_progress(company: str):
    """
    Server-Sent Events endpoint.
    Streams agent progress events as they happen.
    """
    key = _normalise(urllib.parse.unquote(company))

    queue: asyncio.Queue = asyncio.Queue()
    _sse_subscribers.setdefault(key, []).append(queue)

    # Replay any events that already happened
    past_events = job_progress.get(key, [])

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # Replay past events
            for event in past_events:
                yield _sse_format(event)
                await asyncio.sleep(0)

            # If already done/error, no need to wait
            if job_status.get(key) in ("done", "error"):
                yield _sse_format("stream_closed")
                return

            # Wait for new events
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=120.0)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue

                if event is None:  # sentinel — stream done
                    yield _sse_format("stream_closed")
                    break
                yield _sse_format(event)
                if event.startswith("error:") or event == "done":
                    yield _sse_format("stream_closed")
                    break
        finally:
            _sse_subscribers.get(key, []).remove(queue) if queue in _sse_subscribers.get(key, []) else None

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/reports", tags=["Report"])
async def get_all_user_reports(request: Request):
    """Retrieve all reports generated by the currently signed-in user."""
    user_id = await get_current_user_id(request)
    if not user_id:
        return []
    return get_reports_for_user(user_id)


@app.get("/report/{company}", tags=["Report"])
async def get_report(company: str, request: Request):
    """Return the full report JSON for a completed research job."""
    key = _normalise(urllib.parse.unquote(company))
    user_id = await get_current_user_id(request)

    # Try in-memory cache first
    if key in report_cache:
        return report_cache[key]

    # Try database fallback if user is logged in
    if user_id:
        try:
            import sqlite3
            from database import DB_PATH
            conn = sqlite3.connect(str(DB_PATH))
            cursor = conn.cursor()
            cursor.execute("SELECT report_data FROM reports WHERE user_id = ? AND company = ?", (user_id, key))
            row = cursor.fetchone()
            conn.close()
            if row:
                report_data = json.loads(row[0])
                report_cache[key] = report_data
                job_status[key] = "done"
                return report_data
        except Exception as e:
            logger.error(f"Failed database lookup on get_report: {e}")

    # Fallback to general lookup status
    status = job_status.get(key, "not_found")
    if status == "running":
        raise HTTPException(status_code=202, detail="research still in progress")
    elif status == "error":
        raise HTTPException(status_code=500, detail="research failed; please retry")
    else:
        raise HTTPException(status_code=404, detail=f"no report found for '{company}'")


@app.get("/download/{company}", tags=["Report"])
async def download_pdf(company: str, request: Request):
    """Generate and return the report as a downloadable PDF."""
    key = _normalise(urllib.parse.unquote(company))
    user_id = await get_current_user_id(request)

    report = None
    if key in report_cache:
        report = report_cache[key]
    elif user_id:
        try:
            import sqlite3
            from database import DB_PATH
            conn = sqlite3.connect(str(DB_PATH))
            cursor = conn.cursor()
            cursor.execute("SELECT report_data FROM reports WHERE user_id = ? AND company = ?", (user_id, key))
            row = cursor.fetchone()
            conn.close()
            if row:
                report = json.loads(row[0])
                # Populate cache
                report_cache[key] = report
                job_status[key] = "done"
        except Exception as e:
            logger.error(f"Failed database lookup on download_pdf: {e}")

    if not report:
        raise HTTPException(status_code=404, detail=f"no report found for '{company}'")

    try:
        pdf_bytes = generate_pdf(report)
    except Exception as e:
        logger.exception(f"PDF generation failed for '{company}': {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    filename = f"kompete-{key}-report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )



# ── SSE helper ─────────────────────────────────────────────────────────────────

def _sse_format(data: str) -> str:
    return f"data: {data}\n\n"


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=RELOAD,
        log_level=LOG_LEVEL,
    )
