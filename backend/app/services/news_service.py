from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.crawlers.korea_policy_briefing import KoreaPolicyBriefingCrawler
from app.repositories import news_repository
from app.schemas.news import NewsArticleRead, NewsCrawlRunRead


def list_articles(target_date: str | None = None) -> list[NewsArticleRead]:
    return [NewsArticleRead(**item) for item in news_repository.list_articles(target_date)]


def list_keywords() -> list[str]:
    return news_repository.list_keywords()


def list_crawl_runs(limit: int = 10) -> list[NewsCrawlRunRead]:
    return [NewsCrawlRunRead(**item) for item in news_repository.list_crawl_runs(limit)]


def collect_news(target_date: str | None = None, force: bool = False) -> dict[str, object]:
    selected_date = _parse_target_date(target_date)
    target_date_text = selected_date.isoformat()

    if not force and news_repository.has_successful_run(target_date_text):
        return {
            "target_date": target_date_text,
            "status": "skipped",
            "total_count": 0,
            "success_count": 0,
            "failed_count": 0,
            "items": list_articles(target_date_text),
            "message": "A successful crawl already exists for this date.",
        }

    run_id = news_repository.create_crawl_run(target_date_text)
    try:
        crawler = KoreaPolicyBriefingCrawler()
        crawled_articles, errors = crawler.collect_by_date(selected_date)
        saved_articles = [news_repository.upsert_article(article) for article in crawled_articles]
        failed_count = len(errors)
        status = _resolve_status(len(saved_articles), failed_count)
        run = news_repository.finish_crawl_run(
            run_id,
            status=status,
            total_count=len(saved_articles) + failed_count,
            success_count=len(saved_articles),
            failed_count=failed_count,
            error_message="\n".join(errors[:5]) if errors else None,
        )
    except Exception as exc:
        run = news_repository.finish_crawl_run(
            run_id,
            status="failed",
            total_count=0,
            success_count=0,
            failed_count=1,
            error_message=str(exc),
        )
        return {**run, "items": [], "message": "Policy news crawl failed."}

    return {
        **run,
        "items": [NewsArticleRead(**item) for item in saved_articles],
        "message": "Policy news crawl finished.",
    }


def collect_yesterday_news() -> dict[str, object]:
    target_date = _today_in_seoul() - timedelta(days=1)
    return collect_news(target_date.isoformat(), force=False)


def _parse_target_date(value: str | None) -> date:
    if not value:
        return _today_in_seoul() - timedelta(days=1)
    return date.fromisoformat(value)


def _resolve_status(success_count: int, failed_count: int) -> str:
    if failed_count and success_count:
        return "partial_success"
    if failed_count:
        return "failed"
    return "success"


def _today_in_seoul() -> date:
    return datetime.now(ZoneInfo("Asia/Seoul")).date()
