import { KagamiManga, KagamiChapter, Demographic, MangaStatus, ContentRating } from '@/types/manga';

interface RawRelationship {
  type: string;
  id?: string;
  attributes?: Record<string, any>;
}

interface RawMangaData {
  id: string;
  attributes?: {
    title?: Record<string, string>;
    altTitles?: Array<Record<string, string>>;
    description?: Record<string, string>;
    tags?: Array<{ attributes?: { name?: { en?: string } } }>;
    publicationDemographic?: string;
    status?: string;
    contentRating?: string;
    originalLanguage?: string;
    availableTranslatedLanguages?: string[];
    lastChapter?: string;
    latestUploadedChapter?: string;
    links?: Record<string, string>;
    year?: number;
  };
  relationships?: RawRelationship[];
}

interface RawChapterData {
  id: string;
  attributes?: {
    chapter?: string;
    volume?: string;
    title?: string;
    translatedLanguage?: string;
    pages?: number;
    publishAt?: string;
    externalUrl?: string;
  };
  relationships?: RawRelationship[];
}

function parseDemographic(val?: string): Demographic {
  if (!val) return 'none';
  const v = val.toLowerCase();
  return v === 'shounen' || v === 'shoujo' || v === 'seinen' || v === 'josei' ? (v as Demographic) : 'none';
}

function parseStatus(val?: string): MangaStatus {
  if (!val) return 'ongoing';
  const v = val.toLowerCase();
  return v === 'ongoing' || v === 'completed' || v === 'hiatus' || v === 'cancelled' ? (v as MangaStatus) : 'ongoing';
}

function parseContentRating(val?: string): ContentRating {
  if (!val) return 'safe';
  const v = val.toLowerCase();
  return v === 'safe' || v === 'suggestive' || v === 'erotica' || v === 'pornographic' ? (v as ContentRating) : 'safe';
}

export function normalizeManga(raw: RawMangaData): KagamiManga {
  const id = raw.id;
  const attrs = raw.attributes || {};

  const title = attrs.title?.en || attrs.title?.[Object.keys(attrs.title || {})[0] || ''] || 'Untitled';
  
  const alternativeTitles: Record<string, string> = {};
  if (Array.isArray(attrs.altTitles)) {
    attrs.altTitles.forEach((alt) => {
      Object.keys(alt).forEach((k) => {
        const val = alt[k];
        if (typeof val === 'string' && !alternativeTitles[k]) {
          alternativeTitles[k] = val;
        }
      });
    });
  }

  const description = attrs.description?.en || attrs.description?.[Object.keys(attrs.description || {})[0] || ''] || '';

  let coverFilename: string | null = null;
  const authors: string[] = [];
  const artists: string[] = [];

  if (Array.isArray(raw.relationships)) {
    raw.relationships.forEach((rel) => {
      if (rel.type === 'cover_art') {
        coverFilename = rel.attributes?.fileName || null;
      } else if (rel.type === 'author') {
        const name = rel.attributes?.name;
        if (name) authors.push(name);
      } else if (rel.type === 'artist') {
        const name = rel.attributes?.name;
        if (name) artists.push(name);
      }
    });
  }

  const cover = coverFilename
    ? `https://uploads.mangadex.org/covers/${id}/${coverFilename}.512.jpg`
    : null;

  const tags: string[] = [];
  if (Array.isArray(attrs.tags)) {
    attrs.tags.forEach((tag) => {
      const name = tag.attributes?.name?.en;
      if (name) tags.push(name);
    });
  }

  const availableLanguages = Array.isArray(attrs.availableTranslatedLanguages)
    ? attrs.availableTranslatedLanguages
    : [];

  const hasExternalLinks = !!attrs.links;
  const externalSources: Array<{ name: string; url: string }> = [];
  if (attrs.links) {
    Object.keys(attrs.links).forEach((key) => {
      const url = attrs.links?.[key];
      if (url) {
        externalSources.push({ name: key, url });
      }
    });
  }

  return {
    id: `mangadex-${id}`,
    source: 'mangadex',
    sourceMangaId: id,
    title,
    alternativeTitles,
    description,
    cover,
    authors: authors.length > 0 ? authors : ['Unknown Author'],
    artists: artists.length > 0 ? artists : ['Unknown Artist'],
    tags,
    demographic: parseDemographic(attrs.publicationDemographic),
    status: parseStatus(attrs.status),
    contentRating: parseContentRating(attrs.contentRating),
    originalLanguage: attrs.originalLanguage || 'ja',
    availableTranslatedLanguages: availableLanguages,
    latestUploadedChapter: attrs.lastChapter || attrs.latestUploadedChapter || null,
    readableOnKagami: true,
    hasInternalChapters: true,
    hasExternalLinks,
    externalSources,
    year: attrs.year || null,
  };
}

export function normalizeChapter(raw: RawChapterData, mangaId: string): KagamiChapter {
  const id = raw.id;
  const attrs = raw.attributes || {};

  let scanlationGroup: string | null = null;
  let scanlationGroupId: string | null = null;

  if (Array.isArray(raw.relationships)) {
    const groupRel = raw.relationships.find((rel) => rel.type === 'scanlation_group');
    if (groupRel) {
      scanlationGroupId = groupRel.id || null;
      scanlationGroup = groupRel.attributes?.name || 'Independent';
    }
  }

  const externalUrl = attrs.externalUrl || null;

  return {
    id,
    mangaId,
    chapterNumber: attrs.chapter || '0',
    volumeNumber: attrs.volume || null,
    title: attrs.title || null,
    translatedLanguage: attrs.translatedLanguage || 'en',
    scanlationGroup,
    scanlationGroupId,
    pages: attrs.pages || 0,
    publishAt: attrs.publishAt || new Date().toISOString(),
    externalUrl,
    readableOnKagami: !externalUrl,
  };
}
