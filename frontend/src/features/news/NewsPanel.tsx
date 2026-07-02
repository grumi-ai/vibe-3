import { type FormEvent, useEffect, useState } from "react";
import { collectNews, fetchNews, fetchNewsCrawlRuns, type NewsArticle, type NewsCrawlRun } from "./api";

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function NewsPanel() {
  const [targetDate, setTargetDate] = useState(getYesterday);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [runs, setRuns] = useState<NewsCrawlRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(selectedDate = targetDate) {
    const [newsData, runData] = await Promise.all([fetchNews(selectedDate), fetchNewsCrawlRuns()]);
    setArticles(newsData.items);
    setRuns(runData.items);
  }

  useEffect(() => {
    refresh().catch((fetchError: unknown) => {
      setError(fetchError instanceof Error ? fetchError.message : "뉴스 데이터를 불러오지 못했습니다.");
    });
  }, []);

  async function handleCollect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await collectNews(targetDate, true);
      setArticles(result.items);
      await refresh(targetDate);
      setMessage(`${result.target_date} 기준 기사 ${result.success_count}건을 수집했습니다.`);
    } catch (collectError) {
      setError(collectError instanceof Error ? collectError.message : "뉴스 수집에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="newsCollector">
      <header className="sectionHeader">
        <p className="sectionEyebrow">뉴스 수집</p>
        <div>
          <h2 className="sectionTitle">공공 행정 뉴스 수집</h2>
          <p className="sectionDescription">
            날짜를 지정하면 공공 행정 관련 뉴스를 모아 보여줍니다. 백엔드는 매일 아침 자동 수집을 기준으로 동작합니다.
          </p>
        </div>
      </header>

      <form className="collectorBar" onSubmit={handleCollect}>
        <label>
          대상 날짜
          <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required />
        </label>
        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? "수집 중..." : "수집하기"}
        </button>
        <button
          type="button"
          className="ghostButton"
          onClick={() => refresh().catch((refreshError: unknown) => setError(refreshError instanceof Error ? refreshError.message : "새로고침에 실패했습니다."))}
        >
          새로고침
        </button>
      </form>

      {message ? <p className="successText">{message}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}

      <div className="newsGrid">
        <section className="panelCard">
          <h3>수집된 기사</h3>
          <div className="articleList">
            {articles.map((article) => (
              <article key={article.id} className="articleItem">
                <div>
                  <strong>{article.title}</strong>
                  <p>{article.summary ?? "요약 정보가 없습니다."}</p>
                </div>
                <dl>
                  <div>
                    <dt>기관</dt>
                    <dd>{article.agency ?? "-"}</dd>
                  </div>
                  <div>
                    <dt>게시일</dt>
                    <dd>{article.published_at ?? "-"}</dd>
                  </div>
                </dl>
                {article.url ? (
                  <a href={article.url} target="_blank" rel="noreferrer">
                    원문 보기
                  </a>
                ) : null}
              </article>
            ))}
            {articles.length === 0 ? <p className="probeText">해당 날짜에 수집된 기사가 없습니다.</p> : null}
          </div>
        </section>

        <section className="panelCard">
          <h3>수집 실행 기록</h3>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>상태</th>
                  <th>성공</th>
                  <th>실패</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>{run.target_date}</td>
                    <td>{run.status}</td>
                    <td>{run.success_count}</td>
                    <td>{run.failed_count}</td>
                  </tr>
                ))}
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>아직 수집 기록이 없습니다.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
