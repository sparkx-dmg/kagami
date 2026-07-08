// MangaDex allows CORS from browsers, so we call it directly from the client.
// The proxy (/api/mangadex) is kept only for server-side rendering context.
const MANGADEX_DIRECT = 'https://api.mangadex.org';
const MANGADEX_PROXY  = '/api/mangadex';
const USER_AGENT = 'KagamiMangaReader/1.0.0 (contact@kagami.ink)';

// ─── Concurrency queue ───────────────────────────────────────────────────────
// Caps simultaneous in-flight requests to 4 so we never saturate MangaDex.
const MAX_CONCURRENT = 4;
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

function processQueue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    const next = requestQueue.shift()!;
    activeRequests++;
    next();
  }
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequests--;
          processQueue();
        });
    };
    if (activeRequests < MAX_CONCURRENT) {
      activeRequests++;
      run();
    } else {
      requestQueue.push(run);
    }
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export class MangaDexApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MangaDexApiError';
    this.status = status;
  }
}

async function doFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isServer = typeof window === 'undefined';

  // Server  → direct to MangaDex (since server DNS is overridden and fixed in Node)
  // Browser → use proxy path (relative path to bypass browser-side DNS issues)
  const baseUrl = isServer ? MANGADEX_DIRECT : MANGADEX_PROXY;
  const cleanPath = path.replace(/^\//, '');
  const targetUrl = `${baseUrl}/${cleanPath}`;

  const headers = new Headers(options?.headers);
  if (isServer) {
    headers.set('User-Agent', USER_AGENT);
  }
  headers.set('Accept', 'application/json');

  const response = await fetch(targetUrl, {
    ...options,
    headers,
    // On the browser side, tell the CDN to cache for 5 minutes
    ...(isServer ? {} : { cache: 'default' }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      const detail = errorData?.errors?.[0]?.detail || errorData?.message;
      if (detail) errorMessage = detail;
    } catch {
      // ignore JSON parse errors on error bodies
    }
    throw new MangaDexApiError(errorMessage, response.status);
  }

  return (await response.json()) as T;
}

export async function mangadexFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    return await enqueue(() => doFetch<T>(path, options));
  } catch (error) {
    if (error instanceof MangaDexApiError) throw error;
    throw new Error(error instanceof Error ? error.message : 'Network error occurred');
  }
}
