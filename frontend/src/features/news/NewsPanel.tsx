import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchNews, fetchNewsKeywords, type NewsArticle } from "./api";

export function NewsPanel() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetchNews().then((data) => setArticles(data.items)).catch(() => setArticles([]));
    fetchNewsKeywords().then((data) => setKeywords(data.items)).catch(() => setKeywords([]));
  }, []);

  return (
    <FeatureScaffold
      badge="News"
      title="뉴스 기사 수집"
      description="공공 행정 관련 뉴스를 매일 아침 수집하고 날짜, 키워드로 조회하는 영역입니다."
      apiEndpoint="GET /api/news, POST /api/news/collect"
      items={["수집 키워드 관리", "뉴스 목록 조회", "원문 링크 이동"]}
    >
      <p className="probeText">
        현재 DB 기사 {articles.length}건, 키워드 {keywords.length}개 조회됨
      </p>
    </FeatureScaffold>
  );
}
