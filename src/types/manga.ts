export type ContentRating = 'safe' | 'suggestive' | 'erotica' | 'pornographic';
export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
export type Demographic = 'shounen' | 'shoujo' | 'seinen' | 'josei' | 'none';

export interface KagamiManga {
  id: string;
  source: 'mangadex' | 'supplemental';
  sourceMangaId: string;
  title: string;
  alternativeTitles: Record<string, string>; // language code -> title
  description: string;
  cover: string | null;
  authors: string[];
  artists: string[];
  tags: string[];
  demographic: Demographic;
  status: MangaStatus;
  contentRating: ContentRating;
  originalLanguage: string;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string | null;
  readableOnKagami: boolean;
  hasInternalChapters: boolean;
  hasExternalLinks: boolean;
  externalSources: Array<{ name: string; url: string }>;
  year: number | null;
}

export interface KagamiChapter {
  id: string;
  mangaId: string;
  chapterNumber: string; // e.g. "1.5", "2", "3"
  volumeNumber: string | null;
  title: string | null;
  translatedLanguage: string;
  scanlationGroup: string | null;
  scanlationGroupId: string | null;
  pages: number;
  publishAt: string;
  externalUrl: string | null;
  readableOnKagami: boolean;
}

export interface AtHomeServerResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}
