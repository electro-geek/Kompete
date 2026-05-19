import sys
from pathlib import Path

# Add backend directory to Python path so Vercel resolves local module imports (main, config, database, etc.) perfectly
backend_dir = str(Path(__file__).parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
