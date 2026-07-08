'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MangaCard } from '@/components/manga/MangaCard';
import { MangaCardSkeleton } from '@/components/manga/MangaCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { fetchMangaList } from '@/services/mangadex/mangaCatalogService';
import { useSettingsStore } from '@/stores/settingsStore';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tagNamesMap: Record<string, string> = {
  '391b0423-d847-456f-aff0-8b0cfc03066b': 'Action',
  '87cc87cd-a395-47af-b27a-93258283bbc6': 'Adventure',
  '4d32cc48-9f00-4cca-9b5a-a839f0764984': 'Comedy',
  'b9af3a63-f058-46de-a9a0-e0c13906197a': 'Drama',
  'cdc58593-87dd-415e-bbc0-2ec27bf404cc': 'Fantasy',
  '423e2eae-a7a2-4a8b-ac03-a8351462d71d': 'Romance',
  '256c8bd9-4904-4360-bf4f-508a76d67183': 'Sci-Fi',
  'e5301a23-ebd9-49dd-a0cb-2add944c7fe9': 'Slice of Life',
  'eabc5b4c-6aff-42f3-b657-3e90cbd00b75': 'Supernatural',
  'ee968100-4191-4968-93d3-f82d72be7e46': 'Mystery',
  '33771934-028e-4cb3-8744-691e866a923e': 'Historical',
  '3b60b75c-a2d7-4860-ab56-05f391bb889c': 'Psychological',
  'ace04997-f6bd-436e-b261-779182193d3d': 'Isekai',
  '69964a64-2f90-4d33-beeb-f3ed2875eb4c': 'Sports',
  '50880a9d-5440-4732-9afb-8f457127e836': 'Mecha',
  '5fff9cde-849c-4d78-aab0-0d52b2ee1d25': 'Survival',
  '07251805-a27e-4d59-b488-f0bfbec15168': 'Thriller',
  'caaa44eb-cd40-4177-b930-79d3ef2afe87': 'School Life',
};

