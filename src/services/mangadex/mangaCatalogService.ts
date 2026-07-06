import { mangadexFetch } from './client';
import { normalizeManga, normalizeChapter } from './mangaMetadataNormalizer';
import { KagamiManga, KagamiChapter, AtHomeServerResponse } from '@/types/manga';
import { searchSupplementalManga, getSupplementalMangaById } from '../supplemental/supplementalCatalog';

interface SearchParams {
  title?: string;
  limit?: number;
  offset?: number;
  contentRating?: string[];
  publicationDemographic?: string[];
  status?: string[];
  tags?: string[];
  excludedTags?: string[];
  order?: Record<string, 'asc' | 'desc'>;
}

export async function fetchMangaList(params: SearchParams): Promise<{ items: KagamiManga[]; total: number }> {
  const query = new URLSearchParams();
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  
  query.set('limit', limit.toString());
  query.set('offset', offset.toString());
  query.append('includes[]', 'cover_art');
  query.append('includes[]', 'author');
  query.append('includes[]', 'artist');

  if (params.title) {
    query.set('title', params.title);
  }

  const ratings = params.contentRating ?? ['safe', 'suggestive'];
  ratings.forEach((r) => query.append('contentRating[]', r));

  if (params.publicationDemographic) {
    params.publicationDemographic.forEach((d) => query.append('publicationDemographic[]', d));
  }

  if (params.status) {
    params.status.forEach((s) => query.append('status[]', s));
  }

  if (params.tags) {
    params.tags.forEach((t) => query.append('includedTags[]', t));
  }

  if (params.excludedTags) {
    params.excludedTags.forEach((t) => query.append('excludedTags[]', t));
  }

  if (params.order) {
    Object.keys(params.order).forEach((key) => {
      const direction = params.order?.[key];
      if (direction) {
        query.set(`order[${key}]`, direction);
      }
    });
  } else {
    query.set('order[followedCount]', 'desc');
  }

  try {
    const rawData = await mangadexFetch<{ data: any[]; total: number }>(
      `manga?${query.toString()}`
    );

    const mangadexItems = (rawData.data || []).map((m) => normalizeManga(m));
    let total = rawData.total || 0;

    let finalItems = [...mangadexItems];
    if (params.title && offset === 0) {
      const suppItems = searchSupplementalManga(params.title);
      const filteredSupp = suppItems.filter(
        (si) => !mangadexItems.some((mi) => mi.title.toLowerCase() === si.title.toLowerCase())
      );
      finalItems = [...filteredSupp, ...finalItems];
      total += filteredSupp.length;
    }

    return { items: finalItems, total };
  } catch (error) {
    if (params.title && offset === 0) {
      const suppItems = searchSupplementalManga(params.title);
      return { items: suppItems, total: suppItems.length };
    }
    throw error;
  }
}

export async function fetchMangaDetails(id: string): Promise<KagamiManga> {
  if (id.startsWith('supplemental-')) {
    const supp = getSupplementalMangaById(id);
    if (supp) return supp;
    throw new Error('Supplemental manga not found');
  }

  const cleanId = id.replace(/^mangadex-/, '');
  const url = `manga/${cleanId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  
  const rawData = await mangadexFetch<{ data: any }>(url);
  return normalizeManga(rawData.data);
}

export async function fetchChapterFeed(
  mangaId: string,
  options?: { limit?: number; offset?: number; translatedLanguage?: string[] }
): Promise<{ items: KagamiChapter[]; total: number }> {
  if (mangaId.startsWith('supplemental-')) {
    return { items: [], total: 0 };
  }

  const cleanId = mangaId.replace(/^mangadex-/, '');
  const languages = options?.translatedLanguage ?? ['en'];
  
  if (options?.limit !== undefined || options?.offset !== undefined) {
    const query = new URLSearchParams();
    query.set('limit', (options.limit ?? 100).toString());
    query.set('offset', (options.offset ?? 0).toString());
    query.append('includes[]', 'scanlation_group');
    languages.forEach((lang) => query.append('translatedLanguage[]', lang));
    query.set('order[chapter]', 'asc');

    const rawData = await mangadexFetch<{ data: any[]; total: number }>(
      `manga/${cleanId}/feed?${query.toString()}`
    );
    const items = (rawData.data || []).map((ch) => normalizeChapter(ch, mangaId));
    return { items, total: rawData.total || 0 };
  }

  let allItems: KagamiChapter[] = [];
  let currentOffset = 0;
  const fetchLimit = 500;
  let total = 0;

  do {
    const query = new URLSearchParams();
    query.set('limit', fetchLimit.toString());
    query.set('offset', currentOffset.toString());
    query.append('includes[]', 'scanlation_group');
    languages.forEach((lang) => query.append('translatedLanguage[]', lang));
    query.set('order[chapter]', 'asc');

    const rawData = await mangadexFetch<{ data: any[]; total: number }>(
      `manga/${cleanId}/feed?${query.toString()}`
    );

    total = rawData.total || 0;
    const pageItems = (rawData.data || []).map((ch) => normalizeChapter(ch, mangaId));
    allItems = [...allItems, ...pageItems];

    currentOffset += fetchLimit;
  } while (allItems.length < total && currentOffset < total);

  return { items: allItems, total };
}

export async function fetchAtHomeServer(chapterId: string): Promise<AtHomeServerResponse> {
  const rawData = await mangadexFetch<any>(`at-home/server/${chapterId}`);
  return {
    baseUrl: rawData.baseUrl,
    chapter: {
      hash: rawData.chapter.hash,
      data: rawData.chapter.data,
      dataSaver: rawData.chapter.dataSaver,
    },
  };
}
