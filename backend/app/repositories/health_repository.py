from app.core.config import DATABASE_PATH
from app.core.database import get_connection, init_db


def check_database() -> dict[str, str]:
    init_db()

    with get_connection() as connection:
        sqlite_version = connection.execute("select sqlite_version()").fetchone()[0]
        connection.execute("insert into health_checks (status) values (?)", ("ok",))
        connection.commit()

    return {
        "status": "ok",
        "sqlite_version": sqlite_version,
        "database_path": str(DATABASE_PATH),
    }
