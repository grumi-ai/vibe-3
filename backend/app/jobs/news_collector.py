from app.services.news_service import collect_yesterday_news


def run_daily_news_collection() -> dict[str, object]:
    return collect_yesterday_news()
