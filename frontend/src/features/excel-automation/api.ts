import { apiGet, apiJson } from "../../shared/api/client";

export const excelEndpoints = {
  upload: "POST /api/excel/upload",
  split: "POST /api/excel/split",
  merge: "POST /api/excel/merge",
  download: "GET /api/excel/download/{file_id}",
};

export type ExcelUploadResponse = {
  filename: string;
  status: string;
  message: string;
};

export type ExcelJobResponse = {
  job_type: "split" | "merge";
  status: string;
  message: string;
  file_id: string | null;
  download_name: string | null;
  download_url: string | null;
};

export async function uploadExcelFile(filename: string, contentBase64: string): Promise<ExcelUploadResponse> {
  return apiJson<ExcelUploadResponse>("/api/excel/upload", "POST", {
    filename,
    content_base64: contentBase64,
  });
}

export async function splitExcel(filename: string, columnName: string): Promise<ExcelJobResponse> {
  return apiJson<ExcelJobResponse>("/api/excel/split", "POST", {
    filename,
    column_name: columnName,
  });
}

export async function mergeExcel(filenames: string[]): Promise<ExcelJobResponse> {
  return apiJson<ExcelJobResponse>("/api/excel/merge", "POST", { filenames });
}

export type ExcelDownloadInfo = {
  file_id: string;
  status: string;
  message: string;
  download_name: string | null;
  download_path: string | null;
};

export async function fetchExcelDownloadInfo(fileId: string): Promise<ExcelDownloadInfo> {
  return apiGet<ExcelDownloadInfo>(`/api/excel/download/${encodeURIComponent(fileId)}`);
}
