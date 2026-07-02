import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"


def _resolve_database_path() -> Path:
    value = os.getenv("DATABASE_PATH")
    if value:
        return Path(value)
    return DATA_DIR / "app.db"


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["*"]


DATABASE_PATH = _resolve_database_path()
