#!/usr/bin/env bash
# Kompete — Frontend startup script
# Usage: ./frontend/start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Install deps if needed ─────────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo "📦  Installing Node.js dependencies..."
  npm install
fi

# ── Start dev server ───────────────────────────────────────────────────────────
echo ""
echo "✅  Starting Kompete frontend..."
echo "   URL: http://localhost:3000"
echo ""
npm run dev
