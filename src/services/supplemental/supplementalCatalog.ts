import { KagamiManga } from '@/types/manga';

export const curatedSupplementalManga: KagamiManga[] = [
  {
    id: 'supplemental-mha',
    source: 'supplemental',
    sourceMangaId: 'mha',
    title: 'My Hero Academia',
    alternativeTitles: {
      ja: '僕のヒーローアカデミア',
      en: 'Boku no Hero Academia',
    },
    description: 'In a world where super powers (quirks) are the norm, Izuku Midoriya is born quirkless but dreams of becoming the world’s greatest hero.',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop', // beautiful royalty free placeholder cover
    authors: ['Kohei Horikoshi'],
    artists: ['Kohei Horikoshi'],
    tags: ['Action', 'Comedy', 'Superpowers', 'School Life'],
    demographic: 'shounen',
    status: 'completed',
    contentRating: 'safe',
    originalLanguage: 'ja',
    availableTranslatedLanguages: ['en'],
    latestUploadedChapter: '430',
    readableOnKagami: false,
    hasInternalChapters: false,
    hasExternalLinks: true,
    externalSources: [
      { name: 'MangaPlus', url: 'https://mangaplus.shueisha.co.jp/' },
      { name: 'Viz Media', url: 'https://www.viz.com/shonenjump' }
    ],
    year: 2014
  },
  {
    id: 'supplemental-jjk',
    source: 'supplemental',
    sourceMangaId: 'jjk',
    title: 'Jujutsu Kaisen',
    alternativeTitles: {
      ja: '呪術廻戦',
      en: 'Sorcery Fight',
    },
    description: 'Yuji Itadori, a high school student with extraordinary physical abilities, eats a cursed finger to save his friends and gets dragged into a world of curses and sorcerers.',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    authors: ['Gege Akutami'],
    artists: ['Gege Akutami'],
    tags: ['Action', 'Drama', 'Supernatural', 'Dark Fantasy'],
    demographic: 'shounen',
    status: 'completed',
    contentRating: 'suggestive',
    originalLanguage: 'ja',
    availableTranslatedLanguages: ['en'],
    latestUploadedChapter: '271',
    readableOnKagami: false,
    hasInternalChapters: false,
    hasExternalLinks: true,
    externalSources: [
      { name: 'MangaPlus', url: 'https://mangaplus.shueisha.co.jp/' },
      { name: 'Viz Media', url: 'https://www.viz.com/shonenjump' }
    ],
    year: 2018
  },
  {
    id: 'supplemental-csm',
    source: 'supplemental',
    sourceMangaId: 'csm',
    title: 'Chainsaw Man',
    alternativeTitles: {
      ja: 'チェンソーマン',
    },
    description: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. After dying at the hands of the yakuza, he makes a contract to become the legendary Chainsaw Man.',
    cover: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=600&auto=format&fit=crop',
    authors: ['Tatsuki Fujimoto'],
    artists: ['Tatsuki Fujimoto'],
    tags: ['Action', 'Gore', 'Dark Comedy', 'Supernatural'],
    demographic: 'shounen',
    status: 'ongoing',
    contentRating: 'erotica',
    originalLanguage: 'ja',
    availableTranslatedLanguages: ['en'],
    latestUploadedChapter: '170',
    readableOnKagami: false,
    hasInternalChapters: false,
    hasExternalLinks: true,
    externalSources: [
      { name: 'MangaPlus', url: 'https://mangaplus.shueisha.co.jp/' },
      { name: 'Viz Media', url: 'https://www.viz.com/shonenjump' }
    ],
    year: 2018
  },
  {
    id: 'supplemental-sxf',
    source: 'supplemental',
    sourceMangaId: 'sxf',
    title: 'Spy x Family',
    alternativeTitles: {
      ja: 'SPY×FAMILY',
    },
    description: 'A spy on an undercover mission marries a professional assassin and adopts a telepathic daughter, all while keeping their double lives secret from each other.',
    cover: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?q=80&w=600&auto=format&fit=crop',
    authors: ['Tatsuya Endo'],
    artists: ['Tatsuya Endo'],
    tags: ['Action', 'Comedy', 'Slice of Life', 'Espionage'],
    demographic: 'shounen',
    status: 'ongoing',
    contentRating: 'safe',
    originalLanguage: 'ja',
    availableTranslatedLanguages: ['en'],
    latestUploadedChapter: '100',
    readableOnKagami: false,
    hasInternalChapters: false,
    hasExternalLinks: true,
    externalSources: [
      { name: 'MangaPlus', url: 'https://mangaplus.shueisha.co.jp/' },
      { name: 'Viz Media', url: 'https://www.viz.com/shonenjump' }
    ],
    year: 2019
  }
];

export function getSupplementalMangaById(id: string): KagamiManga | null {
  const item = curatedSupplementalManga.find((m) => m.id === id || m.sourceMangaId === id);
  return item || null;
}

export function searchSupplementalManga(query: string): KagamiManga[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return curatedSupplementalManga.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.authors.some((a) => a.toLowerCase().includes(q)) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      Object.values(m.alternativeTitles).some((alt) => alt.toLowerCase().includes(q))
  );
}
