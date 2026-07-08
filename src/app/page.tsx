'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { MangaCard } from '@/components/manga/MangaCard';
import { MangaCardSkeleton } from '@/components/manga/MangaCardSkeleton';
import { fetchMangaList } from '@/services/mangadex/mangaCatalogService';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { Sparkles, Flame, Clock, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewportContain } from '@/components/ui/ViewportContain';
import { pageVariants, staggerContainer, scaleInItem, fadeUpItem } from '@/utils/animations';
import { EuclideanWaveContainer, EuclideanWaveItem } from '@/components/ui/EuclideanWave';
import { ZeroGFloating, KineticTypography, ProximityDistortion } from '@/components/ui/KineticCore';

export default function Home() {
  const sfwMode = useSettingsStore((state) => state.settings.sfwMode);
  const { items } = useLibraryStore();

  const {
    data: trending,
    isLoading: loadingTrending,
    isError: errorTrending,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ['manga', 'trending', sfwMode],
    queryFn: () =>
      fetchMangaList({
        limit: 50,
        order: { followedCount: 'desc' },
        contentRating: sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'],
      }),
  });

  const {
    data: latest,
    isLoading: loadingLatest,
    isError: errorLatest,
    refetch: refetchLatest,
  } = useQuery({
    queryKey: ['manga', 'latest', sfwMode],
    queryFn: () =>
      fetchMangaList({
        limit: 10,
        order: { latestUploadedChapter: 'desc' },
        contentRating: sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'],
      }),
  });

  const {
    data: recent,
    isLoading: loadingRecent,
    isError: errorRecent,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['manga', 'recent', sfwMode],
    queryFn: () =>
      fetchMangaList({
        limit: 10,
        order: { createdAt: 'desc' },
        contentRating: sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'],
      }),
  });

  const spotlightItems = useMemo(() => {
    return trending?.items || [];
  }, [trending?.items]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [spotlightImageLoaded, setSpotlightImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (spotlightItems.length === 0) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % spotlightItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [spotlightItems]);

  const spotlightManga = spotlightItems[activeIdx] || null;

  const handleRetryAll = () => {
    refetchTrending();
    refetchLatest();
    refetchRecent();
  };

  const isAnyError = errorTrending || errorLatest || errorRecent;

  return (
    <AppShell>
      <EuclideanWaveContainer>
        <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="space-y-16 pb-20 select-none"
      >
        <h1 className="sr-only">Dashboard</h1>

        <div className="relative overflow-hidden w-full min-h-[135px] md:h-[440px] rounded-3xl border border-border-divider bg-surface">
          <AnimatePresence mode="wait">
            {spotlightManga ? (
              <motion.div 
                key={spotlightManga.id} 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="w-full h-full px-4 sm:px-8 md:px-14 py-4 sm:py-8 flex items-center relative overflow-hidden"
              >
                {spotlightManga.cover && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 md:opacity-40 pointer-events-none transition-all duration-500 scale-100"
                      style={{ 
                        backgroundImage: `url(${spotlightManga.cover})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-app via-bg-app/80 to-bg-app/20 z-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-app via-bg-app/40 to-transparent z-0" />
                  </>
                )}

                <div className="relative z-10 flex flex-col justify-center gap-3 text-left w-full max-w-2xl min-w-0 overflow-hidden">
                  <h2 className="text-sm sm:text-2xl md:text-5xl font-extrabold tracking-tighter text-text-primary font-serif leading-tight line-clamp-1 md:line-clamp-2">
                    {spotlightManga.title}
                  </h2>
                  <div className="flex flex-row items-center gap-2 shrink-0">
                    <Link href={`/manga/${spotlightManga.id}`} className="bg-text-primary text-bg-app hover:bg-text-primary/90 transition-colors font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full cursor-pointer select-none whitespace-nowrap block text-center w-auto">
                      Read Now
                    </Link>
                    <Link href="/search" className="border border-border-divider text-text-primary hover:bg-bg-app transition-colors font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full cursor-pointer select-none whitespace-nowrap block text-center w-auto">
                      Explore Catalog
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[135px] md:h-[440px] bg-surface flex items-center justify-center font-sans text-xs text-text-muted">
                Curating spotlight showcase...
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 font-sans">
          <EuclideanWaveItem 
            id="bento-pinned"
            className="md:col-span-4 bg-surface border border-border-divider rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[180px] relative overflow-hidden group"
            whileHover={{ y: -4, borderColor: 'var(--accent-base)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            <ZeroGFloating className="flex flex-col justify-between h-full w-full">
              <ProximityDistortion className="flex flex-col justify-between h-full w-full rounded-3xl">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-[8px] sm:text-[9px] text-accent font-black uppercase tracking-wider">My Library Shelf</div>
                    <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-text-primary">Pinned Collection</h2>
                  </div>
                  <div>
                    <Link href="/library" className="inline-block bg-text-primary text-bg-app hover:bg-text-primary/90 transition-colors font-sans font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full select-none">
                      Open Library
                    </Link>
                  </div>
                </div>
                
                <div className="my-3">
                  {Object.keys(items).length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                      {Object.values(items).slice(0, 5).map(({ manga }) => (
                        <Link key={manga.id} href={`/manga/${manga.id}`} className="w-[54px] sm:w-[76px] shrink-0 snap-start group block">
                          <motion.div 
                            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border-divider"
                            whileHover={{ scale: 1.05 }}
                          >
                            {manga.cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-bg-app flex items-center justify-center text-[8px] text-text-muted font-bold uppercase">No Art</div>
                            )}
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">Your library shelf is empty. Pin manga titles from the catalog to see them here.</p>
                  )}
                </div>
              </ProximityDistortion>
            </ZeroGFloating>
          </EuclideanWaveItem>
        </div>

        {isAnyError && (
          <div className="p-8 border border-accent bg-accent/5 font-sans text-xs text-center rounded-2xl">
            <p className="text-text-primary mb-3 uppercase font-bold">Failed to load content from MangaDex</p>
            <p className="text-text-muted mb-4 max-w-md mx-auto leading-relaxed">
              This might be due to rate limiting or connection problems. Please check your internet connection.
            </p>
            <button onClick={handleRetryAll} className="border border-border-divider text-text-primary hover:bg-surface px-5 py-2 rounded-full cursor-pointer select-none font-bold uppercase tracking-wider text-[10px]">
              Retry Connection
            </button>
          </div>
        )}

        <ViewportContain placeholderHeight="320px">
          <section className="space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/60 pb-2">
              <h2 className="text-xs font-bold uppercase flex items-center gap-2 tracking-widest text-text-primary">
                <Flame className="w-4 h-4 text-accent animate-pulse shrink-0" />
                <KineticTypography text="Trending Titles" />
              </h2>
              <Link href="/search?sort=followedCount" className="text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x scroll-smooth">
              {loadingTrending ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <EuclideanWaveItem key={idx} id={`trending-skeleton-${idx}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCardSkeleton />
                  </EuclideanWaveItem>
                ))
              ) : (
                trending?.items.map((m) => (
                  <EuclideanWaveItem key={m.id} id={`trending-${m.id}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCard manga={m} namespace="trending" />
                  </EuclideanWaveItem>
                ))
              )}
            </div>
          </section>
        </ViewportContain>

        <ViewportContain placeholderHeight="320px">
          <section className="space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/60 pb-2">
              <h2 className="text-xs font-bold uppercase flex items-center gap-2 tracking-widest text-text-primary">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <KineticTypography text="Latest Updates" />
              </h2>
              <Link href="/search?sort=latestUploadedChapter" className="text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x scroll-smooth">
              {loadingLatest ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <EuclideanWaveItem key={idx} id={`latest-skeleton-${idx}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCardSkeleton />
                  </EuclideanWaveItem>
                ))
              ) : (
                latest?.items.map((m) => (
                  <EuclideanWaveItem key={m.id} id={`latest-${m.id}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCard manga={m} namespace="latest" />
                  </EuclideanWaveItem>
                ))
              )}
            </div>
          </section>
        </ViewportContain>

        <ViewportContain placeholderHeight="320px">
          <section className="space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/60 pb-2">
              <h2 className="text-xs font-bold uppercase flex items-center gap-2 tracking-widest text-text-primary">
                <Compass className="w-4 h-4 text-accent shrink-0" />
                <KineticTypography text="Recently Added" />
              </h2>
              <Link href="/search?sort=createdAt" className="text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x scroll-smooth">
              {loadingRecent ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <EuclideanWaveItem key={idx} id={`recent-skeleton-${idx}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCardSkeleton />
                  </EuclideanWaveItem>
                ))
              ) : (
                recent?.items.map((m) => (
                  <EuclideanWaveItem key={m.id} id={`recent-${m.id}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                    <MangaCard manga={m} namespace="recent" />
                  </EuclideanWaveItem>
                ))
              )}
            </div>
          </section>
        </ViewportContain>
      </motion.div>
      </EuclideanWaveContainer>
    </AppShell>
  );
}
