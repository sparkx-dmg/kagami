import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock catalog service
vi.mock('@/services/mangadex/mangaCatalogService', () => ({
  fetchMangaList: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'mangadex-onepiece',
        source: 'mangadex',
        sourceMangaId: 'onepiece',
        title: 'One Piece',
        alternativeTitles: { ja: 'ワンピース' },
        description: 'Luffy searches for the One Piece.',
        cover: 'https://uploads.mangadex.org/covers/onepiece/cover.jpg',
        authors: ['Eiichiro Oda'],
        artists: ['Eiichiro Oda'],
        tags: ['Adventure', 'Fantasy'],
        demographic: 'shounen',
        status: 'ongoing',
        contentRating: 'safe',
        originalLanguage: 'ja',
        availableTranslatedLanguages: ['en'],
        latestUploadedChapter: '1111',
        readableOnKagami: true,
        hasInternalChapters: true,
        hasExternalLinks: false,
        externalSources: [],
        year: 1997,
      },
    ],
    total: 1,
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
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

describe('Dashboard Homepage', () => {
  it('renders bento dashboard elements and sections', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );

    // Verify bento branding/header title
    const headerTitle = screen.getByRole('heading', { name: /dashboard/i });
    expect(headerTitle).toBeInTheDocument();

    // Verify sections are visible
    const trendingSection = screen.getByRole('heading', { name: /trending/i });
    expect(trendingSection).toBeInTheDocument();

    const latestSection = screen.getByRole('heading', { name: /latest/i });
    expect(latestSection).toBeInTheDocument();
  });
});
