import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_API_BASE = 'https://api.mangadex.org';
const USER_AGENT = 'KagamiMangaReader/1.0.0 (contact@kagami.ink)';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.search;
    const targetUrl = `${MANGADEX_API_BASE}/${path}${searchParams}`;

    const headers = new Headers();
    headers.set('User-Agent', USER_AGENT);
    headers.set('Accept', 'application/json');

    const authHeader = request.headers.get('Authorization');
    if (authHeader) headers.set('Authorization', authHeader);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      // Cache at the Next.js edge for 5 minutes so identical requests
      // served instantly without hitting MangaDex at all
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

    return NextResponse.json(data, {
      headers: {
        // Tell browser to cache for 5 minutes, serve stale for 1 extra minute
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 }
    );
  }
}
