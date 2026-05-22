import sqlite3
import json
import logging
import os
import time
from pathlib import Path

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent / "kompete.db"

# Read database URL from global configurations
from config import POSTGRES_URL, NILEDB_URL
DB_CONN_URL = POSTGRES_URL or NILEDB_URL


def get_postgres_connection():
    """Attempt to connect to PostgreSQL database if configured."""
    if not DB_CONN_URL:
        return None
    try:
        import psycopg2
        conn = psycopg2.connect(DB_CONN_URL)
        return conn
    except ImportError:
        logger.warning("psycopg2-binary not installed; falling back to SQLite.")
        return None
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL at {DB_CONN_URL}: {e}. Falling back to SQLite.")
        return None

def init_db():
    """Initialize the database (PostgreSQL or SQLite fallback) and create necessary tables."""
    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reports (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    company VARCHAR(255) NOT NULL,
                    report_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, company)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_settings (
                    user_id VARCHAR(255) PRIMARY KEY,
                    encrypted_api_key TEXT NOT NULL
                )
            """)
            conn.commit()
            cursor.close()
            conn.close()
            logger.info("PostgreSQL database initialized successfully.")
            return
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL table: {e}. Attempting SQLite setup.")
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass

    # SQLite Fallback
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                company TEXT NOT NULL,
                report_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, company)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                encrypted_api_key TEXT NOT NULL
            )
        """)
        conn_sqlite.commit()
        conn_sqlite.close()
        logger.info(f"SQLite database initialized at {DB_PATH}")
    except Exception as e:
        logger.error(f"Failed to initialize SQLite database: {e}")

# Simple encryption helper
import base64
from config import ENCRYPTION_KEY

def _get_fernet():
    try:
        from cryptography.fernet import Fernet
        import hashlib
        import base64
        # Derive a valid 32-byte url-safe base64 key from whatever string the user provided
        key_bytes = ENCRYPTION_KEY.encode('utf-8')
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

def save_user_api_key(user_id: str, api_key: str) -> bool:
    if not user_id: return False
    enc_key = encrypt_key(api_key)
    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_settings (user_id, encrypted_api_key)
                VALUES (%s, %s)
                ON CONFLICT(user_id) DO UPDATE SET encrypted_api_key = EXCLUDED.encrypted_api_key
            """, (user_id, enc_key))
            conn.commit()
            return True
        except Exception as e:
            pass
        finally:
            if conn: conn.close()
            
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("""
            INSERT INTO user_settings (user_id, encrypted_api_key)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET encrypted_api_key = excluded.encrypted_api_key
        """, (user_id, enc_key))
        conn_sqlite.commit()
        return True
    except Exception:
        return False
    finally:
        if 'conn_sqlite' in locals(): conn_sqlite.close()

def get_user_api_key(user_id: str) -> str | None:
    if not user_id: return None
    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT encrypted_api_key FROM user_settings WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            if row: return decrypt_key(row[0])
        except Exception:
            pass
        finally:
            if conn: conn.close()
            
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("SELECT encrypted_api_key FROM user_settings WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row: return decrypt_key(row[0])
    except Exception:
        pass
    finally:
        if 'conn_sqlite' in locals(): conn_sqlite.close()
    return None

def count_user_reports(user_id: str) -> int:
    if not user_id: return 0
    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(DISTINCT company) FROM reports WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            if row: return int(row[0])
        except Exception:
            pass
        finally:
            if conn: conn.close()
            
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("SELECT COUNT(DISTINCT company) FROM reports WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row: return int(row[0])
    except Exception:
        pass
    finally:
        if 'conn_sqlite' in locals(): conn_sqlite.close()
    return 0

def save_report(user_id: str, company: str, report_data: dict) -> bool:
    """Save or update a competitor intelligence report for a specific user."""
    if not user_id:
        return False
    
    company_clean = company.strip().lower()
    report_json = json.dumps(report_data)

    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # PostgreSQL uses %s placeholders and supports ON CONFLICT
            cursor.execute("""
                INSERT INTO reports (user_id, company, report_data)
                VALUES (%s, %s, %s)
                ON CONFLICT(user_id, company) 
                DO UPDATE SET report_data = EXCLUDED.report_data, created_at = CURRENT_TIMESTAMP
            """, (user_id, company_clean, report_json))
            conn.commit()
            cursor.close()
            conn.close()
            logger.info(f"[PostgreSQL] Saved report for {company_clean} under user {user_id}")
            return True
        except Exception as e:
            logger.error(f"[PostgreSQL] Failed to save report: {e}. Trying SQLite fallback.")
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass

    # SQLite Fallback
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("""
            INSERT INTO reports (user_id, company, report_data)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, company) 
            DO UPDATE SET report_data = excluded.report_data, created_at = CURRENT_TIMESTAMP
        """, (user_id, company_clean, report_json))
        conn_sqlite.commit()
        conn_sqlite.close()
        logger.info(f"[SQLite] Saved report for {company_clean} under user {user_id}")
        return True
    except Exception as e:
        logger.error(f"[SQLite] Failed to save report to database: {e}")
        return False

def get_reports_for_user(user_id: str) -> list[dict]:
    """Retrieve all reports generated by a specific user."""
    if not user_id:
        return []

    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT company, report_data, created_at 
                FROM reports 
                WHERE user_id = %s 
                ORDER BY created_at DESC
            """, (user_id,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            reports = []
            for row in rows:
                try:
                    data = json.loads(row[1])
                    reports.append({
                        "company": row[0],
                        "report": data,
                        "created_at": row[2].isoformat() if hasattr(row[2], 'isoformat') else str(row[2])
                    })
                except Exception:
                    continue
            return reports
        except Exception as e:
            logger.error(f"[PostgreSQL] Failed to fetch reports for user {user_id}: {e}. Trying SQLite fallback.")
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass

    # SQLite Fallback
    try:
        conn_sqlite = sqlite3.connect(str(DB_PATH))
        cursor = conn_sqlite.cursor()
        cursor.execute("""
            SELECT company, report_data, created_at 
            FROM reports 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        conn_sqlite.close()
        
        reports = []
        for row in rows:
            try:
                data = json.loads(row[1])
                reports.append({
                    "company": row[0],
                    "report": data,
                    "created_at": row[2]
                })
            except Exception:
                continue
        return reports
    except Exception as e:
        logger.error(f"[SQLite] Failed to fetch reports for user {user_id}: {e}")
        return []
