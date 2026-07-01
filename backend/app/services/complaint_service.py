from app.repositories import complaint_repository
from app.schemas.complaint import ComplaintChatRequest, ComplaintChatResponse, ManualCreate, ManualRead


def list_manuals() -> list[ManualRead]:
    return [ManualRead(**item) for item in complaint_repository.list_manuals()]


def create_manual(payload: ManualCreate) -> dict[str, object]:
    manual = complaint_repository.create_manual(payload)
    return {"item": ManualRead(**manual), "message": "민원 매뉴얼이 DB에 저장되었습니다."}


def create_chat_response(payload: ComplaintChatRequest) -> ComplaintChatResponse:
    response = ComplaintChatResponse(
        summary="입력된 민원 내용을 매뉴얼 근거와 대조해 검토해야 합니다.",
        recommended_script="문의 주신 내용은 관련 규정과 담당 부서 확인 후 안내드리겠습니다.",
        checklist=["개인정보 포함 여부 확인", "담당 부서 확인", "최신 매뉴얼 기준 검토"],
        disclaimer="이 답변은 공식 답변이 아닌 담당자 검토용 초안입니다.",
    )
    complaint_repository.create_chat_log(payload.question, response.recommended_script)
    return response
