import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchPage from '@/app/search/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock catalog service
vi.mock('@/services/mangadex/mangaCatalogService', () => ({
  fetchMangaList: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'mangadex-testmanga',
        source: 'mangadex',
        sourceMangaId: 'testmanga',
        title: 'Hunter x Hunter',
        alternativeTitles: {},
        description: 'Gon searches for his father.',
        cover: 'https://uploads.mangadex.org/covers/hxh/cover.jpg',
        authors: ['Yoshihiro Togashi'],
        artists: ['Yoshihiro Togashi'],
        tags: ['Action', 'Adventure'],
        demographic: 'shounen',
        status: 'ongoing',
        contentRating: 'safe',
        originalLanguage: 'ja',
        availableTranslatedLanguages: ['en'],
        latestUploadedChapter: '400',
        readableOnKagami: true,
        hasInternalChapters: true,
        hasExternalLinks: false,
        externalSources: [],
        year: 1998,
      },
    ],
    total: 1,
  }),
}));

// Mock Next.js navigation with SearchParams
vi.mock('next/navigation', () => {
  const mockSearchParams = new URLSearchParams();
  return {
    usePathname: () => '/search',
    useSearchParams: () => mockSearchParams,
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Search & Discovery Catalog Page', () => {
  it('renders search input and filter controls', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SearchPage />
      </QueryClientProvider>
    );

    // Verify search input is rendered
    const input = screen.getByPlaceholderText(/Search by title/i);
    expect(input).toBeInTheDocument();

    // Verify filter toggle button
    const filterBtn = screen.getByRole('button', { name: /filters/i });
    expect(filterBtn).toBeInTheDocument();

    // Toggle filter drawer
    fireEvent.click(filterBtn);

    // Verify demographic selectors are visible
    const shounenBtn = screen.getByRole('button', { name: /shounen/i });
    expect(shounenBtn).toBeInTheDocument();
  });
});
