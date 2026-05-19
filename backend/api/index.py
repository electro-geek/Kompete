import sys
from pathlib import Path

# Add backend directory to Python path so internal imports (config, database, agents, etc.) resolve correctly on Vercel
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
