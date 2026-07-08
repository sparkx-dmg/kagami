'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { MangaCard } from '@/components/manga/MangaCard';
import { useLibraryStore } from '@/stores/libraryStore';
import { BookOpen, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'all' | 'reading' | 'planning' | 'completed' | 'favorites';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
} as const;

export default function LibraryPage() {
  const { items } = useLibraryStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const libraryList = Object.values(items);

  const filteredList = libraryList.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'favorites') return item.isFavorite;
    if (activeTab === 'reading') return item.status === 'reading';
    if (activeTab === 'planning') return item.status === 'planning';
    if (activeTab === 'completed') return item.status === 'completed';
    return true;
  });

  const tabs: { value: TabType; label: string }[] = [
    { value: 'all', label: 'All Shelves' },
    { value: 'reading', label: 'Reading' },
    { value: 'planning', label: 'Plan to Read' },
    { value: 'completed', label: 'Completed' },
    { value: 'favorites', label: 'Favorites' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="font-mono">
          <h1 className="text-xl font-bold tracking-tight mb-2 uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Library Shelf
          </h1>
          <p className="text-xs text-text-muted uppercase">
            Access your personalized library collections and followed titles.
          </p>
        </div>

        {/* Tab Switcher with fluid layout slide */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface/30 rounded-full border border-border-divider/30 max-w-max font-mono text-xs select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="relative px-4 py-1.5 rounded-full uppercase tracking-wider cursor-pointer transition-colors duration-100 z-10"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeLibraryTab"
                    className="absolute inset-0 bg-[#F5F5F0] rounded-full -z-10"
                    transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.1 }}
                  />
                )}
                <span className={isActive ? "text-[#0B0B0A] font-bold" : "text-text-muted hover:text-text-primary"}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Library Grid with AnimatePresence for tab switching updates */}
        <AnimatePresence mode="wait">
          {filteredList.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-12 text-center font-mono text-xs text-text-muted bg-surface flex flex-col items-center justify-center gap-4">
                <FolderHeart className="w-8 h-8 text-border-divider" />
                <p className="uppercase">No titles found in this library section.</p>
                <p className="text-[10px] text-text-muted font-sans max-w-xs leading-normal">
                  Browse the catalog and add manga to your library, or change shelf status on the title details page.
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
            >
              {filteredList.map((item) => (
                <motion.div key={item.mangaId} variants={itemVariants}>
                  <MangaCard manga={item.manga} namespace="library" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
