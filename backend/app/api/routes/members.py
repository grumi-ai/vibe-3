from fastapi import HTTPException, Response

from app.schemas.member import MemberCreate, MemberRead, MemberUpdate
from app.services import member_service


def list_members(keyword: str | None = None, isActive: bool | None = None) -> dict[str, object]:
    return {"items": member_service.list_members(keyword, isActive)}


def create_member(payload: MemberCreate) -> MemberRead:
    return member_service.create_member(payload)


def get_member(member_id: int) -> MemberRead:
    member = member_service.get_member(member_id)
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


def update_member(member_id: int, payload: MemberUpdate) -> MemberRead:
    member = member_service.update_member(member_id, payload)
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


def delete_member(member_id: int) -> Response:
    if not member_service.deactivate_member(member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    return Response(status_code=204)
