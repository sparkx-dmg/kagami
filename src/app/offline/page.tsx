'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLibraryStore } from '@/stores/libraryStore';
import { WifiOff, Trash2, ArrowRight, DownloadCloud } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerContainer,
  fadeLeftItem,
  fadeUpItem,
  pageVariants,
  scaleInItem,
} from '@/utils/animations';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflinePage() {
  const { downloadedChapters, removeDownloadedChapter } = useLibraryStore();
  const isOnline = useOnlineStatus();

  const downloadsList = Object.values(downloadedChapters);

  const handleDeleteDownload = async (chapterId: string) => {
    if ('caches' in window) {
      try {
        await caches.open('kagami-offline-chapters');
      } catch (err) {
        console.error('Failed to access Cache Storage: ', err);
      }
    }
    removeDownloadedChapter(chapterId);
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
        {/* 2. Offline warning banner — AnimatePresence for mount/unmount */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              className="flex items-center gap-3 p-4 bg-accent/10 border border-accent text-accent font-mono text-xs"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              <WifiOff className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold uppercase">BROWSER IS CURRENTLY OFFLINE</span>
                <p className="text-[10px] text-text-muted mt-0.5 font-sans leading-relaxed">
                  Kagami has detected that your device has no active internet connection. You can only read downloaded offline shelf chapters.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Header wrapped in fadeUpItem */}
        <motion.div className="font-mono" variants={fadeUpItem}>
          <h1 className="text-xl font-bold tracking-tight mb-2 uppercase flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-accent" /> Offline Downloads
          </h1>
          <p className="text-xs text-text-muted uppercase">
            Read chapters offline without data connection or cellular networks.
          </p>
        </motion.div>

        {/* Downloads list */}
        {downloadsList.length === 0 ? (
          /* 4. Empty state — AnimatePresence with scaleInItem */
          <AnimatePresence mode="wait">
            <motion.div
              key="empty"
              variants={scaleInItem}
              initial="hidden"
              animate="show"
            >
              <Card className="p-12 text-center font-mono text-xs text-text-muted bg-surface flex flex-col items-center justify-center gap-4">
                <WifiOff className="w-8 h-8 text-border-divider" />
                <p className="uppercase">No chapters downloaded for offline reading.</p>
                <p className="text-[10px] text-text-muted font-sans max-w-xs leading-normal">
                  Click the download button next to a chapter inside the manga details page to make it available offline.
                </p>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* 5. Staggered list container */
          <motion.div
            className="space-y-3 font-mono"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {downloadsList.map((chapter) => (
              /* 6. Each download row — fadeLeftItem + whileHover slide */
              <motion.div
                key={chapter.chapterId}
                variants={fadeLeftItem}
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className="flex items-center justify-between p-4 border border-border-divider bg-surface hover:border-text-primary transition-all duration-200 gap-4"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs uppercase block truncate">{chapter.mangaTitle}</span>
                  <span className="text-[10px] text-text-muted uppercase mt-1 block">
                    Chapter {chapter.chapterNumber} • {chapter.pageCount} Pages Cached
                  </span>
                  <span className="text-[8px] text-text-muted font-sans mt-0.5 block">
                    Downloaded on {new Date(chapter.downloadedAt).toLocaleString()}
                  </span>
                </div>

                {/* 7. Button group with hover scale */}
                <motion.div
                  className="flex items-center gap-2 shrink-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDownload(chapter.chapterId)}
                    className="h-8 w-8 p-0 border-destructive/35 hover:bg-destructive/10 text-destructive"
                    aria-label={`Delete Chapter ${chapter.chapterNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Link href={`/read/${chapter.chapterId}`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-[10px] flex items-center gap-1">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
