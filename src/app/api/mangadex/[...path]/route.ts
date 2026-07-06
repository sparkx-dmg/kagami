import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_API_BASE = 'https://api.mangadex.org';
const USER_AGENT = 'KagamiMangaReader/1.0.0 (contact@kagami.ink)';

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200;

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  try {
    await throttle();

    const path = params.path.join('/');
    const searchParams = request.nextUrl.search;
    const targetUrl = `${MANGADEX_API_BASE}/${path}${searchParams}`;

    const headers = new Headers();
    headers.set('User-Agent', USER_AGENT);
    headers.set('Accept', 'application/json');

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 }
    );
  }
}
