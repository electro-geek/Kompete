"""
Kompete — config.py
Loads settings from config.properties and secrets from .env.
All other modules import from here so there's a single source of truth.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# ── locate files relative to this module ──────────────────────────────────────
BASE_DIR = Path(__file__).parent

# Load secrets first (.env takes priority for any key defined there)
load_dotenv(BASE_DIR / ".env")

# ── load config.properties (simple key=value, ignore comments/blanks) ─────────
def _load_properties(path: Path) -> dict[str, str]:
    props: dict[str, str] = {}
    if not path.exists():
        return props
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                props[key.strip()] = value.strip()
    return props


_props = _load_properties(BASE_DIR / "config.properties")

def _get(key: str, default: str = "") -> str:
    """Return value from .env first, then config.properties, then default."""
    val = os.getenv(key)
    if val and val.strip() and val.strip() != "your_gemini_api_key_here":
        return val.strip()
    
    prop_val = _props.get(key)
    if prop_val and prop_val.strip() and prop_val.strip() != "your_gemini_api_key_here":
        return prop_val.strip()
        
    return default


# ── Exported settings ──────────────────────────────────────────────────────────

# Secrets
GEMINI_API_KEY: str = _get("GEMINI_API_KEY")
FIREBASE_PROJECT_ID: str = _get("FIREBASE_PROJECT_ID", "")
ENCRYPTION_KEY: str = _get("ENCRYPTION_KEY", "b4Uv7GkL8a2X9mN3pY5qR6wS1tE0zV4c=")

# Access Control
ADMIN_EMAILS: list[str] = [e.strip() for e in _get("ADMIN_EMAILS", "").split(",") if e.strip()]

# Server
HOST: str = _get("HOST", "0.0.0.0")
PORT: int = int(_get("PORT", "8000"))
RELOAD: bool = _get("RELOAD", "true").lower() == "true"
LOG_LEVEL: str = _get("LOG_LEVEL", "info")

# CORS
CORS_ORIGINS: list[str] = [o.strip() for o in _get("CORS_ORIGINS", "http://localhost:3000").split(",")]

# Gemini
GEMINI_MODEL: str = _get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_TEMPERATURE: float = float(_get("GEMINI_TEMPERATURE", "0.4"))
GEMINI_MAX_OUTPUT_TOKENS: int = int(_get("GEMINI_MAX_OUTPUT_TOKENS", "8192"))

# Research
RESEARCH_TIMEOUT_SECONDS: int = int(_get("RESEARCH_TIMEOUT_SECONDS", "120"))

# Cache
REPORT_CACHE_TTL_SECONDS: int = int(_get("REPORT_CACHE_TTL_SECONDS", "3600"))
MAX_CACHED_REPORTS: int = int(_get("MAX_CACHED_REPORTS", "100"))

# Database
POSTGRES_URL: str = _get("POSTGRES_URL", "")
NILEDB_URL: str = _get("NILEDB_URL", "")

