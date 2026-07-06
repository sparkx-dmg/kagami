const MANGADEX_BASE_SERVER = 'https://api.mangadex.org';
const MANGADEX_BASE_CLIENT = '/api/mangadex';
const USER_AGENT = 'KagamiMangaReader/1.0.0 (contact@kagami.ink)';

export class MangaDexApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MangaDexApiError';
    this.status = status;
  }
}

export async function mangadexFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? MANGADEX_BASE_SERVER : MANGADEX_BASE_CLIENT;
  const targetUrl = `${baseUrl}/${path.replace(/^\//, '')}`;

  const headers = new Headers(options?.headers);
  if (isServer) {
    headers.set('User-Agent', USER_AGENT);
  }
  headers.set('Accept', 'application/json');

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        const detail = errorData?.errors?.[0]?.detail || errorData?.message;
        if (detail) errorMessage = detail;
      } catch {}
      throw new MangaDexApiError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof MangaDexApiError) throw error;
    throw new Error(error instanceof Error ? error.message : 'Network error occurred');
  }
}
