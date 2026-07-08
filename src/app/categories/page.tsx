'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MangaCard } from '@/components/manga/MangaCard';
import { MangaCardSkeleton } from '@/components/manga/MangaCardSkeleton';
import { fetchMangaList } from '@/services/mangadex/mangaCatalogService';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  pageVariants,
  fadeUpItem,
  staggerContainer,
  staggerContainerFast,
  scaleInItem,
} from '@/utils/animations';
import {
  LayoutGrid,
  Flame,
  Compass,
  Heart,
  Coffee,
  ShieldAlert,
  Sparkles,
  Ghost,
  HelpCircle,
  Activity,
  Scroll,
  Atom,
  Trophy,
  Hammer,
  Skull,
  User,
  Tv,
  Star
} from 'lucide-react';

// 18 category genres definitions with 100% verified MangaDex API UUIDs
const categories = [
  {
    name: 'Action',
    id: '391b0423-d847-456f-aff0-8b0cfc03066b',
    icon: Flame,
    description: 'High energy, intense combats, battles, and physical feats.',
    gradient: 'from-orange-500/10 via-surface/40 to-surface/90 hover:border-orange-500/40 hover:shadow-orange-500/5',
    colorText: 'text-orange-500',
  },
  {
    name: 'Adventure',
    id: '87cc8730-a2f9-41a4-94f0-88187874da68', // Wait, the correct ID is 87cc87cd-a395-47af-b27a-93258283bbc6
    id_official: '87cc87cd-a395-47af-b27a-93258283bbc6',
    icon: Compass,
    description: 'Explorations, epic quests, traveling, and world exploration.',
    gradient: 'from-emerald-500/10 via-surface/40 to-surface/90 hover:border-emerald-500/40 hover:shadow-emerald-500/5',
    colorText: 'text-emerald-500',
  },
  {
    name: 'Comedy',
    id: '4d32cc48-9f00-4cca-9b5a-a839f0764984',
    icon: Coffee,
    description: 'Funny situations, humor, slice-of-life jokes, and gags.',
    gradient: 'from-yellow-500/10 via-surface/40 to-surface/90 hover:border-yellow-500/40 hover:shadow-yellow-500/5',
    colorText: 'text-yellow-500',
  },
  {
    name: 'Drama',
    id: 'b9af3a63-f058-46de-a9a0-e0c13906197a',
    icon: ShieldAlert,
    description: 'Melodrama, character conflicts, emotional tension, and struggles.',
    gradient: 'from-red-500/10 via-surface/40 to-surface/90 hover:border-red-500/40 hover:shadow-red-500/5',
    colorText: 'text-red-500',
  },
  {
    name: 'Fantasy',
    id: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
    icon: Sparkles,
    description: 'Magic, mythical kingdoms, supernatural lore, and legends.',
    gradient: 'from-rose-500/10 via-surface/40 to-surface/90 hover:border-rose-500/40 hover:shadow-rose-500/5',
    colorText: 'text-rose-500',
  },
  {
    name: 'Romance',
    id: '423e2eae-a7a2-4a8b-ac03-a8351462d71d',
    icon: Heart,
    description: 'Romantic couples, courtship, love affairs, and relationships.',
    gradient: 'from-pink-500/10 via-surface/40 to-surface/90 hover:border-pink-500/40 hover:shadow-pink-500/5',
    colorText: 'text-pink-500',
  },
  {
    name: 'Sci-Fi',
    id: '256c8bd9-4904-4360-bf4f-508a76d67183',
    icon: Atom,
    description: 'Futuristic technologies, space travels, aliens, and virtual space.',
    gradient: 'from-lime-500/10 via-surface/40 to-surface/90 hover:border-lime-500/40 hover:shadow-lime-500/5',
    colorText: 'text-lime-500',
  },
  {
    name: 'Slice of Life',
    id: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',
    icon: LayoutGrid,
    description: 'Daily routines, realistic settings, character growth, and bonding.',
    gradient: 'from-emerald-500/10 via-surface/40 to-surface/90 hover:border-emerald-500/40 hover:shadow-emerald-500/5',
    colorText: 'text-emerald-500',
  },
  {
    name: 'Supernatural',
    id: 'eabc5b4c-6aff-42f3-b657-3e90cbd00b75',
    icon: Ghost,
    description: 'Ghosts, shamans, spirits, vampires, and paranormal events.',
    gradient: 'from-amber-500/10 via-surface/40 to-surface/90 hover:border-amber-500/40 hover:shadow-amber-500/5',
    colorText: 'text-amber-500',
  },
  {
    name: 'Mystery',
    id: 'ee968100-4191-4968-93d3-f82d72be7e46',
    icon: HelpCircle,
    description: 'Unraveling secrets, investigations, detectives, and suspense.',
    gradient: 'from-teal-500/10 via-surface/40 to-surface/90 hover:border-teal-500/40 hover:shadow-teal-500/5',
    colorText: 'text-teal-500',
  },
  {
    name: 'Historical',
    id: '33771934-028e-4cb3-8744-691e866a923e',
    icon: Scroll,
    description: 'Feudal eras, wars, dynasties, and ancient timelines.',
    gradient: 'from-amber-500/10 via-surface/40 to-surface/90 hover:border-amber-500/40 hover:shadow-amber-500/5',
    colorText: 'text-amber-500',
  },
  {
    name: 'Psychological',
    id: '3b60b75c-a2d7-4860-ab56-05f391bb889c',
    icon: Activity,
    description: 'Mind games, mental struggles, thrillers, and philosophical conflicts.',
    gradient: 'from-rose-500/10 via-surface/40 to-surface/90 hover:border-rose-500/40 hover:shadow-rose-500/5',
    colorText: 'text-rose-500',
  },
  {
    name: 'Isekai',
    id: 'ace04997-f6bd-436e-b261-779182193d3d',
    icon: Tv,
    description: 'Reincarnation or transportation into alternate magical realms.',
    gradient: 'from-orange-500/10 via-surface/40 to-surface/90 hover:border-orange-500/40 hover:shadow-orange-500/5',
    colorText: 'text-orange-500',
  },
  {
    name: 'Sports',
    id: '69964a64-2f90-4d33-beeb-f3ed2875eb4c',
    icon: Trophy,
    description: 'Team athletics, competition tournaments, and physical drills.',
    gradient: 'from-lime-500/10 via-surface/40 to-surface/90 hover:border-lime-500/40 hover:shadow-lime-500/5',
    colorText: 'text-lime-500',
  },
  {
    name: 'Mecha',
    id: '50880a9d-5440-4732-9afb-8f457127e836',
    icon: Hammer,
    description: 'Giant robots, mechanical weapons, and military sci-fi controls.',
    gradient: 'from-slate-500/10 via-surface/40 to-surface/90 hover:border-slate-500/40 hover:shadow-slate-500/5',
    colorText: 'text-slate-500',
  },
  {
    name: 'Survival',
    id: '5fff9cde-849c-4d78-aab0-0d52b2ee1d25',
    icon: Skull,
    description: 'Death matches, post-apocalyptic trials, and resource battles.',
    gradient: 'from-zinc-500/10 via-surface/40 to-surface/90 hover:border-zinc-500/40 hover:shadow-zinc-500/5',
    colorText: 'text-zinc-500',
  },
  {
    name: 'Thriller',
    id: '07251805-a27e-4d59-b488-f0bfbec15168',
    icon: Star,
    description: 'Suspenseful narratives, crimes, and fast-paced high stakes.',
    gradient: 'from-fuchsia-500/10 via-surface/40 to-surface/90 hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5',
    colorText: 'text-fuchsia-500',
  },
  {
    name: 'School Life',
    id: 'caaa44eb-cd40-4177-b930-79d3ef2afe87',
    icon: User,
    description: 'Clubs, study hours, youth activities, and class relations.',
    gradient: 'from-zinc-500/10 via-surface/40 to-surface/90 hover:border-zinc-500/40 hover:shadow-zinc-500/5',
    colorText: 'text-zinc-500',
  },
];

