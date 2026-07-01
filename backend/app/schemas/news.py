from pydantic import BaseModel


class NewsCollectRequest(BaseModel):
    keywords: list[str] = []


class NewsArticleRead(BaseModel):
    id: int
    title: str
    source: str | None = None
    url: str | None = None
    summary: str | None = None
    keyword: str | None = None
    published_at: str | None = None
    collected_at: str
