import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import LibraryPage from '@/app/library/page';
import HistoryPage from '@/app/history/page';
import { useLibraryStore } from '@/stores/libraryStore';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/library',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockManga = {
  id: 'mangadex-naruto',
  source: 'mangadex' as const,
  sourceMangaId: 'naruto',
  title: 'Naruto',
  alternativeTitles: {},
  description: 'Ninja adventure.',
  cover: 'https://uploads.mangadex.org/covers/naruto/cover.jpg',
  authors: ['Masashi Kishimoto'],
  artists: ['Masashi Kishimoto'],
  tags: [],
  demographic: 'shounen' as const,
  status: 'completed' as const,
  contentRating: 'safe' as const,
  originalLanguage: 'ja',
  availableTranslatedLanguages: ['en'],
  latestUploadedChapter: '700',
  readableOnKagami: true,
  hasInternalChapters: true,
  hasExternalLinks: false,
  externalSources: [],
  year: 1999,
};

describe('Library Shelf & History logs UI', () => {
  beforeAll(() => {
    // Populate store state with dummy library items and history logs
    useLibraryStore.setState({
      items: {
        'mangadex-naruto': {
          mangaId: 'mangadex-naruto',
          manga: mockManga,
          status: 'reading',
          isFavorite: true,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      history: {
        'mangadex-naruto': [
          {
            mangaId: 'mangadex-naruto',
            chapterId: 'chapter-123',
            chapterNumber: '1',
            pageIndex: 10,
            readAt: new Date().toISOString(),
          },
        ],
      },
    });
  });

  it('renders Library Shelf page listing Naruto manga card', () => {
    render(<LibraryPage />);

    // Verify header title
    expect(screen.getByRole('heading', { name: /library shelf/i })).toBeInTheDocument();

    // Verify manga title on shelf card is rendered
    expect(screen.getByText('Naruto')).toBeInTheDocument();
  });

  it('renders History page listing read chapters log', () => {
    render(<HistoryPage />);

    // Verify history title is rendered
    expect(screen.getByRole('heading', { name: /reading history/i })).toBeInTheDocument();

    // Verify history row description and title
    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByText(/Chapter 1/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resume/i })).toBeInTheDocument();
  });
});
