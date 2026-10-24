import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
AI_DIR = PROJECT_ROOT / "AI"
MODELS_DIR = AI_DIR / "Models"

# Primary Real-Time 20-Feature Model Candidate
PRIMARY_MODEL_PATH = MODELS_DIR / "humansignal_realtime_candidate.joblib"
RANDOM_FOREST_MODEL_PATH = MODELS_DIR / "humansignal_random_forest.joblib"
FINAL_CANDIDATE_MODEL_PATH = MODELS_DIR / "humansignal_final_candidate.joblib"

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# OpenRouter AI Suggestions Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

# Population Baseline Statistics (Derived from AI/Datasets/humansignal_dataset.csv)
POPULATION_MEANS = {
    "mean_rt_ms": 286.58,
    "std_rt_ms": 51.00,
    "error_rate": 0.0312,
    "mean_iki_ms": 191.66,
    "std_iki_ms": 58.38,
    "pause_count": 0.455,
    "max_pause_ms": 525.50,
    "keys_per_sec": 4.97,
    "mouse_speed_mean": 417.71,
    "mouse_jitter": 2.10,
    "task_switches": 0.095,
}

POPULATION_STDS = {
    "mean_rt_ms": 57.29,
    "std_rt_ms": 16.10,
    "error_rate": 0.0316,
    "mean_iki_ms": 24.86,
    "std_iki_ms": 19.65,
    "pause_count": 0.720,
    "max_pause_ms": 776.40,
    "keys_per_sec": 0.945,
    "mouse_speed_mean": 70.30,
    "mouse_jitter": 0.514,
    "task_switches": 0.326,
}
