from pydantic import BaseModel, Field


class ManualCreate(BaseModel):
    filename: str
    content_text: str = ""


class ManualUploadRequest(BaseModel):
    filename: str
    content_base64: str


class ManualRead(BaseModel):
    id: int
    filename: str
    content_text: str | None = None
    uploaded_at: str


class ManualUploadRead(BaseModel):
    item: ManualRead
    message: str


class ComplaintChatRequest(BaseModel):
    question: str


class ComplaintChatResponse(BaseModel):
    summary: str
    recommended_script: str
    checklist: list[str]
    referenced_manuals: list[str] = Field(default_factory=list)
    disclaimer: str
