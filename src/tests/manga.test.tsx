/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MangaDetailsPage from '@/app/manga/[id]/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLibraryStore } from '@/stores/libraryStore';


// Mock catalog service
vi.mock('@/services/mangadex/mangaCatalogService', () => ({
  fetchMangaDetails: vi.fn().mockImplementation((id: string) => {
    if (id === 'mangadex-nsfw') {
      return Promise.resolve({
        id: 'mangadex-nsfw',
        source: 'mangadex',
        sourceMangaId: 'nsfw',
        title: 'Explicit Title',
        alternativeTitles: {},
        description: 'Mature description.',
        cover: null,
        authors: ['Mature Author'],
        artists: ['Mature Artist'],
        tags: [],
        demographic: 'none',
        status: 'ongoing',
        contentRating: 'erotica',
        originalLanguage: 'ja',
        availableTranslatedLanguages: ['en'],
        latestUploadedChapter: '1',
        readableOnKagami: true,
        hasInternalChapters: true,
        hasExternalLinks: false,
        externalSources: [],
        year: 2020,
      });
    }
    return Promise.resolve({
      id: 'mangadex-12345',
      source: 'mangadex',
      sourceMangaId: '12345',
      title: 'Bleach',
      alternativeTitles: { en: 'Bleach Manga' },
      description: 'Ichigo becomes a soul reaper.',
      cover: 'https://uploads.mangadex.org/covers/12345/cover.jpg',
      authors: ['Tite Kubo'],
      artists: ['Tite Kubo'],
      tags: ['Action', 'Fantasy'],
      demographic: 'shounen',
      status: 'completed',
      contentRating: 'safe',
      originalLanguage: 'ja',
      availableTranslatedLanguages: ['en'],
      latestUploadedChapter: '686',
      readableOnKagami: true,
      hasInternalChapters: true,
      hasExternalLinks: false,
      externalSources: [],
      year: 2001,
    });
  }),
  fetchChapterFeed: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'chapter-1',
        mangaId: 'mangadex-12345',
        chapterNumber: '1',
        volumeNumber: '1',
        title: 'Death and Strawberry',
        translatedLanguage: 'en',
        scanlationGroup: 'Kagami Scans',
        scanlationGroupId: 'group-abc',
        pages: 55,
        publishAt: '2026-07-04T12:00:00Z',
        externalUrl: null,
        readableOnKagami: true,
      },
    ],
    total: 1,
  }),
}));

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/manga/mangadex-12345',
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

describe('Manga Detail Page Component', () => {
  it('renders Bleach details, tags, author, and chapter list', async () => {
    // Seed library store state
    useLibraryStore.setState({
      items: {
        'mangadex-12345': {
          mangaId: 'mangadex-12345',
          manga: {
            id: 'mangadex-12345',
            source: 'mangadex',
            sourceMangaId: '12345',
            title: 'Bleach',
            alternativeTitles: {},
            description: 'Soul Reaper adventure.',
            cover: 'https://uploads.mangadex.org/covers/bleach/cover.jpg',
            authors: ['Tite Kubo'],
            artists: ['Tite Kubo'],
            tags: [],
            demographic: 'shounen',
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            availableTranslatedLanguages: ['en'],
            latestUploadedChapter: '686',
            readableOnKagami: true,
            hasInternalChapters: true,
            hasExternalLinks: false,
            externalSources: [],
            year: 2001,
          },
          status: 'reading',
          isFavorite: false,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: 'Pre-existing note',
          userRating: 8,
        },
      },
    });

    // Resolve hook promise params
    const mockParams = Promise.resolve({ id: 'mangadex-12345' }) as any;
    mockParams._resolved = { id: 'mangadex-12345' };
    
    render(
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <MangaDetailsPage params={mockParams} />
        </React.Suspense>
      </QueryClientProvider>
    );

    await act(async () => {
      await mockParams;
    });

    // Verify title and author rendering
    const title = await screen.findByRole('heading', { name: /bleach/i });
    expect(title).toBeInTheDocument();
    
    const authors = screen.getAllByText('Tite Kubo');
    expect(authors.length).toBeGreaterThanOrEqual(1);

    // Verify reading diary input exists and matches pre-existing notes
    const notesInput = screen.getByPlaceholderText(/Write your review or reading log here/i);
    expect(notesInput).toBeInTheDocument();
    expect(notesInput).toHaveValue('Pre-existing note');

    // Verify volume grouping banner
    const volHeader = await screen.findByText('Volume 1');
    expect(volHeader).toBeInTheDocument();

    // Verify chapter row
    const chapter = screen.getByText(/Death and Strawberry/i);
    expect(chapter).toBeInTheDocument();
  });

  it('blocks erotica content when sfwMode is enabled', async () => {
    const mockParams = Promise.resolve({ id: 'mangadex-nsfw' }) as any;
    mockParams._resolved = { id: 'mangadex-nsfw' };

    render(
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <MangaDetailsPage params={mockParams} />
        </React.Suspense>
      </QueryClientProvider>
    );

    await act(async () => {
      await mockParams;
    });

    // Verify SFW warning card is rendered
    const warningHeader = await screen.findByText(/CONTENT WARNING/i);
    expect(warningHeader).toBeInTheDocument();
    
    const warningMsg = screen.getByText(/Title Restricted by Safe Mode/i);
    expect(warningMsg).toBeInTheDocument();
  });
});
