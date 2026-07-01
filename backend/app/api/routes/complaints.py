from app.schemas.complaint import ComplaintChatRequest, ComplaintChatResponse, ManualCreate
from app.services import complaint_service


def list_manuals() -> dict[str, object]:
    return {"items": complaint_service.list_manuals()}


def create_manual(payload: ManualCreate) -> dict[str, object]:
    return complaint_service.create_manual(payload)


def create_chat_response(payload: ComplaintChatRequest) -> ComplaintChatResponse:
    return complaint_service.create_chat_response(payload)
