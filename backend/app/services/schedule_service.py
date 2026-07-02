from app.repositories import schedule_repository
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate


def list_schedules(
    start: str | None = None,
    end: str | None = None,
    member_id: int | None = None,
    keyword: str | None = None,
) -> list[ScheduleRead]:
    return [ScheduleRead(**item) for item in schedule_repository.list_schedules(start, end, member_id, keyword)]


def create_schedule(payload: ScheduleCreate) -> ScheduleRead:
    return ScheduleRead(**schedule_repository.create_schedule(payload))


def get_schedule(schedule_id: int) -> ScheduleRead | None:
    schedule = schedule_repository.get_schedule(schedule_id)
    return ScheduleRead(**schedule) if schedule else None


def update_schedule(schedule_id: int, payload: ScheduleUpdate) -> ScheduleRead | None:
    schedule = schedule_repository.update_schedule(schedule_id, payload)
    return ScheduleRead(**schedule) if schedule else None


def delete_schedule(schedule_id: int) -> bool:
    return schedule_repository.delete_schedule(schedule_id)
