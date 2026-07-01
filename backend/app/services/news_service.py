from app.repositories import news_repository
from app.schemas.news import NewsArticleRead


def list_articles() -> list[NewsArticleRead]:
    return [NewsArticleRead(**item) for item in news_repository.list_articles()]


def list_keywords() -> list[str]:
    return news_repository.list_keywords()


def collect_news(keywords: list[str]) -> dict[str, object]:
    selected_keywords = keywords or news_repository.DEFAULT_KEYWORDS
    articles = [news_repository.create_placeholder_article(keyword) for keyword in selected_keywords]
    return {
        "items": [NewsArticleRead(**article) for article in articles],
        "message": "뉴스 수집 스캐폴드가 SQLite 저장을 확인했습니다.",
    }
