from app.schemas.news import NewsCollectRequest
from app.services import news_service


def list_news(targetDate: str | None = None) -> dict[str, object]:
    return {"items": news_service.list_articles(targetDate)}


def collect_news(payload: NewsCollectRequest | None = None) -> dict[str, object]:
    target_date = payload.target_date if payload else None
    force = payload.force if payload else False
    return news_service.collect_news(target_date, force)


def list_keywords() -> dict[str, object]:
    return {"items": news_service.list_keywords()}


def list_crawl_runs(limit: int = 10) -> dict[str, object]:
    return {"items": news_service.list_crawl_runs(limit)}
