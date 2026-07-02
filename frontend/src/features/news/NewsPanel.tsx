import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchNews, fetchNewsKeywords, type NewsArticle } from "./api";

export function NewsPanel() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetchNews()
      .then((data) => setArticles(data.items))
      .catch(() => setArticles([]));

    fetchNewsKeywords()
      .then((data) => setKeywords(data.items))
      .catch(() => setKeywords([]));
  }, []);

  return (
    <FeatureScaffold
      badge="News"
      title="뉴스 수집"
      description="수집된 뉴스와 키워드 상태를 한 화면에서 확인하는 구조를 먼저 배치한다."
      apiEndpoint="GET /api/news, GET /api/news/keywords"
      items={["수집 뉴스 목록", "키워드 필터", "수집 실행", "원문 링크 이동"]}
    >
      <p className="probeText">현재 DB 뉴스 {articles.length}건, 키워드 {keywords.length}건을 조회했다.</p>
    </FeatureScaffold>
  );
}
