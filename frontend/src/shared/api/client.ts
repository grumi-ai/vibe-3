const API_BASE_URL_STORAGE_KEY = "vibe3.apiBaseUrl";
const API_BASE_URL_CHANGED_EVENT = "vibe3-api-base-url-changed";
const DEFAULT_API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");

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
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return DEFAULT_API_BASE_URL;
  }

  const savedValue = window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);
  return normalizeApiBaseUrl(savedValue ?? DEFAULT_API_BASE_URL);
}

export function setApiBaseUrl(value: string): string {
  const normalizedValue = normalizeApiBaseUrl(value);
  if (normalizedValue) {
    window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalizedValue);
  } else {
    window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(API_BASE_URL_CHANGED_EVENT, { detail: normalizedValue }));
  return normalizedValue;
}

export function subscribeApiBaseUrlChange(callback: () => void): () => void {
  window.addEventListener(API_BASE_URL_CHANGED_EVENT, callback);
  return () => window.removeEventListener(API_BASE_URL_CHANGED_EVENT, callback);
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
