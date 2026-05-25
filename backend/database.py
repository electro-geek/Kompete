"""
Kompete — database.py
PostgreSQL-only data layer. All functions connect to the configured Postgres URL.
"""

import json
import logging
import base64
import hashlib

import psycopg2

from config import POSTGRES_URL, NILEDB_URL, ENCRYPTION_KEY

logger = logging.getLogger(__name__)

# ── Connection URL ─────────────────────────────────────────────────────────────
DB_CONN_URL: str = POSTGRES_URL or NILEDB_URL

if not DB_CONN_URL:
    raise RuntimeError(
        "No PostgreSQL URL configured. "
        "Set POSTGRES_URL (or NILEDB_URL) in config.properties or .env."
    )


def get_connection() -> psycopg2.extensions.connection:
    """Open and return a new PostgreSQL connection. Raises on failure."""
    try:
        return psycopg2.connect(DB_CONN_URL)
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")
        raise


# ── Schema init ────────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create all tables if they don't exist yet. Called once at app startup."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id         SERIAL PRIMARY KEY,
                user_id    VARCHAR(255) NOT NULL,
                company    VARCHAR(255) NOT NULL,
                report_data TEXT        NOT NULL,
                created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, company)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id           VARCHAR(255) PRIMARY KEY,
                encrypted_api_key TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id    VARCHAR(255) PRIMARY KEY,
                email      VARCHAR(255),
                name       VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cursor.close()
        logger.info("PostgreSQL database initialized successfully.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to initialize PostgreSQL tables: {e}")
        raise
    finally:
        conn.close()


# ── Encryption helpers ─────────────────────────────────────────────────────────

def _get_fernet():
    try:
        from cryptography.fernet import Fernet
        key_bytes = ENCRYPTION_KEY.encode("utf-8")
        derived_key = base64.urlsafe_b64encode(hashlib.sha256(key_bytes).digest())
        return Fernet(derived_key)
    except ImportError:
        return None


def encrypt_key(api_key: str) -> str:
    f = _get_fernet()
    if f:
        return f.encrypt(api_key.encode()).decode()
    return base64.b64encode(api_key.encode()).decode()


def decrypt_key(encrypted_key: str) -> str:
    f = _get_fernet()
    if f:
        return f.decrypt(encrypted_key.encode()).decode()
    return base64.b64decode(encrypted_key.encode()).decode()


# ── User settings (API key) ────────────────────────────────────────────────────

def save_user_api_key(user_id: str, api_key: str) -> bool:
    if not user_id:
        return False
    enc_key = encrypt_key(api_key)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_settings (user_id, encrypted_api_key)
            VALUES (%s, %s)
            ON CONFLICT(user_id) DO UPDATE
                SET encrypted_api_key = EXCLUDED.encrypted_api_key
        """, (user_id, enc_key))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"save_user_api_key failed: {e}")
        return False
    finally:
        conn.close()


def get_user_api_key(user_id: str) -> str | None:
    if not user_id:
        return None
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT encrypted_api_key FROM user_settings WHERE user_id = %s",
            (user_id,),
        )
        row = cursor.fetchone()
        return decrypt_key(row[0]) if row else None
    except Exception as e:
        logger.error(f"get_user_api_key failed: {e}")
        return None
    finally:
        conn.close()


# ── User profiles ──────────────────────────────────────────────────────────────

def upsert_user_profile(user_id: str, email: str = "", name: str = "") -> None:
    """Save or update a user's email/name (called on every research request)."""
    if not user_id:
        return
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profiles (user_id, email, name, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE
                SET email      = EXCLUDED.email,
                    name       = EXCLUDED.name,
                    updated_at = CURRENT_TIMESTAMP
        """, (user_id, email or "", name or ""))
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"upsert_user_profile failed: {e}")
    finally:
        conn.close()


# ── Reports ────────────────────────────────────────────────────────────────────

def count_user_reports(user_id: str) -> int:
    if not user_id:
        return 0
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(DISTINCT company) FROM reports WHERE user_id = %s",
            (user_id,),
        )
        row = cursor.fetchone()
        return int(row[0]) if row else 0
    except Exception as e:
        logger.error(f"count_user_reports failed: {e}")
        return 0
    finally:
        conn.close()


def save_report(user_id: str, company: str, report_data: dict) -> bool:
    """Save or update a competitor intelligence report for a specific user."""
    if not user_id:
        return False
    company_clean = company.strip().lower()
    report_json = json.dumps(report_data)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reports (user_id, company, report_data)
            VALUES (%s, %s, %s)
            ON CONFLICT(user_id, company)
            DO UPDATE SET report_data = EXCLUDED.report_data,
                          created_at  = CURRENT_TIMESTAMP
        """, (user_id, company_clean, report_json))
        conn.commit()
        logger.info(f"Saved report for '{company_clean}' under user {user_id}")
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"save_report failed: {e}")
        return False
    finally:
        conn.close()


def get_reports_for_user(user_id: str) -> list[dict]:
    """Retrieve all reports generated by a specific user."""
    if not user_id:
        return []
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT company, report_data, created_at
            FROM reports
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        reports = []
        for row in rows:
            try:
                reports.append({
                    "company":    row[0],
                    "report":     json.loads(row[1]),
                    "created_at": row[2].isoformat() if hasattr(row[2], "isoformat") else str(row[2]),
                })
            except Exception:
                continue
        return reports
    except Exception as e:
        logger.error(f"get_reports_for_user failed: {e}")
        return []
    finally:
        conn.close()


# ── Admin ──────────────────────────────────────────────────────────────────────

def get_all_users() -> list[dict]:
    """
    Admin: return all unique users with aggregated stats.
    Each entry: { user_id, email, name, report_count, has_api_key, last_active }
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                r.user_id,
                COUNT(DISTINCT r.company)                                  AS report_count,
                MAX(r.created_at)                                          AS last_active,
                CASE WHEN us.user_id IS NOT NULL THEN TRUE ELSE FALSE END  AS has_api_key,
                COALESCE(up.email, '')                                     AS email,
                COALESCE(up.name,  '')                                     AS name
            FROM reports r
            LEFT JOIN user_settings us ON us.user_id = r.user_id
            LEFT JOIN user_profiles  up ON up.user_id = r.user_id
            GROUP BY r.user_id, us.user_id, up.email, up.name
            ORDER BY last_active DESC
        """)
        rows = cursor.fetchall()
        return [
            {
                "user_id":      row[0],
                "report_count": int(row[1]),
                "last_active":  row[2].isoformat() if hasattr(row[2], "isoformat") else str(row[2]),
                "has_api_key":  bool(row[3]),
                "email":        row[4] or "",
                "name":         row[5] or "",
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"get_all_users failed: {e}")
        return []
    finally:
        conn.close()
