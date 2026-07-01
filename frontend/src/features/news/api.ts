import { apiGet } from "../../shared/api/client";

export type NewsArticle = {
  id: number;
  title: string;
  source: string | null;
  keyword: string | null;
  collected_at: string;
};

export async function fetchNews(): Promise<{ items: NewsArticle[] }> {
  return apiGet<{ items: NewsArticle[] }>("/api/news");
}

export async function fetchNewsKeywords(): Promise<{ items: string[] }> {
  return apiGet<{ items: string[] }>("/api/news/keywords");
}
