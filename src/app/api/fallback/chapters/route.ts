import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const title = request.nextUrl.searchParams.get('title');
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const searchRes = await fetch('https://weebcentral.com/search/simple?location=main', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://weebcentral.com/'
      },
      body: `text=${encodeURIComponent(title)}`,
      next: { revalidate: 300 }
    });

    if (!searchRes.ok) {
      throw new Error(`Search failed with status: ${searchRes.status}`);
    }

    const searchHtml = await searchRes.text();
    const seriesMatch = searchHtml.match(/href="https:\/\/weebcentral\.com\/series\/([a-zA-Z0-9]+)\/([^"]+)"/);
    if (!seriesMatch) {
      return NextResponse.json([]);
    }

    const [, seriesId, slug] = seriesMatch;
    const listRes = await fetch(`https://weebcentral.com/series/${seriesId}/full-chapter-list`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://weebcentral.com/series/${seriesId}/${slug}`
      },
      next: { revalidate: 300 }
    });

    if (!listRes.ok) {
      throw new Error(`Failed to load full chapter list: ${listRes.status}`);
    }

    const listHtml = await listRes.text();
    const chapters: Array<{
      id: string;
      chapterNumber: string;
      title: string;
      volumeNumber: string;
      publishAt: string;
      pages: number;
    }> = [];

    const parts = listHtml.split('href="https://weebcentral.com/chapters/');
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i];
      if (!chunk) continue;

      const endQuoteIndex = chunk.indexOf('"');
      if (endQuoteIndex === -1) continue;
      const id = chunk.substring(0, endQuoteIndex);

      const chapterIndex = chunk.indexOf('Chapter');
      if (chapterIndex === -1) continue;

      const afterChapter = chunk.substring(chapterIndex + 7).trim();
      const matchNum = afterChapter.match(/^([0-9.]+)/);
      if (matchNum && matchNum[1]) {
        const chNum = matchNum[1];
        chapters.push({
          id,
          chapterNumber: chNum,
          title: `Chapter ${chNum}`,
          volumeNumber: '',
          publishAt: new Date().toISOString(),
          pages: 0
        });
      }
    }

    return NextResponse.json(chapters);
  } catch (error: any) {
    console.error('Error fetching fallback chapters:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
