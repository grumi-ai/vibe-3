import { apiGet, apiJson } from "../../shared/api/client";

export type ManualItem = {
  id: number;
  filename: string;
  content_text: string | null;
  uploaded_at: string;
};

export type ManualUploadResponse = {
  item: ManualItem;
  message: string;
};

export type ComplaintChatResponse = {
  summary: string;
  recommended_script: string;
  checklist: string[];
  referenced_manuals: string[];
  disclaimer: string;
};

export async function fetchManuals(): Promise<{ items: ManualItem[] }> {
  return apiGet<{ items: ManualItem[] }>("/api/complaints/manuals");
}

export async function uploadManualFile(filename: string, contentBase64: string): Promise<ManualUploadResponse> {
  return apiJson<ManualUploadResponse>("/api/complaints/manuals/upload", "POST", {
    filename,
    content_base64: contentBase64,
  });
}

export async function createComplaintChat(question: string): Promise<ComplaintChatResponse> {
  return apiJson<ComplaintChatResponse>("/api/complaints/chat", "POST", { question });
}
