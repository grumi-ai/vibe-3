from fastapi import HTTPException, Response

from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.services import schedule_service


def list_schedules() -> dict[str, object]:
    return {"items": schedule_service.list_schedules()}


def create_schedule(payload: ScheduleCreate) -> ScheduleRead:
    return schedule_service.create_schedule(payload)


def get_schedule(schedule_id: int) -> ScheduleRead:
    schedule = schedule_service.get_schedule(schedule_id)
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


def update_schedule(schedule_id: int, payload: ScheduleUpdate) -> ScheduleRead:
    schedule = schedule_service.update_schedule(schedule_id, payload)
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


def delete_schedule(schedule_id: int) -> Response:
    if not schedule_service.delete_schedule(schedule_id):
        raise HTTPException(status_code=404, detail="Schedule not found")
    return Response(status_code=204)
