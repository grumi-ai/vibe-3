export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} 응답 오류: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
