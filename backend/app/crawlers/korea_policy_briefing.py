from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from html import unescape
from urllib.parse import urljoin, urlsplit, urlunsplit

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://www.korea.kr"
LIST_URL = f"{BASE_URL}/news/policyNewsList.do"
SOURCE_NAME = "대한민국 정책브리핑"
REQUEST_TIMEOUT_SECONDS = 15
MAX_PAGES_PER_DAY = 20


@dataclass(frozen=True)
class PolicyArticle:
    title: str
    source: str
    agency: str | None
    url: str
    summary: str | None
    content: str
    published_at: str
    target_date: str


class KoreaPolicyBriefingCrawler:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (compatible; PublicAdminSuperApp/0.1; "
                    "+https://www.korea.kr)"
                )
            }
        )

    def collect_by_date(self, target_date: date) -> tuple[list[PolicyArticle], list[str]]:
        target_date_text = target_date.isoformat()
        seen_urls: set[str] = set()
        articles: list[PolicyArticle] = []
        errors: list[str] = []

        for page_index in range(1, MAX_PAGES_PER_DAY + 1):
            html = self._fetch_list_page(target_date_text, page_index)
            links = self._parse_article_links(html)
            if not links:
                break

            matched_on_page = 0
            for url in links:
                canonical_url = _canonicalize_url(url)
                if canonical_url in seen_urls:
                    continue
                seen_urls.add(canonical_url)

                try:
                    detail_html = self._fetch_detail_page(canonical_url)
                    article = self._parse_detail_page(detail_html, canonical_url, target_date_text)
                except Exception as exc:  # external HTML can change independently of the app
                    errors.append(f"{canonical_url}: {exc}")
                    continue

                if article.target_date != target_date_text:
                    continue

                matched_on_page += 1
                articles.append(article)

            if page_index > 1 and matched_on_page == 0:
                break

        return articles, errors

    def _fetch_list_page(self, target_date_text: str, page_index: int) -> str:
        response = self.session.get(
            LIST_URL,
            params={
                "startDate": target_date_text,
                "endDate": target_date_text,
                "pageIndex": str(page_index),
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text

    def _fetch_detail_page(self, url: str) -> str:
        response = self.session.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text

    def _parse_article_links(self, html: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        links: list[str] = []
        for anchor in soup.select("a[href*='policyNewsView.do?newsId=']"):
            href = anchor.get("href")
            if not href:
                continue
            links.append(urljoin(BASE_URL, href))
        return links

    def _parse_detail_page(self, html: str, url: str, fallback_date: str) -> PolicyArticle:
        soup = BeautifulSoup(html, "html.parser")
        title = _clean_text(soup.select_one("#container h1"))
        if not title:
            raise ValueError("title not found")

        summary = _clean_text(soup.select_one("#container .article_head h2")) or None
        content = _clean_text(soup.select_one("#container .view_cont"))
        if not content:
            raise ValueError("content not found")

        info = soup.select_one("#container .article_head .info")
        published_at = _extract_date_text(info) or fallback_date
        target_date = published_at.replace(".", "-")
        agency = _extract_agency(info)

        return PolicyArticle(
            title=title,
            source=SOURCE_NAME,
            agency=agency,
            url=_canonicalize_url(url),
            summary=summary,
            content=content,
            published_at=target_date,
            target_date=target_date,
        )


def _clean_text(node: object | None) -> str:
    if node is None:
        return ""
    text = node.get_text(" ", strip=True)  # type: ignore[attr-defined]
    return " ".join(unescape(text).split())


def _extract_date_text(node: object | None) -> str | None:
    if node is None:
        return None
    for span in node.select("span"):  # type: ignore[attr-defined]
        text = _clean_text(span)
        if len(text) == 10 and text.count(".") == 2:
            return text
    return None


def _extract_agency(node: object | None) -> str | None:
    if node is None:
        return None
    link = node.select_one("a.gotosite")  # type: ignore[attr-defined]
    if link is None:
        return None
    text = _clean_text(link)
    return text.replace("부처별 뉴스 이동", "").strip() or None


def _canonicalize_url(url: str) -> str:
    absolute_url = urljoin(BASE_URL, url)
    parts = urlsplit(absolute_url)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, parts.query.split("&")[0], ""))
