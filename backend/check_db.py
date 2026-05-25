#!/usr/bin/env python3
"""
check_db.py — Kompete DB inspector
Connects to the configured PostgreSQL database and prints a summary of all data.

Run from the backend directory:
    python check_db.py
"""

import sys
import json
from pathlib import Path

# ── Load config the same way the backend does ─────────────────────────────────
sys.path.insert(0, str(Path(__file__).parent))
from config import POSTGRES_URL, NILEDB_URL

DB_URL = POSTGRES_URL or NILEDB_URL

if not DB_URL:
    print("❌  No POSTGRES_URL or NILEDB_URL found in config.properties / .env")
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("❌  psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

# ── Connect ────────────────────────────────────────────────────────────────────
print(f"\n🔌  Connecting to: {DB_URL[:60]}…\n")
try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    print("✅  Connected successfully!\n")
except Exception as e:
    print(f"❌  Connection failed: {e}")
    sys.exit(1)

SEP = "─" * 60


def section(title: str):
    print(f"\n{SEP}")
    print(f"  {title}")
    print(SEP)


# ── 1. List tables ─────────────────────────────────────────────────────────────
section("📋  Tables in database")
cur.execute("""
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
""")
tables = [row[0] for row in cur.fetchall()]
if tables:
    for t in tables:
        print(f"  • {t}")
else:
    print("  (no tables found — has init_db() been called?)")


# ── 2. Row counts per table ────────────────────────────────────────────────────
section("🔢  Row counts")
for table in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        indicator = "✅" if count > 0 else "⚠️ "
        print(f"  {indicator}  {table:<25}  {count} row(s)")
    except Exception as e:
        print(f"  ❌  {table}: {e}")


# ── 3. reports table ───────────────────────────────────────────────────────────
if "reports" in tables:
    section("📄  reports  (last 5 rows)")
    cur.execute("""
        SELECT user_id, company, created_at,
               LEFT(report_data, 80) AS snippet
        FROM reports
        ORDER BY created_at DESC
        LIMIT 5
    """)
    rows = cur.fetchall()
    if rows:
        for r in rows:
            print(f"  user_id   : {r[0]}")
            print(f"  company   : {r[1]}")
            print(f"  created_at: {r[2]}")
            print(f"  data      : {r[3]}…")
            print()
    else:
        print("  (empty)")


# ── 4. user_profiles table ─────────────────────────────────────────────────────
if "user_profiles" in tables:
    section("👤  user_profiles  (all rows)")
    cur.execute("""
        SELECT user_id, email, name, updated_at
        FROM user_profiles
        ORDER BY updated_at DESC
    """)
    rows = cur.fetchall()
    if rows:
        for r in rows:
            print(f"  uid   : {r[0]}")
            print(f"  email : {r[1] or '—'}")
            print(f"  name  : {r[2] or '—'}")
            print(f"  updated: {r[3]}")
            print()
    else:
        print("  (empty — users need to run at least one research to appear here)")


# ── 5. user_settings table ─────────────────────────────────────────────────────
if "user_settings" in tables:
    section("🔑  user_settings  (API key holders)")
    cur.execute("""
        SELECT user_id, LEFT(encrypted_api_key, 20) AS key_preview
        FROM user_settings
        ORDER BY user_id
    """)
    rows = cur.fetchall()
    if rows:
        for r in rows:
            print(f"  uid       : {r[0]}")
            print(f"  key (enc) : {r[1]}… [truncated]")
            print()
    else:
        print("  (empty — no users have saved a custom API key yet)")


# ── 6. Quick health summary ────────────────────────────────────────────────────
section("🩺  Summary")
report_count = 0
user_count   = 0
key_count    = 0
try:
    cur.execute("SELECT COUNT(*) FROM reports")
    report_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT user_id) FROM reports")
    user_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM user_settings")
    key_count = cur.fetchone()[0]
except Exception:
    pass

print(f"  Total reports stored : {report_count}")
print(f"  Unique users         : {user_count}")
print(f"  Users with API key   : {key_count}")

if report_count == 0:
    print("\n  ⚠️   Database is EMPTY — no analyses have been saved yet.")
else:
    print("\n  ✅  Database has data.")

conn.close()
print(f"\n{SEP}\n")
