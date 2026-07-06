import { describe, it, expect } from 'vitest';
import { normalizeManga, normalizeChapter } from '@/services/mangadex/mangaMetadataNormalizer';
import { searchSupplementalManga, getSupplementalMangaById } from '@/services/supplemental/supplementalCatalog';

describe('MangaDex Metadata Normalizer', () => {
  it('should normalize raw MangaDex response correctly', () => {
    const rawManga = {
      id: '12345',
      attributes: {
        title: { en: 'Test Manga' },
        altTitles: [{ ja: 'テストマンガ' }],
        description: { en: 'This is a description.' },
        status: 'ongoing',
        publicationDemographic: 'shounen',
        contentRating: 'safe',
        originalLanguage: 'ja',
        year: 2021,
      },
      relationships: [
        {
          type: 'cover_art',
          attributes: { fileName: 'cover.jpg' },
        },
        {
          type: 'author',
          attributes: { name: 'Test Author' },
        },
      ],
    };

    const normalized = normalizeManga(rawManga);

    expect(normalized.id).toBe('mangadex-12345');
    expect(normalized.title).toBe('Test Manga');
    expect(normalized.alternativeTitles.ja).toBe('テストマンガ');
    expect(normalized.cover).toBe('https://uploads.mangadex.org/covers/12345/cover.jpg.512.jpg');
    expect(normalized.authors).toContain('Test Author');
    expect(normalized.demographic).toBe('shounen');
    expect(normalized.status).toBe('ongoing');
    expect(normalized.contentRating).toBe('safe');
  });

  it('should normalize raw chapter feed items', () => {
    const rawChapter = {
      id: 'chapter-777',
      attributes: {
        chapter: '12',
        volume: '2',
        title: 'An Epic Fight',
        translatedLanguage: 'en',
        pages: 20,
        publishAt: '2026-07-04T12:00:00Z',
      },
      relationships: [
        {
          type: 'scanlation_group',
          id: 'group-abc',
          attributes: { name: 'Kagami Scans' },
        },
      ],
    };

    const normalized = normalizeChapter(rawChapter, 'mangadex-12345');

    expect(normalized.id).toBe('chapter-777');
    expect(normalized.chapterNumber).toBe('12');
    expect(normalized.volumeNumber).toBe('2');
    expect(normalized.title).toBe('An Epic Fight');
    expect(normalized.scanlationGroup).toBe('Kagami Scans');
    expect(normalized.scanlationGroupId).toBe('group-abc');
  });
});

describe('Supplemental Manga Catalog', () => {
  it('should retrieve a supplemental manga by ID', () => {
    const manga = getSupplementalMangaById('supplemental-jjk');
    expect(manga).not.toBeNull();
    expect(manga?.title).toBe('Jujutsu Kaisen');
  });

  it('should search through supplemental catalog by query', () => {
    const results = searchSupplementalManga('spy');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.title).toBe('Spy x Family');
  });
});
