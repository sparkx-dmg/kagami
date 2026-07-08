'use client';

import React, { useState, useEffect, useRef, use, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchAtHomeServer, fetchMangaDetails } from '@/services/mangadex/mangaCatalogService';
import { mangadexFetch } from '@/services/mangadex/client';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import {
  ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, RefreshCw,
  ChevronLeft, ChevronRight, Settings2, X,
  AlignJustify, BookOpen, Columns2,
  ArrowLeftRight, MoveHorizontal, Scan, ScanLine,
  Zap, ZapOff, Monitor, GalleryHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReaderPage(props: { params: Promise<{ chapterId: string }> }) {
  const params = use(props.params);
  const chapterId = params.chapterId;

  const { settings, updateSettings } = useSettingsStore();
  const { markChapterRead, history } = useLibraryStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showOptions, setShowOptions] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const optionsPanelRef = useRef<HTMLDivElement>(null);
  const webtoonContainerRef = useRef<HTMLDivElement>(null);

  const isFallback = !chapterId.includes('-');

  useEffect(() => { setMounted(true); }, []);

  const {
    data: fallbackData,
    isLoading: loadingFallback,
    isError: errorFallback,
    refetch: refetchFallback,
  } = useQuery({
    queryKey: ['chapter', 'fallback-pages', chapterId],
    queryFn: async () => {
      const res = await fetch(`/api/fallback/pages?chapterId=${chapterId}`);
      if (!res.ok) throw new Error('Failed to fetch fallback pages');
      return await res.json() as {
        chapterNumber: string; title: string;
        mangaId: string; mangaTitle: string; pages: string[];
      };
    },
    enabled: isFallback,
  });

  const {
    data: chapter,
    isLoading: loadingChapter,
    isError: errorChapter,
  } = useQuery({
    queryKey: ['chapter', 'details', chapterId],
    queryFn: () => mangadexFetch<any>(`chapter/${chapterId}`),
    enabled: !isFallback,
  });

  const mangaId = isFallback
    ? (fallbackData?.mangaId || '')
    : (chapter?.relationships?.find((r: { type: string; id: string }) => r.type === 'manga')?.id || '');

  const { data: manga } = useQuery({
    queryKey: ['manga', 'details', mangaId],
    queryFn: () => fetchMangaDetails(mangaId),
    enabled: !isFallback && !!mangaId,
  });

  const {
    data: atHome,
    isLoading: loadingAtHome,
    isError: errorAtHome,
    refetch: refetchAtHome,
  } = useQuery({
    queryKey: ['chapter', 'at-home', chapterId],
    queryFn: () => fetchAtHomeServer(chapterId),
    enabled: !isFallback && !!chapter,
  });

  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    if (mangaId && history[mangaId] && !hasRestored) {
      const entry = history[mangaId]?.find((h) => h.chapterId === chapterId);
      if (entry) {
        setTimeout(() => { setCurrentPage(entry.pageIndex || 0); setHasRestored(true); }, 0);
      } else {
        setTimeout(() => setHasRestored(true), 0);
      }
    }
  }, [mangaId, chapterId, history, hasRestored]);

  const pagesFilenames = useMemo(() => {
    return settings.imageQuality === 'saver'
      ? atHome?.chapter?.dataSaver || []
      : atHome?.chapter?.data || [];
  }, [settings.imageQuality, atHome]);
  const hash = atHome?.chapter?.hash || '';
  const baseUrl = atHome?.baseUrl || '';

  const getPageUrl = useCallback((index: number) => {
    if (isFallback) return fallbackData?.pages[index] || '';
    if (!baseUrl || !hash || !pagesFilenames[index]) return '';
    const qualityFolder = settings.imageQuality === 'saver' ? 'data-saver' : 'data';
    return `${baseUrl}/${qualityFolder}/${hash}/${pagesFilenames[index]}`;
  }, [isFallback, fallbackData, baseUrl, hash, pagesFilenames, settings.imageQuality]);

  const totalPages = isFallback ? (fallbackData?.pages?.length || 0) : pagesFilenames.length;

  useEffect(() => {
    if (totalPages === 0 || settings.readerMode === 'webtoon') return;
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentPage + i;
      if (nextIndex < totalPages) {
        const url = getPageUrl(nextIndex);
        if (url) { const img = new Image(); img.src = url; }
      }
    }
  }, [currentPage, totalPages, getPageUrl, settings.readerMode]);

  useEffect(() => {
    if (!mangaId || totalPages === 0) return;
    if (!isFallback && !chapter) return;
    if (isFallback && !fallbackData) return;
    const chNum = isFallback ? (fallbackData?.chapterNumber || '0') : (chapter?.attributes?.chapter || '0');
    markChapterRead(mangaId, chapterId, chNum, currentPage);
  }, [currentPage, totalPages, mangaId, chapterId, chapter, fallbackData, isFallback, markChapterRead]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!showOptions) return;
    const handler = (e: MouseEvent) => {
      if (optionsPanelRef.current && !optionsPanelRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOptions]);

  const scrollToPage = useCallback((index: number) => {
    const el = document.querySelector(`[data-page-index="${index}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
      if (settings.readerMode === 'webtoon') {
        scrollToPage(currentPage + 1);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentPage, totalPages, settings.readerMode, scrollToPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      if (settings.readerMode === 'webtoon') {
        scrollToPage(currentPage - 1);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentPage, settings.readerMode, scrollToPage]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isRtl = settings.readingDirection === 'rtl';
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); isRtl ? handlePrevPage() : handleNextPage(); }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); isRtl ? handleNextPage() : handlePrevPage(); }
      else if (e.key === ' ') { e.preventDefault(); handleNextPage(); }
      else if (e.key === 'f') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 't') { e.preventDefault(); toggleControls(); }
      else if (e.key === 'Escape') setShowOptions(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.readingDirection, handleNextPage, handlePrevPage, toggleFullscreen, toggleControls]);

  // Native device scrolling track utilized in Webtoon mode with GPU compositing (no Janky scroll-scaling loop)

  useEffect(() => {
    if (settings.readerMode !== 'webtoon' || totalPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxStr = entry.target.getAttribute('data-page-index');
            if (idxStr !== null) {
              setCurrentPage(parseInt(idxStr));
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-35% 0px -60% 0px',
        threshold: 0,
      }
    );

    const els = document.querySelectorAll<HTMLElement>('[data-page-index]');
    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [settings.readerMode, totalPages]);

  const handleImageError = (index: number) => setImageErrors((prev) => ({ ...prev, [index]: true }));
  const handleRetryImage = (index: number) => { setImageErrors((prev) => ({ ...prev, [index]: false })); refetchAtHome(); };

  const handleScrubberChange = (index: number) => {
    setCurrentPage(index);
    if (settings.readerMode === 'webtoon') {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-page-index="${index}"]`);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  };

  const pageFitClass = (() => {
    switch (settings.pageFit) {
      case 'width': return 'w-full h-auto object-contain';
      case 'natural': return 'max-w-full h-auto object-contain';
      default: return 'max-h-[85vh] w-auto object-contain';
    }
  })();

  const isLoading = isFallback ? loadingFallback : (loadingChapter || loadingAtHome);
  const isError = isFallback ? errorFallback : (errorChapter || errorAtHome);
  const isRtl = settings.readingDirection === 'rtl';

  const mangaTitle = isFallback ? (fallbackData?.mangaTitle || 'Back') : (manga?.title || 'Back');
  const chapterNum = isFallback ? (fallbackData?.chapterNumber || '0') : (chapter?.attributes?.chapter || '0');

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-bg-app flex flex-col items-center justify-center gap-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-[80vh] w-full max-w-3xl" />
      </div>
    );
  }

  if (isError || totalPages === 0) {
    return (
      <div className="min-h-[100dvh] bg-bg-app flex items-center justify-center font-mono">
        <div className="max-w-md border border-accent p-8 text-center space-y-4">
          <div className="text-accent text-lg font-bold uppercase">Reader Load Error</div>
          <p className="text-xs text-text-muted">Failed to fetch chapter page URLs. The image server may be offline.</p>
          <Button variant="outline" size="sm" onClick={() => isFallback ? refetchFallback() : refetchAtHome()} className="mx-auto flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
          <Link href={mangaId ? `/manga/${mangaId}` : '/search'} className="block text-xs text-text-muted hover:text-accent underline">
            ← Back to manga
          </Link>
        </div>
      </div>
    );
  }

  const OptionsDrawer = mounted ? createPortal(
    <>
      {showOptions && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowOptions(false)}
        />
      )}

      <div
        ref={optionsPanelRef}
        className={`fixed top-0 right-0 h-[100dvh] z-[100] w-[300px] max-w-[92vw] bg-bg-app border-l border-border-divider shadow-2xl flex flex-col transition-transform duration-300 ease-out ${showOptions ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }}
        aria-hidden={!showOptions}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-divider bg-surface/70 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-accent" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Reader Options</span>
          </div>
          <button
            onClick={() => setShowOptions(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface border border-transparent hover:border-border-divider/50 transition-all cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-[10px] uppercase text-text-primary scrollbar-none">
          <section className="space-y-3">
            <p className="text-[9px] text-text-muted font-bold tracking-widest">Reading Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'webtoon', label: 'Webtoon', icon: AlignJustify },
                { value: 'single', label: 'Single Page', icon: BookOpen },
              ].map((mode) => {
                const Icon = mode.icon;
                const active = settings.readerMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    onClick={() => updateSettings({ readerMode: mode.value as any })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 border rounded-xl gap-2 transition-all cursor-pointer select-none",
                      active ? "border-accent bg-accent/5 font-black text-text-primary" : "border-border-divider/50 hover:border-border-divider text-text-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] text-text-muted font-bold tracking-widest">Reading Direction</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'rtl', label: 'Right-to-Left (RTL)', icon: ArrowLeftRight },
                { value: 'ltr', label: 'Left-to-Right (LTR)', icon: MoveHorizontal },
              ].map((dir) => {
                const Icon = dir.icon;
                const active = settings.readingDirection === dir.value;
                return (
                  <button
                    key={dir.value}
                    onClick={() => updateSettings({ readingDirection: dir.value as any })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 border rounded-xl gap-2 transition-all cursor-pointer select-none",
                      active ? "border-accent bg-accent/5 font-black text-text-primary" : "border-border-divider/50 hover:border-border-divider text-text-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{dir.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] text-text-muted font-bold tracking-widest">Scale & Fit (Page Fit)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'height', label: 'Fit Height', icon: Scan },
                { value: 'width', label: 'Fit Width', icon: ScanLine },
                { value: 'natural', label: 'Natural', icon: Monitor },
              ].map((fit) => {
                const Icon = fit.icon;
                const active = settings.pageFit === fit.value;
                return (
                  <button
                    key={fit.value}
                    onClick={() => updateSettings({ pageFit: fit.value as any })}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 border rounded-xl gap-1.5 transition-all text-[8px] cursor-pointer select-none",
                      active ? "border-accent bg-accent/5 font-black text-text-primary" : "border-border-divider/50 hover:border-border-divider text-text-muted"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{fit.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] text-text-muted font-bold tracking-widest">Image Quality</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'saver', label: 'Data Saver', icon: Zap },
                { value: 'native', label: 'Original', icon: ZapOff },
              ].map((q) => {
                const Icon = q.icon;
                const active = settings.imageQuality === q.value;
                return (
                  <button
                    key={q.value}
                    onClick={() => updateSettings({ imageQuality: q.value as any })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 border rounded-xl gap-2 transition-all cursor-pointer select-none",
                      active ? "border-accent bg-accent/5 font-black text-text-primary" : "border-border-divider/50 hover:border-border-divider text-text-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{q.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest font-mono">Keyboard Shortcuts</p>
            <div className="bg-surface/40 border border-border-divider/30 rounded-xl p-3 space-y-2 font-mono text-[9px] text-text-muted">
              {[
                ['← / A', 'Previous page'],
                ['→ / D', 'Next page'],
                ['Space', 'Next page'],
                ['F', 'Toggle fullscreen'],
                ['T', 'Toggle UI controls'],
                ['Esc', 'Close this panel'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <kbd className="bg-border-divider/60 px-1.5 py-0.5 rounded text-[8px] text-text-primary">{key}</kbd>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex-shrink-0 px-5 py-3 border-t border-border-divider/50 bg-surface/40">
          <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-mono">
            <Zap className="w-3 h-3 text-accent" />
            Settings are saved automatically
          </div>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div
      className="min-h-[100dvh] bg-bg-app text-text-primary flex flex-col"
      style={{ fontFamily: 'var(--font-mono, monospace)' }}
    >
      <div
        ref={containerRef}
        className={`relative flex-1 w-full flex flex-col items-center ${isFullscreen ? 'bg-black min-h-[100dvh]' : ''}`}
      >
        <div
          className={`w-full flex items-center justify-between border-b border-border-divider/60 bg-bg-app/95 backdrop-blur-sm px-4 py-3 font-mono text-xs z-30 sticky top-0 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={mangaId ? `/manga/${mangaId}` : '/search'}
              className="hover:text-accent flex items-center gap-1.5 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="max-w-[140px] truncate uppercase hidden sm:inline text-[10px] font-bold tracking-wider">
                {mangaTitle}
              </span>
            </Link>
            <Badge variant="source" className="flex-shrink-0">Ch {chapterNum}</Badge>
          </div>

          <span className="font-bold text-[11px] tracking-wider">
            PAGE {currentPage + 1} / {totalPages}
          </span>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={showOptions ? 'primary' : 'outline'}
              size="sm"
              className="h-8 px-2.5 flex items-center gap-1.5 text-[10px] uppercase"
              onClick={(e) => { e.stopPropagation(); setShowOptions((v) => !v); }}
              aria-label="Reader Options"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Options</span>
            </Button>

            <Button
              variant="outline" size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              aria-label="Fullscreen"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div
          className="w-full flex-1 flex items-center justify-center py-4 min-h-[70vh] relative select-none cursor-pointer"
          onClick={toggleControls}
        >
          {settings.readerMode === 'webtoon' ? (
            <div
              ref={webtoonContainerRef}
              className="max-w-3xl w-full flex flex-col items-center space-y-3 px-4 py-6"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {Array.from({ length: totalPages }).map((_, index) => {
                const url = getPageUrl(index);
                return (
                  <div
                    key={index}
                    data-page-index={index}
                    className="w-full bg-surface-solid overflow-hidden"
                  >
                    {imageErrors[index] ? (
                      <div className="p-8 text-center text-xs text-text-muted bg-surface">
                        <p className="font-bold text-text-primary mb-2 uppercase">Image Failed</p>
                        <button onClick={() => handleRetryImage(index)} className="text-accent underline uppercase text-[10px]">Retry</button>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`Page ${index + 1}`}
                        onError={() => handleImageError(index)}
                        className="w-full h-auto object-contain"
                        loading={index < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); isRtl ? handleNextPage() : handlePrevPage(); }}
                className="absolute left-0 top-0 bottom-0 w-1/5 z-10 cursor-pointer focus:outline-none"
                aria-label="Previous Page"
              />

              <div className="max-w-3xl w-full flex flex-col items-center px-4">
                {imageErrors[currentPage] ? (
                  <div className="border border-accent/40 rounded-xl p-8 bg-accent/5 text-center font-mono text-xs max-w-sm mx-auto">
                    <p className="font-bold text-text-primary mb-2 uppercase">Image Failed to Load</p>
                    <p className="text-text-muted mb-4 font-sans text-[11px] leading-relaxed">
                      Page {currentPage + 1} could not be delivered. Try retrying.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => handleRetryImage(currentPage)}>Retry Page</Button>
                  </div>
                ) : (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPage}
                        src={getPageUrl(currentPage)}
                        alt={`Page ${currentPage + 1}`}
                        onError={() => handleImageError(currentPage)}
                        initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRtl ? 16 : -16 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
                        className={`${pageFitClass} rounded-lg border border-border-divider/40 bg-surface-solid shadow-2xl shadow-black/20`}
                        decoding="async"
                        style={{ willChange: 'transform' }}
                      />
                    </AnimatePresence>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); isRtl ? handlePrevPage() : handleNextPage(); }}
                className="absolute right-0 top-0 bottom-0 w-1/5 z-10 cursor-pointer focus:outline-none"
                aria-label="Next Page"
              />
            </>
          )}
        </div>

        <div
          className={`w-full border-t border-border-divider/50 bg-bg-app/90 backdrop-blur-md px-5 py-4 font-mono text-xs flex flex-col gap-3 z-30 sticky bottom-0 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted w-4 text-center">1</span>
            <input
              type="range"
              min="0"
              max={totalPages - 1}
              value={currentPage}
              onChange={(e) => handleScrubberChange(parseInt(e.target.value))}
              className="flex-1 h-1 bg-border-divider appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[10px] text-text-muted w-6 text-center">{totalPages}</span>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={handlePrevPage} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-[9px] text-text-muted uppercase hidden sm:block">
              {settings.readerMode === 'webtoon' ? 'Scroll to browse · Tap to toggle UI' : 'Arrows · F Fullscreen · Tap to toggle UI'}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages - 1} onClick={handleNextPage} className="flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {OptionsDrawer}
    </div>
  );
}
