import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';

// Fix server's broken system DNS resolver (10.181.115.47 timeouts)
// by intercepting Node's lookup for api.mangadex.org and using Google/Cloudflare DNS
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(['8.8.8.8', '1.1.1.1']);

const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = options || {};

  if (hostname === 'api.mangadex.org') {
    dnsResolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        originalLookup(hostname, options, callback);
      } else {
        if (opts.all) {
          const results = addresses.map((addr) => ({ address: addr, family: 4 }));
          callback(null, results);
        } else {
          callback(null, addresses[0], 4);
        }
      }
    });
    return;
  }
  return originalLookup(hostname, options, callback);
} as any;

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
