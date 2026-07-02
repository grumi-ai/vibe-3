from pydantic import BaseModel


class MemberBase(BaseModel):
    name: str
    role: str | None = None
    phone: str | None = None
    memo: str | None = None


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    phone: str | None = None
    memo: str | None = None
    is_active: bool | None = None


class MemberRead(MemberBase):
    id: int
    is_active: bool
    created_at: str
    updated_at: str | None = None
