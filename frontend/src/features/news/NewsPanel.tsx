import { type FormEvent, useEffect, useState } from "react";
import {
  collectNews,
  fetchNews,
  fetchNewsCrawlRuns,
  type NewsArticle,
  type NewsCrawlRun,
} from "./api";

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
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load policy news.");
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
      setMessage(`Collected ${result.success_count} articles for ${result.target_date}.`);
    } catch (collectError) {
      setError(collectError instanceof Error ? collectError.message : "Failed to collect policy news.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="newsCollector">
      <header className="sectionHeader">
        <p className="sectionEyebrow">Policy News</p>
        <div>
          <h2 className="sectionTitle">대한민국 정책브리핑 수집</h2>
          <p className="sectionDescription">
            Select a date and collect policy news from korea.kr. The backend also runs the previous-day crawl every day at 09:00.
          </p>
        </div>
      </header>

      <form className="collectorBar" onSubmit={handleCollect}>
        <label>
          Target date
          <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required />
        </label>
        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? "Collecting..." : "Collect"}
        </button>
        <button
          type="button"
          className="ghostButton"
          onClick={() => refresh().catch((refreshError: unknown) => setError(refreshError instanceof Error ? refreshError.message : "Failed to refresh."))}
        >
          Refresh
        </button>
      </form>

      {message ? <p className="successText">{message}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}

      <div className="newsGrid">
        <section className="panelCard">
          <h3>Collected articles</h3>
          <div className="articleList">
            {articles.map((article) => (
              <article key={article.id} className="articleItem">
                <div>
                  <strong>{article.title}</strong>
                  <p>{article.summary ?? "No summary available."}</p>
                </div>
                <dl>
                  <div>
                    <dt>Agency</dt>
                    <dd>{article.agency ?? "-"}</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{article.published_at ?? "-"}</dd>
                  </div>
                </dl>
                {article.url ? (
                  <a href={article.url} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                ) : null}
              </article>
            ))}
            {articles.length === 0 ? <p className="probeText">No articles collected for this date.</p> : null}
          </div>
        </section>

        <section className="panelCard">
          <h3>Crawl runs</h3>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Saved</th>
                  <th>Failed</th>
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
                    <td colSpan={4}>No crawl runs yet.</td>
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
