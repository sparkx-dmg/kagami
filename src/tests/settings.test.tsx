import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import SettingsPage from '@/app/settings/page';
import { useLibraryStore } from '@/stores/libraryStore';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/settings',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Settings Preferences & Sync UI', () => {
  beforeAll(() => {
    // Populate store state with dummy library items
    useLibraryStore.setState({
      items: {
        'mangadex-onepiece': {
          mangaId: 'mangadex-onepiece',
          manga: {
            id: 'mangadex-onepiece',
            source: 'mangadex' as const,
            sourceMangaId: 'onepiece',
            title: 'One Piece',
            alternativeTitles: {},
            description: 'Pirate adventure.',
            cover: 'https://uploads.mangadex.org/covers/onepiece/cover.jpg',
            authors: ['Eiichiro Oda'],
            artists: ['Eiichiro Oda'],
            tags: [],
            demographic: 'shounen' as const,
            status: 'ongoing' as const,
            contentRating: 'safe' as const,
            originalLanguage: 'ja',
            availableTranslatedLanguages: ['en'],
            latestUploadedChapter: '1111',
            readableOnKagami: true,
            hasInternalChapters: true,
            hasExternalLinks: false,
            externalSources: [],
            year: 1997,
          },
          status: 'reading',
          isFavorite: true,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      history: {},
    });
  });

  it('renders settings page elements, themes, and library statistics', () => {
    render(<SettingsPage />);

    // Verify main header
    expect(screen.getByRole('heading', { name: /preferences & settings/i })).toBeInTheDocument();

    // Verify bento segments exist
    expect(screen.getByText('Color Theme')).toBeInTheDocument();
    expect(screen.getByText('Accent Tone')).toBeInTheDocument();

    // Verify database sync section stats card renders correctly
    expect(screen.getByText(/Followed titles: 1/i)).toBeInTheDocument();

    // Verify download export button is present
    expect(screen.getByRole('button', { name: /export data backup/i })).toBeInTheDocument();
  });
});
