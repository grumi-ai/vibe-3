from typing import Any

from app.core.database import get_connection, init_db
from app.schemas.complaint import ManualCreate


def list_manuals() -> list[dict[str, Any]]:
    init_db()
    with get_connection() as connection:
        rows = connection.execute(
            "select id, filename, content_text, uploaded_at from complaint_manuals order by uploaded_at desc"
        ).fetchall()
    return [dict(row) for row in rows]


def create_manual(payload: ManualCreate) -> dict[str, Any]:
    init_db()
    with get_connection() as connection:
        cursor = connection.execute(
            "insert into complaint_manuals (filename, content_text) values (?, ?)",
            (payload.filename, payload.content_text),
        )
        connection.commit()
        manual_id = cursor.lastrowid
        row = connection.execute(
            "select id, filename, content_text, uploaded_at from complaint_manuals where id = ?",
            (manual_id,),
        ).fetchone()
    return dict(row)


def create_chat_log(question: str, answer: str) -> None:
    init_db()
    with get_connection() as connection:
        connection.execute(
            "insert into complaint_chat_logs (question, answer) values (?, ?)",
            (question, answer),
        )
        connection.commit()
