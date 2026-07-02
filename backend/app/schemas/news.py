from pydantic import BaseModel, Field


class NewsCollectRequest(BaseModel):
    target_date: str | None = None
    force: bool = False
    keywords: list[str] = Field(default_factory=list)


class NewsArticleRead(BaseModel):
    id: int
    title: str
    source: str | None = None
    agency: str | None = None
    url: str | None = None
    summary: str | None = None
    content: str | None = None
    keyword: str | None = None
    published_at: str | None = None
    target_date: str | None = None
    collected_at: str


class NewsCrawlRunRead(BaseModel):
    id: int
    target_date: str
    status: str
    total_count: int
    success_count: int
    failed_count: int
    error_message: str | None = None
    started_at: str
    finished_at: str | None = None
