import sqlite3
from pathlib import Path

from app.core.config import DATABASE_PATH


def get_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    schema_path = Path(__file__).resolve().parents[1] / "models" / "schema.sql"

    with get_connection() as connection:
        connection.executescript(schema_path.read_text(encoding="utf-8"))
        _ensure_news_article_columns(connection)


def _ensure_news_article_columns(connection: sqlite3.Connection) -> None:
    existing_columns = {
        row["name"] for row in connection.execute("pragma table_info(news_articles)").fetchall()
    }
    required_columns = {
        "agency": "text",
        "content": "text",
        "target_date": "text",
    }

    for column, definition in required_columns.items():
        if column not in existing_columns:
            connection.execute(f"alter table news_articles add column {column} {definition}")
