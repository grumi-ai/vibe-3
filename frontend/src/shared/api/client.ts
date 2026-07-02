const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");

function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function buildApiUrl(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path));

  if (!response.ok) {
    throw new Error(`${path} 응답 오류: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${path} ?묐떟 ?ㅻ쪟: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