// Framer Motion Animation configuration
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
} as const;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sfwMode = useSettingsStore((state) => state.settings.sfwMode);

  // Read search criteria directly from searchParams (single source of truth)
  const title = searchParams.get('title') || '';
  const demographic = searchParams.get('demographic')?.split(',').filter(Boolean) || [];
  const status = searchParams.get('status')?.split(',').filter(Boolean) || [];
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sort = searchParams.get('sort') || 'followedCount';

  const [titleInput, setTitleInput] = useState(title);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 18;

  // Sync titleInput with title from URL if URL changes
  useEffect(() => {
    const t = setTimeout(() => {
      setTitleInput(title);
    }, 0);
    return () => clearTimeout(t);
  }, [title]);

  // Update URL helper function
  const updateUrl = useCallback((updates: {
    title?: string | null;
    demographic?: string[] | null;
    status?: string[] | null;
    tags?: string[] | null;
    sort?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.title !== undefined) {
      if (updates.title) params.set('title', updates.title);
      else params.delete('title');
    }
    if (updates.demographic !== undefined) {
      if (updates.demographic && updates.demographic.length > 0) {
        params.set('demographic', updates.demographic.join(','));
      } else {
        params.delete('demographic');
      }
    }
    if (updates.status !== undefined) {
      if (updates.status && updates.status.length > 0) {
        params.set('status', updates.status.join(','));
      } else {
        params.delete('status');
      }
    }
    if (updates.tags !== undefined) {
      if (updates.tags && updates.tags.length > 0) {
        params.set('tags', updates.tags.join(','));
      } else {
        params.delete('tags');
      }
    }
    if (updates.sort !== undefined) {
      if (updates.sort) params.set('sort', updates.sort);
      else params.delete('sort');
    }

    const queryStr = params.toString();
    const nextUrl = queryStr ? `/search?${queryStr}` : '/search';
    router.replace(nextUrl, { scroll: false });
    setPage(1);
  }, [searchParams, router, setPage]);

  // Debounce local titleInput and write to URL search params
  useEffect(() => {
    const handler = setTimeout(() => {
      if (titleInput !== title) {
        updateUrl({ title: titleInput || null });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [titleInput, title, updateUrl]);

  const toggleDemographic = (dem: string) => {
    const next = demographic.includes(dem)
      ? demographic.filter((d) => d !== dem)
      : [...demographic, dem];
    updateUrl({ demographic: next });
  };

  const toggleStatus = (st: string) => {
    const next = status.includes(st)
      ? status.filter((s) => s !== st)
      : [...status, st];
    updateUrl({ status: next });
  };

  const handleResetFilters = () => {
    setTitleInput('');
    router.replace('/search', { scroll: false });
    setPage(1);
  };

  const hasActiveFilters = title || demographic.length > 0 || status.length > 0 || tags.length > 0 || sort !== 'followedCount';

  // Construct search arguments for catalog service
  const searchArgs = {
    title: title || undefined,
    limit,
    offset: (page - 1) * limit,
    publicationDemographic: demographic.length > 0 ? demographic : undefined,
    status: status.length > 0 ? status : undefined,
    tags: tags.length > 0 ? tags : undefined,
    contentRating: sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'],
    order: {
      [sort]: 'desc' as const,
    },
  };

  // Fetch results query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['manga', 'search', searchArgs, sfwMode],
    queryFn: () => fetchMangaList(searchArgs),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" /> Catalog Search
          </h1>
          <p className="text-xs text-text-muted uppercase mt-1">
            Browse through the MangaDex directory using custom parameters.
          </p>
        </div>
      </div>

      {/* Search Input and Control Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search by title, author, or tag..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="pl-9 h-11"
          />
          <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-text-muted" />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          className="h-11 font-sans text-xs uppercase font-bold tracking-wider"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-11 border border-border-divider text-text-muted hover:text-text-primary"
            aria-label="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Expandable Drawer with Framer Motion slide-height */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="overflow-hidden"
          >
            <Card className="p-6 font-sans text-xs space-y-5 border-border-divider/50 bg-surface/30 backdrop-blur-xl shadow-xl shadow-black/5 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Demographic Selector */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-text-muted">Demographic</span>
                  <div className="flex flex-wrap gap-2">
                    {['shounen', 'shoujo', 'seinen', 'josei'].map((dem) => {
                      const active = demographic.includes(dem);
                      return (
                        <button
                          key={dem}
                          onClick={() => toggleDemographic(dem)}
                          className={`px-4 py-2.5 border rounded-md uppercase text-[10px] cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                            active
                              ? 'bg-accent/15 text-accent border-accent font-bold'
                              : 'bg-surface/50 text-text-primary border-border-divider/50 hover:bg-surface/85 hover:border-text-muted'
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          {dem}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-text-muted">Publishing Status</span>
                  <div className="flex flex-wrap gap-2">
                    {['ongoing', 'completed', 'hiatus', 'cancelled'].map((st) => {
                      const active = status.includes(st);
                      return (
                        <button
                          key={st}
                          onClick={() => toggleStatus(st)}
                          className={`px-4 py-2.5 border rounded-md uppercase text-[10px] cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                            active
                              ? 'bg-accent/15 text-accent border-accent font-bold'
                              : 'bg-surface/50 text-text-primary border-border-divider/50 hover:bg-surface/85 hover:border-text-muted'
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Selector */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-text-muted">Sort Criteria</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => updateUrl({ sort: e.target.value })}
                      className="w-full h-9 border border-border-divider/50 bg-surface/50 px-3 py-1 text-xs font-sans uppercase font-bold text-text-primary focus:outline-none focus:border-accent appearance-none rounded-md"
                    >
                      <option value="followedCount">Popularity (Follows)</option>
                      <option value="latestUploadedChapter">Latest Updates</option>
                      <option value="createdAt">Recently Added</option>
                      <option value="title">Alphabetical (Title)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Category Indicators */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-surface/20 border border-border-divider/50 rounded-xl p-3.5 font-sans text-[11px] font-semibold tracking-wide">
          <span className="text-text-muted uppercase">Active Categories:</span>
          {tags.map((tagId) => (
            <Badge key={tagId} variant="accent" radius="sm" className="flex items-center gap-1.5 bg-accent/10 border-accent/20 text-accent font-bold px-2 py-0.5 text-[10px]">
              {tagNamesMap[tagId] || 'Genre'}
              <button
                onClick={() => updateUrl({ tags: tags.filter((t) => t !== tagId) })}
                className="hover:text-text-primary text-[9px] font-bold font-sans cursor-pointer shrink-0 ml-1"
                aria-label="Remove filter"
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-8 border border-accent bg-accent/5 font-sans text-center rounded-xl">
          <p className="text-text-primary mb-2 uppercase font-bold">Search request failed</p>
          <p className="text-text-muted text-xs mb-4 font-sans">
            Unable to fetch search results from MangaDex due to connections or rate limiting.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mx-auto">
            Retry Search
          </Button>
        </div>
      )}

      {/* Results grid */}
      {!isError && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, idx) => (
                <MangaCardSkeleton key={idx} />
              ))}
            </div>
          ) : (data?.items.length || 0) === 0 ? (
            <div className="p-12 border border-border-divider text-center font-sans text-xs text-text-muted bg-surface/30 backdrop-blur-xl rounded-xl">
              No titles match your search criteria. Try removing some filters.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Staggered card entrance grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
              >
                {data?.items.map((m) => (
                  <motion.div key={m.id} variants={itemVariants}>
                    <MangaCard manga={m} namespace="search" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Simple Pagination */}
              {data && data.total > limit && (
                <div className="flex justify-between items-center pt-4 border-t border-border-divider/50 font-sans text-xs font-semibold tracking-wider uppercase">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-text-muted">
                    Page {page} of {Math.ceil(data.total / limit)} ({data.total} matches)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * limit >= data.total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="font-mono">
              <h1 className="text-xl font-bold tracking-tight mb-2 uppercase">Catalog Search</h1>
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-11 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <MangaCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
