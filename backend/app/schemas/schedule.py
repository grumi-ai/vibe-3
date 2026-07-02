from pydantic import BaseModel


class ScheduleBase(BaseModel):
    title: str
    schedule_type: str
    starts_at: str
    ends_at: str
    member_id: int | None = None
    location: str | None = None
    memo: str | None = None


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    title: str | None = None
    schedule_type: str | None = None
    starts_at: str | None = None
    ends_at: str | None = None
    member_id: int | None = None
    location: str | None = None
    memo: str | None = None


class ScheduleRead(ScheduleBase):
  id: int
  member_name: str | None = None
