from typing import Any

from app.core.database import get_connection, init_db
from app.schemas.member import MemberCreate, MemberUpdate


def list_members(keyword: str | None = None, is_active: bool | None = None) -> list[dict[str, Any]]:
    init_db()
    query = "select * from members"
    clauses: list[str] = []
    params: list[Any] = []

    if keyword:
      clauses.append("(name like ? or role like ? or phone like ?)")
      pattern = f"%{keyword}%"
      params.extend([pattern, pattern, pattern])

    if is_active is not None:
      clauses.append("is_active = ?")
      params.append(1 if is_active else 0)

    if clauses:
      query += " where " + " and ".join(clauses)

    query += " order by created_at desc, id desc"

    with get_connection() as connection:
      rows = connection.execute(query, params).fetchall()

    return [dict(row) for row in rows]


def create_member(payload: MemberCreate) -> dict[str, Any]:
    init_db()
    with get_connection() as connection:
      cursor = connection.execute(
          """
          insert into members (name, role, phone, memo, is_active)
          values (?, ?, ?, ?, 1)
          """,
          (payload.name, payload.role, payload.phone, payload.memo),
      )
      connection.commit()
      member_id = cursor.lastrowid

    member = get_member(member_id)
    if member is None:
      raise RuntimeError("Failed to create member")
    return member


def get_member(member_id: int) -> dict[str, Any] | None:
    init_db()
    with get_connection() as connection:
      row = connection.execute("select * from members where id = ?", (member_id,)).fetchone()
    return dict(row) if row else None


def update_member(member_id: int, payload: MemberUpdate) -> dict[str, Any] | None:
    current = get_member(member_id)
    if current is None:
      return None

    next_data = {**current, **payload.model_dump(exclude_unset=True)}

    with get_connection() as connection:
      connection.execute(
          """
          update members
             set name = ?,
                 role = ?,
                 phone = ?,
                 memo = ?,
                 is_active = ?,
                 updated_at = current_timestamp
           where id = ?
          """,
          (
              next_data["name"],
              next_data["role"],
              next_data["phone"],
              next_data["memo"],
              1 if next_data.get("is_active", True) else 0,
              member_id,
          ),
      )
      connection.commit()
    return get_member(member_id)


def deactivate_member(member_id: int) -> bool:
    init_db()
    with get_connection() as connection:
      cursor = connection.execute(
          "update members set is_active = 0, updated_at = current_timestamp where id = ?",
          (member_id,),
      )
      connection.commit()
    return cursor.rowcount > 0
