"""
HumanSignal Backend Launcher
"""
import sys
import uvicorn
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from config import HOST, PORT

if __name__ == "__main__":
    print(f"Starting HumanSignal Backend on http://{HOST}:{PORT}...")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
