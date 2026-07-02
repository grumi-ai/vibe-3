from typing import Any

from app.core.database import get_connection, init_db
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate


def list_schedules(
    start: str | None = None,
    end: str | None = None,
    member_id: int | None = None,
    keyword: str | None = None,
) -> list[dict[str, Any]]:
    init_db()
    query = """
        select s.*, m.name as member_name
          from schedules s
          left join members m on m.id = s.member_id
    """
    clauses: list[str] = []
    params: list[Any] = []

    if start is not None and end is not None:
        clauses.append("s.starts_at <= ? and s.ends_at >= ?")
        params.extend([end, start])
    elif start is not None:
        clauses.append("s.ends_at >= ?")
        params.append(start)
    elif end is not None:
        clauses.append("s.starts_at <= ?")
        params.append(end)

    if member_id is not None:
        clauses.append("s.member_id = ?")
        params.append(member_id)

    if keyword:
        clauses.append("s.title like ?")
        params.append(f"%{keyword}%")

    if clauses:
        query += " where " + " and ".join(clauses)

    query += " order by s.starts_at, s.id"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()
    return [dict(row) for row in rows]


def create_schedule(payload: ScheduleCreate) -> dict[str, Any]:
    init_db()
    with get_connection() as connection:
        cursor = connection.execute(
            """
            insert into schedules (
              member_id, title, schedule_type, starts_at, ends_at, location, memo
            ) values (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.member_id,
                payload.title,
                payload.schedule_type,
                payload.starts_at,
                payload.ends_at,
                payload.location,
                payload.memo,
            ),
        )
        connection.commit()
        schedule_id = cursor.lastrowid
    schedule = get_schedule(schedule_id)
    if schedule is None:
        raise RuntimeError("Failed to create schedule")
    return schedule


def get_schedule(schedule_id: int) -> dict[str, Any] | None:
    init_db()
    with get_connection() as connection:
        row = connection.execute("select * from schedules where id = ?", (schedule_id,)).fetchone()
    return dict(row) if row else None


def update_schedule(schedule_id: int, payload: ScheduleUpdate) -> dict[str, Any] | None:
    current = get_schedule(schedule_id)
    if current is None:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    next_data = {**current, **update_data}

    with get_connection() as connection:
        connection.execute(
            """
            update schedules
               set member_id = ?,
                   title = ?,
                   schedule_type = ?,
                   starts_at = ?,
                   ends_at = ?,
                   location = ?,
                   memo = ?
             where id = ?
            """,
            (
                next_data["member_id"],
                next_data["title"],
                next_data["schedule_type"],
                next_data["starts_at"],
                next_data["ends_at"],
                next_data["location"],
                next_data["memo"],
                schedule_id,
            ),
        )
        connection.commit()
    return get_schedule(schedule_id)


def delete_schedule(schedule_id: int) -> bool:
    init_db()
    with get_connection() as connection:
        cursor = connection.execute("delete from schedules where id = ?", (schedule_id,))
        connection.commit()
    return cursor.rowcount > 0
