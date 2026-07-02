from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.database import get_connection, init_db
from app.crawlers.korea_policy_briefing import PolicyArticle


def list_articles(target_date: str | None = None) -> list[dict[str, Any]]:
    init_db()
    query = """
        select id, title, source, agency, url, summary, content, keyword,
               published_at, target_date, collected_at
          from news_articles
    """
    params: tuple[str, ...] = ()
    if target_date:
        query += " where target_date = ?"
        params = (target_date,)
    query += " order by published_at desc, collected_at desc"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()
    return [dict(row) for row in rows]


def list_keywords() -> list[str]:
    init_db()
    with get_connection() as connection:
        rows = connection.execute(
            "select distinct keyword from news_articles where keyword is not null order by keyword"
        ).fetchall()
    return [row[0] for row in rows]


def upsert_article(article: PolicyArticle) -> dict[str, Any]:
    init_db()
    with get_connection() as connection:
        connection.execute(
            """
            insert into news_articles (
              title, source, agency, url, summary, content, keyword, published_at, target_date, collected_at
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
            on conflict(url) do update set
              title = excluded.title,
              source = excluded.source,
              agency = excluded.agency,
              summary = excluded.summary,
              content = excluded.content,
              published_at = excluded.published_at,
              target_date = excluded.target_date,
              collected_at = current_timestamp
            """,
            (
                article.title,
                article.source,
                article.agency,
                article.url,
                article.summary,
                article.content,
                article.agency,
                article.published_at,
                article.target_date,
            ),
        )
        connection.commit()
        row = connection.execute(
            """
            select id, title, source, agency, url, summary, content, keyword,
                   published_at, target_date, collected_at
              from news_articles
             where url = ?
            """,
            (article.url,),
        ).fetchone()
    return dict(row)


def has_successful_run(target_date: str) -> bool:
    init_db()
    with get_connection() as connection:
        row = connection.execute(
            """
            select 1
              from news_crawl_runs
             where target_date = ?
               and status = 'success'
             limit 1
            """,
            (target_date,),
        ).fetchone()
    return row is not None


def create_crawl_run(target_date: str) -> int:
    init_db()
    with get_connection() as connection:
        cursor = connection.execute(
            "insert into news_crawl_runs (target_date, status) values (?, ?)",
            (target_date, "running"),
        )
        connection.commit()
        return int(cursor.lastrowid)


def finish_crawl_run(
    run_id: int,
    *,
    status: str,
    total_count: int,
    success_count: int,
    failed_count: int,
    error_message: str | None,
) -> dict[str, Any]:
    finished_at = datetime.utcnow().isoformat(timespec="seconds")
    with get_connection() as connection:
        connection.execute(
            """
            update news_crawl_runs
               set status = ?,
                   total_count = ?,
                   success_count = ?,
                   failed_count = ?,
                   error_message = ?,
                   finished_at = ?
             where id = ?
            """,
            (status, total_count, success_count, failed_count, error_message, finished_at, run_id),
        )
        connection.commit()
        row = connection.execute(
            """
            select id, target_date, status, total_count, success_count, failed_count,
                   error_message, started_at, finished_at
              from news_crawl_runs
             where id = ?
            """,
            (run_id,),
        ).fetchone()
    return dict(row)


def list_crawl_runs(limit: int = 10) -> list[dict[str, Any]]:
    init_db()
    with get_connection() as connection:
        rows = connection.execute(
            """
            select id, target_date, status, total_count, success_count, failed_count,
                   error_message, started_at, finished_at
              from news_crawl_runs
             order by started_at desc
             limit ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]
