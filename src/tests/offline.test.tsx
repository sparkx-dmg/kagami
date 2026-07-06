import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import OfflinePage from '@/app/offline/page';
import { useLibraryStore } from '@/stores/libraryStore';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/offline',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Offline Download Manager UI', () => {
  beforeAll(() => {
    // Populate store state with dummy downloaded chapters
    useLibraryStore.setState({
      downloadedChapters: {
        'chapter-bleach-1': {
          mangaId: 'mangadex-bleach',
          chapterId: 'chapter-bleach-1',
          mangaTitle: 'Bleach',
          chapterNumber: '1',
          pageCount: 22,
          downloadedAt: new Date().toISOString(),
        },
      },
    });
  });

  it('renders offline page listing downloaded Bleach chapter', () => {
    render(<OfflinePage />);

    // Verify main header
    expect(screen.getByRole('heading', { name: /offline downloads/i })).toBeInTheDocument();

    // Verify manga title of downloaded chapter is rendered
    expect(screen.getByText('Bleach')).toBeInTheDocument();
    
    // Verify chapter description details
    expect(screen.getByText(/Chapter 1 • 22 Pages Cached/i)).toBeInTheDocument();

    // Verify read and delete buttons are present
    expect(screen.getByRole('link', { name: /read/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete chapter 1/i })).toBeInTheDocument();
  });
});
