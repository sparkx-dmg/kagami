'use client';

import React, { useState, use, useEffect, useMemo, ViewTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchMangaDetails, fetchChapterFeed, fetchAtHomeServer } from '@/services/mangadex/mangaCatalogService';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLibraryStore, LibraryStatus } from '@/stores/libraryStore';
import { ArrowLeft, BookOpen, Star, Check, ExternalLink, Share2, ListFilter, ChevronDown, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English (EN)',
  ja: 'Japanese (JA)',
  es: 'Spanish (ES)',
  'es-la': 'Spanish (LA)',
  fr: 'French (FR)',
  'pt-br': 'Portuguese (BR)',
  pt: 'Portuguese (PT)',
  ru: 'Russian (RU)',
  ko: 'Korean (KO)',
  zh: 'Chinese (ZH)',
  'zh-hk': 'Chinese (HK)',
  it: 'Italian (IT)',
  pl: 'Polish (PL)',
  tr: 'Turkish (TR)',
  de: 'German (DE)',
  vi: 'Vietnamese (VI)',
  id: 'Indonesian (ID)',
  hi: 'Hindi (HI)',
  ro: 'Romanian (RO)',
  he: 'Hebrew (HE)',
  ka: 'Georgian (KA)',
  ms: 'Malay (MS)',
  fa: 'Persian (FA)',
  ar: 'Arabic (AR)',
  hu: 'Hungarian (HU)',
  uk: 'Ukrainian (UK)',
  th: 'Thai (TH)',
  tl: 'Tagalog (TL)',
  el: 'Greek (EL)',
  bn: 'Bengali (BN)',
  my: 'Burmese (MY)',
  sr: 'Serbian (SR)',
  sv: 'Swedish (SV)',
  cs: 'Czech (CS)',
  bg: 'Bulgarian (BG)',
  da: 'Danish (DA)',
  fi: 'Finnish (FI)',
  no: 'Norwegian (NO)',
  hr: 'Croatian (HR)',
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.015 }
  }
} as const;

const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  }
} as const;

