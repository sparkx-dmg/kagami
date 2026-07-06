'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLibraryStore } from '@/stores/libraryStore';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  pageVariants,
  staggerContainer,
  fadeUpItem,
  fadeLeftItem,
} from '@/utils/animations';

export default function HistoryPage() {
  const { history, items } = useLibraryStore();

  // Aggregate and sort history items
  const historyList = Object.values(history)
    .flat()
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());

  const handleClearHistory = () => {
    // Clear history logs by setting the history store key
    useLibraryStore.setState({ history: {} });
  };

  return (
    <AppShell>
      {/* 1. Page-level entrance wrapper */}
      <motion.div
        className="space-y-6"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        {/* 2. Header with fadeUpItem */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono"
          variants={fadeUpItem}
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-2 uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> Reading History
            </h1>
            <p className="text-xs text-text-muted uppercase">
              Keep track of chapters you have opened and read progress.
            </p>
          </div>
          {historyList.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </Button>
          )}
        </motion.div>

        {/* 3 & 4. AnimatePresence for empty-state / list swap */}
        <AnimatePresence mode="wait">
          {historyList.length === 0 ? (
            /* 3. Empty-state spring pop-in */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Card className="p-12 text-center font-mono text-xs text-text-muted bg-surface flex flex-col items-center justify-center gap-4">
                <Clock className="w-8 h-8 text-border-divider" />
                <p className="uppercase">Your reading history log is empty.</p>
                <p className="text-[10px] text-text-muted font-sans max-w-xs leading-normal">
                  Any chapters you read inside the reader will appear here with page checkpoints.
                </p>
              </Card>
            </motion.div>
          ) : (
            /* 4. Staggered list container */
            <motion.div
              key="list"
              className="space-y-3 font-mono"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {historyList.map((entry, idx) => {
                const mangaItem = items[entry.mangaId];
                const mangaTitle = mangaItem?.manga?.title || 'Unknown Manga';
                const cover = mangaItem?.manga?.cover || null;

                return (
                  /* 5. Each row: fadeLeftItem + hover x-shift */
                  <motion.div
                    key={`${entry.chapterId}-${entry.readAt}-${idx}`}
                    variants={fadeLeftItem}
                    whileHover={{ x: 3, borderColor: 'var(--accent-base)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                    className="flex items-center p-3 border border-border-divider bg-surface transition-all duration-200 hover:border-text-primary gap-4"
                  >
                    {/* Thumbnail Cover */}
                    <div className="w-10 aspect-[3/4] bg-border-divider/25 border border-border-divider shrink-0 overflow-hidden">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={mangaTitle} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-text-muted">
                          NO COVER
                        </div>
                      )}
                    </div>

                    {/* Info details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs uppercase truncate">{mangaTitle}</h4>
                      <p className="text-[10px] text-text-muted mt-1 uppercase">
                        Chapter {entry.chapterNumber} • Page {entry.pageIndex + 1}
                      </p>
                      <p className="text-[8px] text-text-muted font-sans mt-0.5">
                        Read on {new Date(entry.readAt).toLocaleString()}
                      </p>
                    </div>

                    {/* 6. Resume button — scale spring on hover/tap */}
                    <div className="shrink-0">
                      <Link href={`/read/${entry.chapterId}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                        >
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-[10px] flex items-center gap-1">
                            Resume <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  );
}
