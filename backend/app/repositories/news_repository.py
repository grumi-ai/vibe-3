from typing import Any

from app.core.database import get_connection, init_db


DEFAULT_KEYWORDS = ["공공 행정", "지방자치", "민원", "복지", "안전"]


def list_articles() -> list[dict[str, Any]]:
    init_db()
    with get_connection() as connection:
        rows = connection.execute(
            """
            select id, title, source, url, summary, keyword, published_at, collected_at
              from news_articles
             order by collected_at desc
            """
        ).fetchall()
    return [dict(row) for row in rows]


def list_keywords() -> list[str]:
    init_db()
    with get_connection() as connection:
        rows = connection.execute(
            "select distinct keyword from news_articles where keyword is not null order by keyword"
        ).fetchall()
    stored_keywords = [row[0] for row in rows]
    return stored_keywords or DEFAULT_KEYWORDS


def create_placeholder_article(keyword: str) -> dict[str, Any]:
    init_db()
    title = f"{keyword} 뉴스 수집 스캐폴드"
    url = f"scaffold://news/{keyword}"

    with get_connection() as connection:
        connection.execute(
            """
            insert or ignore into news_articles (title, source, url, summary, keyword)
            values (?, ?, ?, ?, ?)
            """,
            (
                title,
                "scaffold",
                url,
                "실제 뉴스 수집기 구현 전 DB 연동 확인용 기사입니다.",
                keyword,
            ),
        )
        connection.commit()
        row = connection.execute(
            """
            select id, title, source, url, summary, keyword, published_at, collected_at
              from news_articles
             where url = ?
            """,
            (url,),
        ).fetchone()
    return dict(row)
