import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchChapterFeed } from '@/services/mangadex/mangaCatalogService';
import { mangadexFetch } from '@/services/mangadex/client';

// Mock the API client
vi.mock('@/services/mangadex/client', () => ({
  mangadexFetch: vi.fn(),
}));

describe('fetchChapterFeed Pagination Loop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should recursively page through feed if limit/offset are omitted', async () => {
    // We will simulate a manga with 1200 chapters.
    // page 1: offset 0, limit 500 (returns 500 items, total 1200)
    // page 2: offset 500, limit 500 (returns 500 items, total 1200)
    // page 3: offset 1000, limit 500 (returns 200 items, total 1200)
    
    const mockPage1 = {
      data: Array.from({ length: 500 }).map((_, idx) => ({
        id: `ch-${idx}`,
        attributes: { chapter: `${idx + 1}`, translatedLanguage: 'en', pages: 10 },
        relationships: []
      })),
      total: 1200
    };

    const mockPage2 = {
      data: Array.from({ length: 500 }).map((_, idx) => ({
        id: `ch-${idx + 500}`,
        attributes: { chapter: `${idx + 501}`, translatedLanguage: 'en', pages: 10 },
        relationships: []
      })),
      total: 1200
    };

    const mockPage3 = {
      data: Array.from({ length: 200 }).map((_, idx) => ({
        id: `ch-${idx + 1000}`,
        attributes: { chapter: `${idx + 1001}`, translatedLanguage: 'en', pages: 10 },
        relationships: []
      })),
      total: 1200
    };

    // Set up mock implementations for successive calls
    vi.mocked(mangadexFetch)
      .mockResolvedValueOnce(mockPage1)
      .mockResolvedValueOnce(mockPage2)
      .mockResolvedValueOnce(mockPage3);

    const result = await fetchChapterFeed('mangadex-test-manga-id', { translatedLanguage: ['en'] });

    // Assertions
    expect(result.items.length).toBe(1200);
    expect(result.total).toBe(1200);
    expect(result.items[0]?.id).toBe('ch-0');
    expect(result.items[1199]?.id).toBe('ch-1199');

    // Verify mangadexFetch calls
    expect(mangadexFetch).toHaveBeenCalledTimes(3);
    expect(mangadexFetch).toHaveBeenNthCalledWith(1, expect.stringContaining('limit=500&offset=0'));
    expect(mangadexFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('limit=500&offset=500'));
    expect(mangadexFetch).toHaveBeenNthCalledWith(3, expect.stringContaining('limit=500&offset=1000'));
  });

  it('should not recursively page if limit option is explicitly provided', async () => {
    const mockPage = {
      data: [
        {
          id: 'ch-single',
          attributes: { chapter: '1', translatedLanguage: 'en', pages: 10 },
          relationships: []
        }
      ],
      total: 50
    };

    vi.mocked(mangadexFetch).mockResolvedValueOnce(mockPage);

    const result = await fetchChapterFeed('mangadex-test-manga-id', { limit: 10, translatedLanguage: ['en'] });

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(50);
    expect(mangadexFetch).toHaveBeenCalledTimes(1);
    expect(mangadexFetch).toHaveBeenCalledWith(expect.stringContaining('limit=10&offset=0'));
  });
});
