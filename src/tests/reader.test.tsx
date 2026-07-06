/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReaderPage from '@/app/read/[chapterId]/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock catalog service
vi.mock('@/services/mangadex/mangaCatalogService', () => ({
  fetchAtHomeServer: vi.fn().mockResolvedValue({
    baseUrl: 'https://cmd.mangadex.org',
    chapter: {
      hash: 'chapterhash123',
      data: ['page1.jpg', 'page2.jpg', 'page3.jpg'],
      dataSaver: ['page1_saver.jpg', 'page2_saver.jpg', 'page3_saver.jpg'],
    },
  }),
  fetchMangaDetails: vi.fn().mockResolvedValue({
    id: 'mangadex-12345',
    title: 'One Piece',
    status: 'ongoing',
    authors: ['Eiichiro Oda'],
    artists: ['Eiichiro Oda'],
    tags: [],
    demographic: 'shounen',
    contentRating: 'safe',
    originalLanguage: 'ja',
    availableTranslatedLanguages: ['en'],
    latestUploadedChapter: '1111',
    readableOnKagami: true,
    hasInternalChapters: true,
    hasExternalLinks: false,
    externalSources: [],
    year: 1997,
  }),
}));

vi.mock('@/services/mangadex/client', () => ({
  mangadexFetch: vi.fn().mockResolvedValue({
    id: 'chapter-abc',
    attributes: {
      chapter: '1000',
      volume: '99',
      title: 'Strawhat Luffy',
      pages: 3,
    },
    relationships: [
      { type: 'manga', id: 'mangadex-12345' },
    ],
  }),
}));

// Mock React.use to bypass promise suspension in unit tests
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>();
  return {
    ...original,
    use: (promise: any) => {
      if (promise && typeof promise.then === 'function') {
        if (promise._resolved) return promise._resolved;
        return { chapterId: 'chapter-abc' };
      }
      return promise;
    }
  };
});

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/read/chapter-abc',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Premium Reader Engine', () => {
  it('renders chapter pages list and lets users click next', async () => {
    const mockParams = Promise.resolve({ chapterId: 'chapter-abc' }) as any;
    mockParams._resolved = { chapterId: 'chapter-abc' };

    render(
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ReaderPage params={mockParams} />
        </React.Suspense>
      </QueryClientProvider>
    );

    await act(async () => {
      await mockParams;
    });

    // Verify first page indicator matches total page count (3)
    const indicator = await screen.findByText('PAGE 1 / 3');
    expect(indicator).toBeInTheDocument();

    // Verify next page button exists
    const nextBtns = screen.getAllByRole('button', { name: /next/i });
    expect(nextBtns.length).toBeGreaterThanOrEqual(1);

    // Click next page
    const nextBtn = nextBtns[1] || nextBtns[0];
    if (nextBtn) fireEvent.click(nextBtn);

    // Verify page indicator updates to page 2
    const nextIndicator = screen.getByText('PAGE 2 / 3');
    expect(nextIndicator).toBeInTheDocument();
  });
});
