#!/usr/bin/env bash
# Kompete — Backend startup script
# Usage: ./backend/start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Check for .env ─────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "❌  .env file not found in backend/."
  echo "   Create it with: echo 'GEMINI_API_KEY=your_key' > backend/.env"
  exit 1
fi

if grep -q "your_gemini_api_key_here" .env; then
  echo "❌  Please set your real GEMINI_API_KEY in backend/.env"
  exit 1
fi

# ── Create venv if needed ──────────────────────────────────────────────────────
if [ ! -d "venv" ]; then
  echo "📦  Creating Python virtual environment..."
  python3 -m venv venv
fi

# ── Activate and install ───────────────────────────────────────────────────────
source venv/bin/activate

echo "📦  Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# ── Start server ───────────────────────────────────────────────────────────────
echo ""
echo "✅  Starting Kompete backend..."
echo "   API:  http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