export default function MangaDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
  const sfwMode = useSettingsStore((state) => state.settings.sfwMode);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const { items: libraryItems, addToLibrary, updateStatus, toggleFavorite, history, addDownloadedChapter, isChapterDownloaded, updateNotesAndRating } = useLibraryStore();
  const libraryItem = libraryItems[id];
  const isFavorite = libraryItem?.isFavorite || false;
  const currentStatus = libraryItem?.status || 'none';

  const [sortDesc, setSortDesc] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [downloadingChapterId, setDownloadingChapterId] = useState<string | null>(null);

  const [userRating, setUserRating] = useState(0);
  const [notesText, setNotesText] = useState('');
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [expandedVolume, setExpandedVolume] = useState<string | null>(null);
  const [transitioningVolume, setTransitioningVolume] = useState<string | null>(null);

  useEffect(() => {
    if (libraryItem) {
      setUserRating(libraryItem.userRating || 0);
      setNotesText(libraryItem.notes || '');
    }
  }, [libraryItem]);

  const handleUpdateRating = (rating: number) => {
    setUserRating(rating);
    updateNotesAndRating(id, notesText, rating);
  };

  const handleUpdateNotes = (notes: string) => {
    setNotesText(notes);
    updateNotesAndRating(id, notes, userRating);
  };

  const handleDownloadChapter = async (ch: { id: string; chapterNumber: string }) => {
    if (!manga) return;
    try {
      setDownloadingChapterId(ch.id);
      const atHomeData = await fetchAtHomeServer(ch.id);
      const pages = atHomeData?.chapter?.dataSaver || [];
      
      if ('caches' in window) {
        const cache = await caches.open('kagami-offline-chapters');
        const urls = pages.map((filename: string) => 
          `${atHomeData.baseUrl}/data-saver/${atHomeData.chapter.hash}/${filename}`
        );
        await Promise.all(urls.map((url: string) => cache.add(url)));
      }

      addDownloadedChapter({
        mangaId: manga.id,
        chapterId: ch.id,
        mangaTitle: manga.title,
        chapterNumber: ch.chapterNumber,
        pageCount: pages.length,
        downloadedAt: new Date().toISOString(),
      });
      
      alert(`Chapter ${ch.chapterNumber} downloaded successfully for offline reading!`);
    } catch (err) {
      console.error(err);
      alert('Failed to download chapter.');
    } finally {
      setDownloadingChapterId(null);
    }
  };

  const {
    data: manga,
    isLoading: loadingManga,
    isError: errorManga,
    refetch: refetchManga,
  } = useQuery({
    queryKey: ['manga', 'details', id],
    queryFn: () => fetchMangaDetails(id),
  });

  const {
    data: feed,
    isLoading: loadingFeed,
    isError: errorFeed,
  } = useQuery({
    queryKey: ['manga', 'feed', id, selectedLang],
    queryFn: () => fetchChapterFeed(id, { translatedLanguage: [selectedLang] }),
    enabled: !!manga,
  });

  const { data: fallbackFeed } = useQuery({
    queryKey: ['manga', 'fallback-chapters', manga?.title],
    queryFn: async () => {
      if (!manga?.title) return null;
      const res = await fetch(`/api/fallback/chapters?title=${encodeURIComponent(manga.title)}`);
      if (!res.ok) return null;
      return await res.json() as Array<{
        id: string;
        chapterNumber: string;
        title: string;
        volumeNumber: string;
        publishAt: string;
        pages: number;
      }>;
    },
    enabled: !!manga && selectedLang === 'en',
  });

  const availableLangs = useMemo(() => {
    const langs = manga?.availableTranslatedLanguages ? [...manga.availableTranslatedLanguages] : [];
    if (!langs.includes('en')) {
      langs.unshift('en');
    }
    return langs;
  }, [manga?.availableTranslatedLanguages]);

  useEffect(() => {
    if (manga) {
      if (availableLangs.length > 0 && !availableLangs.includes(selectedLang)) {
        if (availableLangs.includes('en')) {
          setSelectedLang('en');
        } else {
          const firstLang = availableLangs[0];
          if (firstLang) {
            setSelectedLang(firstLang);
          }
        }
      }
    }
  }, [manga, selectedLang, availableLangs]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!manga) return;
    const newStatus = e.target.value as LibraryStatus;
    if (newStatus === 'none') {
      updateStatus(manga.id, 'none');
    } else if (currentStatus === 'none') {
      addToLibrary(manga, newStatus);
    } else {
      updateStatus(manga.id, newStatus);
    }
  };

  const isBlockedBySfw =
    sfwMode &&
    manga &&
    (manga.contentRating === 'pornographic' || manga.contentRating === 'erotica');

  if (loadingManga) {
    return (
      <AppShell>
        <div className="space-y-8 font-mono">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="md:col-span-3 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (errorManga || !manga) {
    return (
      <AppShell>
        <div className="p-8 border border-accent bg-accent/5 font-mono text-center">
          <p className="text-text-primary mb-2 uppercase font-bold">Failed to load manga</p>
          <p className="text-text-muted text-xs mb-4">
            Manga details could not be retrieved. Please check your connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetchManga()} className="mx-auto">
            Retry
          </Button>
        </div>
      </AppShell>
    );
  }

  if (isBlockedBySfw) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-12 border border-accent p-8 font-mono text-center space-y-6">
          <div className="text-accent text-2xl font-bold uppercase tracking-wider">
            [ CONTENT WARNING ]
          </div>
          <p className="text-xs uppercase font-bold text-text-primary">
            Title Restricted by Safe Mode
          </p>
          <p className="text-xs text-text-muted font-sans leading-relaxed">
            This title is classified as over 18+ ({manga.contentRating}) by MangaDex and is hidden because Safe Mode is enabled on your device.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => updateSettings({ sfwMode: false })} className="w-full">
              Disable Safe Mode
            </Button>
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const rawChapters = feed?.items || [];
  const chapters = [...rawChapters];

  if (selectedLang === 'en' && fallbackFeed && fallbackFeed.length > 0) {
    const mergedChapters: typeof rawChapters = [];
    const weebCentralNums = new Set(fallbackFeed.map((ch) => parseFloat(ch.chapterNumber).toString()));

    rawChapters.forEach((ch) => {
      const chNum = parseFloat(ch.chapterNumber).toString();
      if (!weebCentralNums.has(chNum)) {
        mergedChapters.push(ch);
      }
    });

    fallbackFeed.forEach((fbCh) => {
      mergedChapters.push({
        id: fbCh.id,
        chapterNumber: fbCh.chapterNumber,
        volumeNumber: fbCh.volumeNumber || '',
        title: fbCh.title || '',
        scanlationGroup: 'Weeb Central (Fallback)',
        scanlationGroupId: 'weeb-central',
        publishAt: fbCh.publishAt || new Date().toISOString(),
        pages: fbCh.pages || 0,
        readableOnKagami: true,
        externalUrl: null,
      } as any);
    });

    chapters.length = 0;
    chapters.push(...mergedChapters);
  }

  const availableChapterNumbers = new Set(
    chapters.map((ch) => parseFloat(ch.chapterNumber).toString())
  );
  const latestChapterNum = manga.latestUploadedChapter ? parseFloat(manga.latestUploadedChapter) : 0;
  const sortedNums = chapters
    .map((ch) => parseFloat(ch.chapterNumber))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const missingChapters: number[] = [];
  if (sortedNums.length > 0) {
    const minVal = sortedNums[0] ?? 1;
    const maxVal = sortedNums[sortedNums.length - 1] ?? 1;
    const minNum = Math.max(1, minVal);
    const maxNum = Math.max(maxVal, latestChapterNum);

    for (let i = Math.ceil(minNum); i <= Math.floor(maxNum); i++) {
      if (!availableChapterNumbers.has(i.toString())) {
        missingChapters.push(i);
        if (missingChapters.length >= 50) break;
      }
    }
  } else if (latestChapterNum > 0) {
    for (let i = 1; i <= latestChapterNum; i++) {
      missingChapters.push(i);
      if (missingChapters.length >= 50) break;
    }
  }

  missingChapters.forEach((chNum) => {
    chapters.push({
      id: `missing-${chNum}`,
      chapterNumber: chNum.toString(),
      volumeNumber: '',
      title: 'Not available on Kagami',
      scanlationGroup: 'Unavailable (Click Search)',
      scanlationGroupId: 'missing',
      publishAt: new Date().toISOString(),
      pages: 0,
      readableOnKagami: false,
      externalUrl: `https://duckduckgo.com/?q=${encodeURIComponent(
        `${manga.title} Chapter ${chNum} read online`
      )}`,
    } as any);
  });
  
  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseFloat(a.chapterNumber) || 0;
    const numB = parseFloat(b.chapterNumber) || 0;
    return sortDesc ? numB - numA : numA - numB;
  });

  const groupedVolumes: Record<string, typeof sortedChapters> = {};
  sortedChapters.forEach((ch) => {
    const vol = ch.volumeNumber ? `Volume ${ch.volumeNumber}` : 'No Volume';
    if (!groupedVolumes[vol]) {
      groupedVolumes[vol] = [];
    }
    groupedVolumes[vol].push(ch);
  });

  const mangaHistory = history[manga.id] || [];
  const lastReadChapterId = mangaHistory[0]?.chapterId || null;

  const toggleVolume = (vol: string) => {
    const firstVol = Object.keys(groupedVolumes)[0];
    const currentActive = expandedVolume === null ? firstVol : expandedVolume;
    const nextActive = currentActive === vol ? '' : vol;
    
    setTransitioningVolume(vol);
    setExpandedVolume(nextActive);
    setTimeout(() => setTransitioningVolume(null), 600);
  };

  return (
    <AppShell>
      <div className="space-y-8 font-mono">
        <Link href="/search" className="inline-flex items-center text-xs text-text-muted hover:text-text-primary uppercase gap-1.5 focus:outline-none">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="space-y-4">
            <div className="aspect-[3/4] w-full bg-surface-solid border border-border-divider overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.01] hover:border-accent">
              {manga.cover ? (
                <ViewTransition name={`cover-${manga.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={manga.cover} 
                    alt={manga.title} 
                    className="object-cover w-full h-full" 
                  />
                </ViewTransition>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[10px] font-bold uppercase tracking-widest bg-surface">
                  NO COVER ART
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-text-muted uppercase font-bold">Library Shelf</span>
              <div className="relative">
                <select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  className="w-full h-10 border border-border-divider bg-surface px-3 text-xs font-mono uppercase text-text-primary focus:outline-none focus:border-accent appearance-none rounded-xl"
                >
                  <option value="none">Not in Library</option>
                  <option value="reading">Currently Reading</option>
                  <option value="planning">Plan to Read</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {currentStatus !== 'none' && (
              <Button
                variant={isFavorite ? 'primary' : 'outline'}
                onClick={() => toggleFavorite(manga.id)}
                className="w-full h-10 flex items-center justify-center gap-2"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'In Favorites' : 'Add to Favorites'}
              </Button>
            )}
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {manga.source === 'supplemental' ? (
                  <Badge variant="destructive" className="rounded-full px-3 text-[9px] uppercase tracking-wider font-bold">External Catalog</Badge>
                ) : (
                  <Badge variant="accent" className="rounded-full px-3 text-[9px] uppercase tracking-wider font-bold">MangaDex Source</Badge>
                )}
                <Badge variant="source" className="rounded-full px-3 text-[9px] uppercase tracking-wider font-bold">{manga.status}</Badge>
                <Badge variant="rating" className="rounded-full px-3 text-[9px] uppercase tracking-wider font-bold">{manga.contentRating}</Badge>
              </div>
              {(() => {
                const englishAlt = manga.alternativeTitles['en'] || manga.alternativeTitles['en-us'] || manga.alternativeTitles['en-gb'] || null;
                const otherAltKey = Object.keys(manga.alternativeTitles).find(
                  (key) => key !== 'en' && key !== 'en-us' && key !== 'en-gb' && manga.alternativeTitles[key] !== manga.title
                );
                const otherAlt = otherAltKey ? manga.alternativeTitles[otherAltKey] : null;

                return (
                  <>
                    <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight text-text-primary leading-tight">{manga.title}</h1>
                    {englishAlt && englishAlt.toLowerCase() !== manga.title.toLowerCase() && (
                      <p className="text-sm md:text-base font-sans font-semibold text-accent/90 tracking-wide mt-1">
                        {englishAlt}
                      </p>
                    )}
                    {otherAlt && otherAlt.toLowerCase() !== manga.title.toLowerCase() && otherAlt.toLowerCase() !== (englishAlt || '').toLowerCase() && (
                      <p className="text-xs md:text-sm text-text-muted font-serif italic mt-0.5">
                        {otherAlt}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs py-5 border-y border-border-divider/50">
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block mb-1">Author</span>
                <span className="font-bold text-text-primary">{manga.authors.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block mb-1">Artist</span>
                <span className="font-bold text-text-primary">{manga.artists.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block mb-1">Language</span>
                <span className="font-bold text-text-primary uppercase">{manga.originalLanguage}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block mb-1">Year</span>
                <span className="font-bold text-text-primary">{manga.year || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Synopsis</span>
              <p className={`text-[13px] font-sans leading-relaxed text-text-primary whitespace-pre-line font-normal text-justify ${
                !showFullSynopsis ? 'line-clamp-2' : ''
              }`}>
                {manga.description || 'No description available for this title.'}
              </p>
              {manga.description && manga.description.length > 250 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-[9px] font-bold font-mono uppercase tracking-widest text-accent hover:text-accent/80 transition-colors pt-1 cursor-pointer"
                >
                  {showFullSynopsis ? 'Show Less ↑' : 'Read Full Synopsis ↓'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {manga.tags.map((tag) => (
                <Badge key={tag} variant="source" className="text-[9px]">
                  {tag}
                </Badge>
              ))}
            </div>

            {libraryItem && (
              <div className="border border-border-divider/70 bg-surface/30 p-5 rounded-2xl font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-border-divider/50 pb-2">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider">YOUR READING DIARY</span>
                  <span className="text-[8px] text-text-muted">Stored locally on your browser</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted uppercase block">Your Rating</label>
                    <select
                      value={userRating}
                      onChange={(e) => handleUpdateRating(parseInt(e.target.value))}
                      className="h-9 w-full border border-border-divider bg-surface px-3 rounded-xl text-[10px] uppercase text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="0">Unrated</option>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} ★ {i + 1 === 10 ? '(Masterpiece)' : i + 1 === 1 ? '(Appalling)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted uppercase block">Reading Notes / Review</label>
                    <textarea
                      value={notesText}
                      onChange={(e) => handleUpdateNotes(e.target.value)}
                      placeholder="Write your review or reading log here..."
                      className="w-full h-16 border border-border-divider bg-surface p-2.5 rounded-xl text-[10px] font-sans text-text-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Link Copied' : 'Copy Share Link'}
              </Button>

              {manga.externalSources.map((src) => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open on {src.name}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border-divider pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Available Chapters
            </h2>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted uppercase">Lang</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="h-8 border border-border-divider bg-surface px-2 text-[10px] font-mono uppercase text-text-primary focus:outline-none"
                >
                  {availableLangs.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_NAMES[lang] || `${lang.toUpperCase()} (${lang.toUpperCase()})`}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 flex items-center gap-1.5"
                onClick={() => setSortDesc(!sortDesc)}
              >
                <ListFilter className="w-3.5 h-3.5" />
                {sortDesc ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
          </div>

          {loadingFeed ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : errorFeed ? (
            <div className="p-6 border border-border-divider text-center text-xs text-text-muted">
              Failed to load chapter feed from MangaDex.
            </div>
          ) : chapters.length === 0 ? (
            <div className="p-8 border border-border-divider text-center text-xs text-text-muted bg-surface font-sans">
              No chapters in the selected language are currently available for this title.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedVolumes).map((vol) => {
                const volChapters = groupedVolumes[vol] || [];
                const firstVol = Object.keys(groupedVolumes)[0];
                const activeVol = expandedVolume === null ? firstVol : expandedVolume;
                const isExpanded = activeVol === vol;
                const isTransitioning = transitioningVolume === vol;

                return (
                  <div key={vol} className="border border-border-divider/60 rounded-2xl overflow-hidden bg-surface/30">
                    <button
                      onClick={() => toggleVolume(vol)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-mono font-bold uppercase hover:bg-surface/50 transition-colors select-none text-[10px] tracking-wider border-b border-border-divider/40"
                    >
                      <span>{vol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-text-muted font-normal">({volChapters.length} Chapters)</span>
                        <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")} />
                      </div>
                    </button>

                    <div 
                      className={cn(
                        "transition-all duration-500 ease-in-out overflow-hidden",
                        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                      )}
                      style={{ willChange: 'max-height, opacity' }}
                    >
                      <motion.div
                        variants={listContainerVariants}
                        initial="hidden"
                        animate={isExpanded ? "show" : "hidden"}
                        className="p-4 space-y-2.5 font-mono text-[10px] uppercase text-text-primary"
                      >
                        {volChapters.map((ch) => {
                          const isRead = history[manga.id]?.some((h) => h.chapterId === ch.id) || false;
                          const isDownloaded = isChapterDownloaded(ch.id);
                          const isLastRead = lastReadChapterId === ch.id;

                          return (
                            <motion.div
                              key={ch.id}
                              variants={listItemVariants}
                              className={cn(
                                "flex items-center justify-between border border-border-divider/50 p-3 rounded-xl transition-all duration-300",
                                isRead ? "bg-surface/40 border-border-divider/20 opacity-75" : "bg-surface/80",
                                isLastRead && "border-accent/40 bg-accent/5 ring-1 ring-accent/10"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={cn(
                                  "w-2.5 h-2.5 rounded-full shrink-0",
                                  isLastRead ? "bg-accent animate-pulse" : isRead ? "bg-border-divider" : "bg-green-600"
                                )} />
                                <span className="font-bold tracking-wider shrink-0">Ch {ch.chapterNumber}</span>
                                <span className="text-text-muted truncate normal-case font-medium ml-1">
                                  {ch.title || 'Untitled Chapter'}
                                </span>
                                {isLastRead && (
                                  <Badge variant="accent" className="rounded-full px-2 text-[7px] font-bold shrink-0 tracking-wider">Last Read</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                <span className="text-[8px] text-text-muted hidden md:inline max-w-[120px] truncate mr-2">
                                  {ch.scanlationGroup || 'Independent'}
                                </span>

                                {ch.readableOnKagami ? (
                                  <>
                                    {isDownloaded ? (
                                      <Badge variant="source" className="rounded-full px-2 text-[8px] font-bold tracking-wider text-green-600 border-green-600/30 bg-green-950/10">Offline</Badge>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={downloadingChapterId === ch.id}
                                        onClick={() => handleDownloadChapter(ch)}
                                        className="h-7 w-7 p-0 rounded-lg hover:border-accent hover:text-accent shrink-0"
                                        title="Download Chapter"
                                      >
                                        {downloadingChapterId === ch.id ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Download className="w-3.5 h-3.5" />
                                        )}
                                      </Button>
                                    )}

                                    <Link href={`/read/${ch.id}`} passHref legacyBehavior>
                                      <Button variant="primary" size="sm" className="h-7 px-4 text-[9px] font-bold tracking-widest uppercase rounded-lg">
                                        Read
                                      </Button>
                                    </Link>
                                  </>
                                ) : (
                                  <a href={ch.externalUrl || ''} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="h-7 px-4 text-[9px] font-bold tracking-widest uppercase rounded-lg flex items-center gap-1">
                                      Search <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
