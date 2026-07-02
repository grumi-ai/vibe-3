import { apiGet, apiJson } from "../../shared/api/client";

export type NewsArticle = {
  id: number;
  title: string;
  source: string | null;
  agency: string | null;
  url: string | null;
  summary: string | null;
  content: string | null;
  keyword: string | null;
  published_at: string | null;
  target_date: string | null;
  collected_at: string;
};

export type NewsCrawlRun = {
  id: number;
  target_date: string;
  status: string;
  total_count: number;
  success_count: number;
  failed_count: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

export type NewsCollectResponse = NewsCrawlRun & {
  items: NewsArticle[];
  message: string;
};

export async function fetchNews(targetDate?: string): Promise<{ items: NewsArticle[] }> {
  const suffix = targetDate ? `?targetDate=${encodeURIComponent(targetDate)}` : "";
  return apiGet<{ items: NewsArticle[] }>(`/api/news${suffix}`);
}

export async function collectNews(targetDate: string, force = false): Promise<NewsCollectResponse> {
  return apiJson<NewsCollectResponse>("/api/news/collect", "POST", {
    target_date: targetDate,
    force,
  });
}

export async function fetchNewsCrawlRuns(): Promise<{ items: NewsCrawlRun[] }> {
  return apiGet<{ items: NewsCrawlRun[] }>("/api/news/crawl-runs");
}

export async function fetchNewsKeywords(): Promise<{ items: string[] }> {
  return apiGet<{ items: string[] }>("/api/news/keywords");
}
