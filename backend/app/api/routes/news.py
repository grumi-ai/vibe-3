from app.schemas.news import NewsCollectRequest
from app.services import news_service


def list_news() -> dict[str, object]:
    return {"items": news_service.list_articles()}


def collect_news(payload: NewsCollectRequest | None = None) -> dict[str, object]:
    keywords = payload.keywords if payload else []
    return news_service.collect_news(keywords)


def list_keywords() -> dict[str, object]:
    return {"items": news_service.list_keywords()}
