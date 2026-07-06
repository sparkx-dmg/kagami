import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KagamiManga } from '@/types/manga';

export type LibraryStatus = 'reading' | 'planning' | 'on_hold' | 'completed' | 'dropped' | 'none';

export interface LibraryItem {
  mangaId: string;
  manga: KagamiManga;
  status: LibraryStatus;
  isFavorite: boolean;
  addedAt: string;
  updatedAt: string;
  notes?: string;
  userRating?: number;
}

export interface ReadingHistoryItem {
  mangaId: string;
  chapterId: string;
  chapterNumber: string;
  pageIndex: number;
  readAt: string;
}

export interface DownloadedChapter {
  mangaId: string;
  chapterId: string;
  mangaTitle: string;
  chapterNumber: string;
  pageCount: number;
  downloadedAt: string;
}

interface LibraryState {
  items: Record<string, LibraryItem>;
  history: Record<string, ReadingHistoryItem[]>;
  downloadedChapters: Record<string, DownloadedChapter>;
  addToLibrary: (manga: KagamiManga, status: LibraryStatus) => void;
  removeFromLibrary: (mangaId: string) => void;
  toggleFavorite: (mangaId: string) => void;
  updateStatus: (mangaId: string, status: LibraryStatus) => void;
  markChapterRead: (mangaId: string, chapterId: string, chapterNumber: string, pageIndex?: number) => void;
  isChapterRead: (mangaId: string, chapterId: string) => boolean;
  addDownloadedChapter: (download: DownloadedChapter) => void;
  removeDownloadedChapter: (chapterId: string) => void;
  isChapterDownloaded: (chapterId: string) => boolean;
  updateNotesAndRating: (mangaId: string, notes: string, rating: number) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: {},
      history: {},
      downloadedChapters: {},
      addToLibrary: (manga, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.items[manga.id];
          return {
            items: {
              ...state.items,
              [manga.id]: {
                mangaId: manga.id,
                manga,
                status,
                isFavorite: existing?.isFavorite || false,
                addedAt: existing?.addedAt || now,
                updatedAt: now,
              },
            },
          };
        });
      },
      removeFromLibrary: (mangaId) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[mangaId];
          return { items: newItems };
        });
      },
      toggleFavorite: (mangaId) => {
        set((state) => {
          const item = state.items[mangaId];
          if (!item) return {};
          return {
            items: {
              ...state.items,
              [mangaId]: {
                ...item,
                isFavorite: !item.isFavorite,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      updateStatus: (mangaId, status) => {
        const item = get().items[mangaId];
        if (!item) return;
        if (status === 'none') {
          get().removeFromLibrary(mangaId);
        } else {
          set((state) => ({
            items: {
              ...state.items,
              [mangaId]: {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        }
      },
      markChapterRead: (mangaId, chapterId, chapterNumber, pageIndex = 0) => {
        const now = new Date().toISOString();
        set((state) => {
          const currentHistory = state.history[mangaId] || [];
          const filtered = currentHistory.filter((h) => h.chapterId !== chapterId);
          const newHistory = [
            {
              mangaId,
              chapterId,
              chapterNumber,
              pageIndex,
              readAt: now,
            },
            ...filtered,
          ];
          return {
            history: {
              ...state.history,
              [mangaId]: newHistory,
            },
          };
        });
      },
      isChapterRead: (mangaId, chapterId) => {
        return (get().history[mangaId] || []).some((h) => h.chapterId === chapterId);
      },
      addDownloadedChapter: (download) => {
        set((state) => ({
          downloadedChapters: {
            ...state.downloadedChapters,
            [download.chapterId]: download,
          },
        }));
      },
      removeDownloadedChapter: (chapterId) => {
        set((state) => {
          const newDownloads = { ...state.downloadedChapters };
          delete newDownloads[chapterId];
          return { downloadedChapters: newDownloads };
        });
      },
      isChapterDownloaded: (chapterId) => {
        return !!get().downloadedChapters[chapterId];
      },
      updateNotesAndRating: (mangaId, notes, rating) => {
        const item = get().items[mangaId];
        if (!item) return;
        set((state) => ({
          items: {
            ...state.items,
            [mangaId]: {
              ...item,
              notes,
              userRating: rating,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },
    }),
    {
      name: 'kagami-library',
    }
  )
);