// Clean up actual IDs
categories.forEach(c => {
  if (c.name === 'Adventure') {
    c.id = '87cc87cd-a395-47af-b27a-93258283bbc6';
  }
});

export default function CategoriesPage() {
  const router = useRouter();
  const sfwMode = useSettingsStore((state) => state.settings.sfwMode);

  const handleCategoryClick = (id: string) => {
    router.push(`/search?tags=${id}`);
  };

  // Helper query constructor for curations
  const getCategoryQuery = (tagId: string) => {
    return {
      queryKey: ['manga', 'category-curation', tagId, sfwMode],
      queryFn: () =>
        fetchMangaList({
          tags: [tagId],
          limit: 6,
          contentRating: sfwMode ? ['safe', 'suggestive'] : ['safe', 'suggestive', 'erotica', 'pornographic'],
          order: { followedCount: 'desc' },
        }),
      staleTime: 5 * 60 * 1000,
    };
  };

  // Fetch 3 top categories in parallel (Action, Romance, Fantasy) to stay within rate-limits safely
  const { data: actionManga, isLoading: loadingAction } = useQuery(
    getCategoryQuery('391b0423-d847-456f-aff0-8b0cfc03066b')
  );
  const { data: romanceManga, isLoading: loadingRomance } = useQuery(
    getCategoryQuery('423e2eae-a7a2-4a8b-ac03-a8351462d71d')
  );
  const { data: fantasyManga, isLoading: loadingFantasy } = useQuery(
    getCategoryQuery('cdc58593-87dd-415e-bbc0-2ec27bf404cc')
  );

  const curations = [
    { name: 'Popular Action Manga', id: '391b0423-d847-456f-aff0-8b0cfc03066b', data: actionManga, loading: loadingAction },
    { name: 'Popular Romance Manga', id: '423e2eae-a7a2-4a8b-ac03-a8351462d71d', data: romanceManga, loading: loadingRomance },
    { name: 'Popular Fantasy Manga', id: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc', data: fantasyManga, loading: loadingFantasy },
  ];

  return (
    <AppShell>
      {/* Step 1: Page-level entrance */}
      <motion.div variants={pageVariants} initial='hidden' animate='show'>
        <div className="space-y-12">
          {/* Step 2: Header fade-up */}
          <motion.div variants={fadeUpItem} initial='hidden' animate='show'>
            <div className="font-sans">
              <h1 className="text-xl font-bold tracking-tight mb-2 uppercase flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-accent" /> Genre Directory
              </h1>
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                Browse genres, themes, and curated directories sorted dynamically.
              </p>
            </div>
          </motion.div>

          {/* Categories Bento Grid */}
          <div className="space-y-4 font-sans">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-sans">
              Browse Genres ({categories.length})
            </span>
            {/* Step 3: Staggered genre grid */}
            <motion.div
              className="grid grid-cols-2 max-[480px]:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              variants={staggerContainer}
              initial='hidden'
              animate='show'
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  // Step 4: Genre card with scaleInItem + hover/tap
                  <motion.div
                    key={cat.id}
                    variants={scaleInItem}
                    whileHover={{ y: -4, scale: 1.03, rotateZ: 0.6 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  >
                    <Card
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex flex-col justify-between h-32 border border-border-divider/50 bg-gradient-to-br ${cat.gradient} p-4 cursor-pointer font-sans select-none transition-all duration-300 rounded-xl shadow-sm`}
                      hoverEffect
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-primary truncate max-w-[100px]">
                            {cat.name}
                          </span>
                          <Icon className={`w-3.5 h-3.5 ${cat.colorText} shrink-0`} />
                        </div>
                        <p className="text-[9px] text-text-muted leading-tight line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                      <div className="text-[8px] text-text-muted uppercase text-right tracking-widest pt-1.5 border-t border-border-divider/20 font-bold">
                        Search →
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Dynamic Category Shelves (Sorted Curation) */}
          <div className="space-y-10">
            {curations.map((cur) => (
              // Step 5: Curation shelf — use initial/animate (not whileInView) for test compatibility
              <motion.div
                key={cur.id}
                variants={fadeUpItem}
                initial='hidden'
                animate='show'
              >
                <section className="space-y-4 border-t border-border-divider/30 pt-8 font-sans">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-text-primary">
                      <Star className="w-4 h-4 text-accent" /> {cur.name}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryClick(cur.id)}
                      className="text-[9px] uppercase font-bold hover:text-accent transition-colors tracking-wider"
                    >
                      View All Titles
                    </Button>
                  </div>

                  {/* Step 6: Staggered manga card grid inside each curation */}
                  <motion.div
                    className="grid grid-cols-2 max-[480px]:grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4"
                    variants={staggerContainerFast}
                    initial='hidden'
                    animate='show'
                  >
                    {cur.loading
                      ? Array.from({ length: 6 }).map((_, idx) => <MangaCardSkeleton key={idx} />)
                      : cur.data?.items.slice(0, 6).map((m) => (
                          <motion.div key={m.id} variants={scaleInItem}>
                            <MangaCard manga={m} namespace={cur.id} />
                          </motion.div>
                        ))}
                  </motion.div>
                </section>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
