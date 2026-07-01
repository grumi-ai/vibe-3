from pydantic import BaseModel


class ManualCreate(BaseModel):
    filename: str
    content_text: str = ""


class ManualRead(BaseModel):
    id: int
    filename: str
    content_text: str | None = None
    uploaded_at: str


class ComplaintChatRequest(BaseModel):
    question: str


class ComplaintChatResponse(BaseModel):
    summary: str
    recommended_script: str
    checklist: list[str]
    disclaimer: str
