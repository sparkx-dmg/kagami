import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const chapterId = request.nextUrl.searchParams.get('chapterId');
    if (!chapterId) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    const res = await fetch(`https://weebcentral.com/chapters/${chapterId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch chapter page: ${res.status}`);
    }

    const html = await res.text();
    const preloadMatch = html.match(/<link\s+[^>]*href="([^"]*\/manga\/[^"]*\.(?:png|jpg|jpeg|webp))"/i);
    if (!preloadMatch || !preloadMatch[1]) {
      throw new Error('Preload image URL not found in HTML');
    }
    const firstPageUrl = preloadMatch[1];

    const maxPageMatch = html.match(/max_page:\s*parseInt\('(\d+)'\)/);
    if (!maxPageMatch || !maxPageMatch[1]) {
      throw new Error('Max page count not found in HTML');
    }
    const maxPage = parseInt(maxPageMatch[1]);

    const seriesIdMatch = html.match(/"series_id":\s*"([^"]+)"/);
    const seriesNameMatch = html.match(/"series_name":\s*"([^"]+)"/);
    const chapterMatch = html.match(/"chapter":\s*"([^"]+)"/);

    const mangaId = seriesIdMatch?.[1] ?? 'weeb-central-manga';
    const mangaTitle = seriesNameMatch?.[1] ?? 'Solo Leveling';
    const chapterName = chapterMatch?.[1] ?? 'Chapter';
    const chapterNumber = chapterName.replace('Chapter ', '').trim();

    const urlMatch = firstPageUrl.match(/^(.*?)(\d+)\.(png|jpg|jpeg|webp)$/i);
    if (!urlMatch || !urlMatch[1] || !urlMatch[3]) {
      throw new Error(`First page URL pattern not recognized: ${firstPageUrl}`);
    }
    const [, prefix, , ext] = urlMatch;

    const pages = Array.from({ length: maxPage }, (_, i) => {
      const padNum = String(i + 1).padStart(3, '0');
      return `${prefix}${padNum}.${ext}`;
    });

    return NextResponse.json({
      chapterNumber,
      title: chapterName,
      mangaId,
      mangaTitle,
      pages
    });
  } catch (error: any) {
    console.error('Error fetching fallback pages:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
