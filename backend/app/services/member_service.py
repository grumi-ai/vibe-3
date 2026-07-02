from app.repositories import member_repository
from app.schemas.member import MemberCreate, MemberRead, MemberUpdate


def list_members(keyword: str | None = None, is_active: bool | None = None) -> list[MemberRead]:
    return [MemberRead(**item) for item in member_repository.list_members(keyword, is_active)]


def create_member(payload: MemberCreate) -> MemberRead:
    return MemberRead(**member_repository.create_member(payload))


def get_member(member_id: int) -> MemberRead | None:
    member = member_repository.get_member(member_id)
    return MemberRead(**member) if member else None


def update_member(member_id: int, payload: MemberUpdate) -> MemberRead | None:
    member = member_repository.update_member(member_id, payload)
    return MemberRead(**member) if member else None


def deactivate_member(member_id: int) -> bool:
    return member_repository.deactivate_member(member_id)
