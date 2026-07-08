'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { MangaCard } from '@/components/manga/MangaCard';
import { MangaCardSkeleton } from '@/components/manga/MangaCardSkeleton';
import { fetchMangaList } from '@/services/mangadex/mangaCatalogService';
import { KagamiManga } from '@/types/manga';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { Sparkles, Flame, Clock, Compass, ArrowRight, Star, Sword, Heart, Theater } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewportContain } from '@/components/ui/ViewportContain';
import { pageVariants } from '@/utils/animations';
import { EuclideanWaveContainer, EuclideanWaveItem } from '@/components/ui/EuclideanWave';
import { KineticTypography } from '@/components/ui/KineticCore';

// ─── MangaRow: defined outside Home so React never remounts it ───────────────
function MangaRow({
  id, icon, label, href, loading, isError, items, namespace,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  loading: boolean;
  isError: boolean;
  items?: KagamiManga[];
  namespace: string;
}) {
  // Silently hide sections that errored — no crash, no banner
  if (isError && !loading && !items?.length) return null;
  return (
    <ViewportContain placeholderHeight="320px">
      <section className="space-y-3 font-sans">
        <div className="flex items-center justify-between border-b border-border-divider/40 pb-2">
          <h2 className="text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 tracking-widest text-text-primary">
            {icon}
            <KineticTypography text={label} />
          </h2>
          <Link
            href={href}
            className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-2 md:gap-6 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <EuclideanWaveItem key={idx} id={`${id}-skeleton-${idx}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                  <MangaCardSkeleton />
                </EuclideanWaveItem>
              ))
            : items?.map((m) => (
                <EuclideanWaveItem key={m.id} id={`${id}-${m.id}`} className="w-[90px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                  <MangaCard manga={m} namespace={namespace} />
                </EuclideanWaveItem>
              ))}
        </div>
      </section>
    </ViewportContain>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

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
        limit: 20,
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

  // Wave gates: only start category fetches after at least ONE primary query succeeds.
  // Using !! data checks (not just !loading) prevents waves firing on error-state.
  const primaryHasData = !!(trending?.items.length || latest?.items.length || recent?.items.length);
  const [wave2Ready, setWave2Ready] = useState(false);
  const [wave3Ready, setWave3Ready] = useState(false);

  useEffect(() => {
    if (!primaryHasData) return;
    const t = setTimeout(() => setWave2Ready(true), 400);
    return () => clearTimeout(t);
  }, [primaryHasData]);

  useEffect(() => {
    if (!wave2Ready) return;
    const t = setTimeout(() => setWave3Ready(true), 800);
    return () => clearTimeout(t);
  }, [wave2Ready]);

  // MangaDex stable tag UUIDs
  const TAG_ACTION  = '391b0423-d847-456f-aff0-8f0cec6cf629';
  const TAG_ROMANCE = '423e2eae-a7a2-4a8b-ac03-a8351462d71d';
  const TAG_DRAMA   = 'b9af3a63-f058-46de-a9a0-e0c13906197a';
  const TAG_COMEDY  = '4d32cc48-9f00-4cbe-9bc4-9d4daae0b6e8';
  const TAG_FANTASY = 'cdc58593-87dd-415e-bbc0-2ec27bf404cc';
  const TAG_SCIFI   = '256c8bd9-4904-4360-bf4f-508a76d67183';
  const contentRating = sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'];

  // Wave 2 — fires 400ms after at least one primary succeeds
  const { data: topRated, isLoading: loadingTopRated, isError: errorTopRated } = useQuery({
    queryKey: ['manga', 'topRated', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, order: { rating: 'desc' }, contentRating }),
    enabled: wave2Ready,
  });

  const { data: action, isLoading: loadingAction, isError: errorAction } = useQuery({
    queryKey: ['manga', 'action', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_ACTION], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave2Ready,
  });

  const { data: romance, isLoading: loadingRomance, isError: errorRomance } = useQuery({
    queryKey: ['manga', 'romance', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_ROMANCE], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave2Ready,
  });

  // Wave 3 — fires 1.2s after at least one primary succeeds
  const { data: drama, isLoading: loadingDrama, isError: errorDrama } = useQuery({
    queryKey: ['manga', 'drama', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_DRAMA], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave3Ready,
  });

  const { data: comedy, isLoading: loadingComedy, isError: errorComedy } = useQuery({
    queryKey: ['manga', 'comedy', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_COMEDY], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave3Ready,
  });

  const { data: fantasy, isLoading: loadingFantasy, isError: errorFantasy } = useQuery({
    queryKey: ['manga', 'fantasy', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_FANTASY], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave3Ready,
  });

  const { data: scifi, isLoading: loadingScifi, isError: errorScifi } = useQuery({
    queryKey: ['manga', 'scifi', sfwMode],
    queryFn: () => fetchMangaList({ limit: 15, tags: [TAG_SCIFI], order: { followedCount: 'desc' }, contentRating }),
    enabled: wave3Ready,
  });

  const spotlightItems = useMemo(() => {
    return trending?.items || [];
  }, [trending?.items]);

  const [activeIdx, setActiveIdx] = useState(0);

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
        className="space-y-6 md:space-y-16 pb-24 md:pb-20 select-none"
      >
        <h1 className="sr-only">Dashboard</h1>

        <div className="relative overflow-hidden w-full h-[200px] md:h-[420px] rounded-2xl md:rounded-3xl border border-border-divider bg-surface">
          <AnimatePresence mode="wait">
            {spotlightManga ? (
              <motion.div
                key={spotlightManga.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0 flex overflow-hidden"
              >
                {/* Cover image — right side, fills height, object-cover properly */}
                {spotlightManga.cover && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spotlightManga.cover}
                      alt={spotlightManga.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Dark gradient from left so text is readable */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-app/95 via-bg-app/75 to-bg-app/10 z-10" />
                    {/* Bottom fade for extra depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-app/70 via-transparent to-transparent z-10" />
                  </>
                )}

                {/* Text content — left-anchored, full height */}
                <div className="relative z-20 flex flex-col justify-end gap-1.5 md:gap-3 px-4 md:px-12 py-4 md:py-10 w-[70%] md:w-[55%]">
                  <p className="text-[8px] md:text-[10px] text-accent font-black uppercase tracking-[0.18em] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 animate-pulse" /> Curated Spotlight
                  </p>
                  <h2 className="text-base md:text-4xl font-extrabold tracking-tight text-white font-serif leading-tight line-clamp-2 drop-shadow-lg">
                    {spotlightManga.title}
                  </h2>
                  <p className="text-[10px] md:text-xs text-white/50 font-sans leading-snug line-clamp-2 max-w-xs md:max-w-sm">
                    {spotlightManga.description || ''}
                  </p>
                  <div className="flex flex-row items-center gap-2 mt-1">
                    <Link
                      href={`/manga/${spotlightManga.id}`}
                      className="bg-white text-black font-sans font-black text-[9px] md:text-[11px] uppercase tracking-widest px-3 md:px-5 py-1.5 md:py-2 rounded-full select-none whitespace-nowrap hover:bg-white/90 transition-colors"
                    >
                      Read Now
                    </Link>
                    <Link
                      href="/search"
                      className="border border-white/30 text-white/80 font-sans font-bold text-[9px] md:text-[11px] uppercase tracking-widest px-3 md:px-5 py-1.5 md:py-2 rounded-full select-none whitespace-nowrap hover:border-white/60 hover:text-white transition-colors"
                    >
                      Explore
                    </Link>
                  </div>
                </div>

                {/* Slide counter — bottom right */}
                {spotlightItems.length > 1 && (
                  <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
                    {spotlightItems.slice(0, Math.min(spotlightItems.length, 8)).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === activeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-surface flex items-center justify-center font-sans text-xs text-text-muted animate-pulse">
                Loading spotlight...
              </div>
            )}
          </AnimatePresence>
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
          <section className="space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/40 pb-2">
              <h2 className="text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 tracking-widest text-text-primary">
                <Flame className="w-3.5 h-3.5 text-accent animate-pulse shrink-0" />
                <KineticTypography text="Trending" />
              </h2>
              <Link href="/search?sort=followedCount" className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-2 md:gap-6 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth">
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
          <section className="space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/40 pb-2">
              <h2 className="text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 tracking-widest text-text-primary">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <KineticTypography text="Latest" />
              </h2>
              <Link href="/search?sort=latestUploadedChapter" className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-2 md:gap-6 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth">
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
          <section className="space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-border-divider/40 pb-2">
              <h2 className="text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 tracking-widest text-text-primary">
                <Compass className="w-3.5 h-3.5 text-accent shrink-0" />
                <KineticTypography text="New Arrivals" />
              </h2>
              <Link href="/search?sort=createdAt" className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-2 md:gap-6 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth">
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

        <MangaRow
          id="toprated"
          icon={<Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
          label="Top Rated"
          href="/search?sort=rating"
          loading={loadingTopRated}
          isError={errorTopRated}
          items={topRated?.items}
          namespace="toprated"
        />

        <MangaRow
          id="action"
          icon={<Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          label="Action & Adventure"
          href="/search?tag=action"
          loading={loadingAction}
          isError={errorAction}
          items={action?.items}
          namespace="action"
        />

        <MangaRow
          id="romance"
          icon={<Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
          label="Romance"
          href="/search?tag=romance"
          loading={loadingRomance}
          isError={errorRomance}
          items={romance?.items}
          namespace="romance"
        />

        <MangaRow
          id="drama"
          icon={<Theater className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
          label="Drama"
          href="/search?tag=drama"
          loading={loadingDrama}
          isError={errorDrama}
          items={drama?.items}
          namespace="drama"
        />

        <MangaRow
          id="comedy"
          icon={<Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          label="Comedy"
          href="/search?tag=comedy"
          loading={loadingComedy}
          isError={errorComedy}
          items={comedy?.items}
          namespace="comedy"
        />

        <MangaRow
          id="fantasy"
          icon={<Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          label="Fantasy"
          href="/search?tag=fantasy"
          loading={loadingFantasy}
          isError={errorFantasy}
          items={fantasy?.items}
          namespace="fantasy"
        />

        <MangaRow
          id="scifi"
          icon={<Star className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
          label="Sci-Fi"
          href="/search?tag=sci-fi"
          loading={loadingScifi}
          isError={errorScifi}
          items={scifi?.items}
          namespace="scifi"
        />
      </motion.div>
      </EuclideanWaveContainer>
    </AppShell>
  );
}
