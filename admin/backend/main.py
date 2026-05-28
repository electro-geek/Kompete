"""
Kompete Admin API — admin/backend/main.py
Standalone FastAPI service for the admin panel.
Connects to the same PostgreSQL database as the main backend.
"""
from __future__ import annotations

import sys
import os
import logging

# Allow importing from parent backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../backend"))

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from config import ADMIN_SECRET
from database import get_all_users, get_reports_for_user, init_db, get_connection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("kompete-admin")

app = FastAPI(
    title="Kompete Admin API",
    description="Internal admin panel API for Kompete.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3002",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    init_db()
    logger.info("Admin API started, database ready.")


# ── Auth helper ────────────────────────────────────────────────────────────────

def verify_admin(request: Request) -> None:
    """Raise 403 if the X-Admin-Secret header is missing or wrong."""
    secret = request.headers.get("X-Admin-Secret", "")
    if not secret or secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret.")


# ── Internal helpers ───────────────────────────────────────────────────────────

def _get_all_reports() -> list[dict]:
    """Fetch all reports joined with user profile data."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                r.user_id,
                r.company,
                r.created_at,
                COALESCE(up.email, '')  AS email,
                COALESCE(up.name,  '')  AS name
            FROM reports r
            LEFT JOIN user_profiles up ON up.user_id = r.user_id
            ORDER BY r.created_at DESC
        """)
        rows = cursor.fetchall()
        return [
            {
                "user_id":    row[0],
                "company":    row[1],
                "created_at": row[2].isoformat() if hasattr(row[2], "isoformat") else str(row[2]),
                "email":      row[3],
                "name":       row[4],
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"_get_all_reports failed: {e}")
        return []
    finally:
        conn.close()


def _get_activity_by_day(days: int = 30) -> list[dict]:
    """Return report counts grouped by day for the last N days."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                DATE(created_at)       AS day,
                COUNT(*)               AS count
            FROM reports
            WHERE created_at >= NOW() - INTERVAL '%s days'
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        """, (days,))
        rows = cursor.fetchall()
        return [
            {"date": str(row[0]), "count": int(row[1])}
            for row in rows
        ]
    except Exception as e:
        logger.error(f"_get_activity_by_day failed: {e}")
        return []
    finally:
        conn.close()


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Kompete Admin API"}


@app.post("/admin/login", tags=["Auth"])
async def admin_login(request: Request):
    """Validate the admin secret and return a success flag."""
    body = await request.json()
    secret = body.get("secret", "")
    if not secret or secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Invalid admin secret.")
    return {"authenticated": True}


@app.get("/admin/stats", tags=["Stats"])
def get_stats(request: Request):
    """Platform-level aggregate stats."""
    verify_admin(request)
    users = get_all_users()
    all_reports = _get_all_reports()
    activity = _get_activity_by_day(30)

    total_users = len(users)
    total_reports = sum(u["report_count"] for u in users)
    users_with_key = sum(1 for u in users if u["has_api_key"])

    # Top 5 most-analyzed companies
    company_counts: dict[str, int] = {}
    for r in all_reports:
        company_counts[r["company"]] = company_counts.get(r["company"], 0) + 1
    top_companies = sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_users":           total_users,
        "total_reports":         total_reports,
        "users_with_api_key":    users_with_key,
        "users_on_free_tier":    total_users - users_with_key,
        "recent_reports":        all_reports[:8],
        "activity_by_day":       activity,
        "top_companies":         [{"company": c, "count": n} for c, n in top_companies],
    }


@app.get("/admin/users", tags=["Users"])
def list_users(request: Request):
    """List all users with aggregated stats."""
    verify_admin(request)
    users = get_all_users()
    return {"total": len(users), "users": users}


@app.get("/admin/users/{user_id}/reports", tags=["Users"])
def user_report_list(user_id: str, request: Request):
    """All reports for a specific user."""
    verify_admin(request)
    reports = get_reports_for_user(user_id)
    return {"user_id": user_id, "total": len(reports), "reports": reports}


@app.delete("/admin/users/{user_id}", tags=["Users"])
def delete_user(user_id: str, request: Request):
    """Permanently delete all data for a user."""
    verify_admin(request)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reports        WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_settings  WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_profiles  WHERE user_id = %s", (user_id,))
        conn.commit()
        logger.info(f"Deleted all data for user {user_id}")
        return {"status": "deleted", "user_id": user_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/admin/users/{user_id}/reset-limit", tags=["Users"])
def reset_user_limit(user_id: str, request: Request):
    """Delete all reports for a user, resetting their free-tier limit."""
    verify_admin(request)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reports WHERE user_id = %s", (user_id,))
        conn.commit()
        logger.info(f"Reset report limit for user {user_id}")
        return {"status": "reset", "user_id": user_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/admin/users/{user_id}/reports/{company}", tags=["Users"])
def delete_user_report(user_id: str, company: str, request: Request):
    """Delete a specific report for a user."""
    verify_admin(request)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM reports WHERE user_id = %s AND company = %s",
            (user_id, company.lower()),
        )
        conn.commit()
        return {"status": "deleted", "user_id": user_id, "company": company}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/admin/reports", tags=["Reports"])
def list_all_reports(request: Request):
    """All reports across all users, joined with profile data."""
    verify_admin(request)
    reports = _get_all_reports()
    return {"total": len(reports), "reports": reports}


@app.get("/admin/activity", tags=["Stats"])
def get_activity(request: Request, days: int = 30):
    """Report counts grouped by day for the past N days."""
    verify_admin(request)
    return {"days": days, "activity": _get_activity_by_day(days)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
