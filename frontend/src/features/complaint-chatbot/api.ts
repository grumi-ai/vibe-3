import { apiGet } from "../../shared/api/client";

export type ManualItem = {
  id: number;
  filename: string;
  uploaded_at: string;
};

export async function fetchManuals(): Promise<{ items: ManualItem[] }> {
  return apiGet<{ items: ManualItem[] }>("/api/complaints/manuals");
}
