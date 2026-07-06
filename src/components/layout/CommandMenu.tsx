'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/stores/settingsStore';
import { Search, Compass, BookOpen, History, Settings, Download, Sun, Moon, Shield } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface CommandItem {
  icon: React.ReactNode;
  label: string;
  category: string;
  action: () => void;
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<CommandItem[]>(() => [
    { icon: <Compass className="w-4 h-4" />, label: 'Home Dashboard', category: 'Navigation', action: () => router.push('/') },
    { icon: <Search className="w-4 h-4" />, label: 'Advanced Search', category: 'Navigation', action: () => router.push('/search') },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Manga Library', category: 'Navigation', action: () => router.push('/library') },
    { icon: <History className="w-4 h-4" />, label: 'Reading History', category: 'Navigation', action: () => router.push('/history') },
    { icon: <Download className="w-4 h-4" />, label: 'Offline Chapters', category: 'Navigation', action: () => router.push('/offline') },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings & Preferences', category: 'Navigation', action: () => router.push('/settings') },
    { icon: <Sun className="w-4 h-4" />, label: 'Set Light Theme', category: 'Theme', action: () => updateSettings({ theme: 'light' }) },
    { icon: <Moon className="w-4 h-4" />, label: 'Set Dark Theme', category: 'Theme', action: () => updateSettings({ theme: 'dark' }) },
    { icon: <Shield className="w-4 h-4" />, label: settings.sfwMode ? 'Disable Safe Mode (Show NSFW)' : 'Enable Safe Mode (SFW Only)', category: 'Safety', action: () => updateSettings({ sfwMode: !settings.sfwMode }) },
  ], [router, settings.sfwMode, updateSettings]);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle Command Menu on Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch('');
        setSelectedIndex(0);
        setIsOpen((open) => !open);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set focus when opened
  useEffect(() => {
    if (isOpen) {
      // Timeout to wait for animation/modal mount
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Key navigation in commands list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 340, damping: 26, delay: i * 0.025 },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="command-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-bg-app/80 backdrop-blur-[2px] z-50 flex items-start justify-center pt-[15vh] px-4 font-mono"
        >
          <motion.div
            ref={menuRef}
            key="command-panel"
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-lg bg-surface border border-text-primary rounded-none shadow-none flex flex-col max-h-[60vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Command Menu"
          >
            {/* Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="flex items-center border-b border-border-divider px-3"
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Search className="w-4 h-4 text-text-muted mr-3 shrink-0" />
              </motion.span>
              <input
                ref={inputRef}
                type="text"
                className="w-full h-12 text-xs bg-transparent border-none text-text-primary focus:outline-none placeholder:text-text-muted"
                placeholder="Type a command or search page..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleListKeyDown}
              />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] border border-border-divider text-text-muted uppercase">
                esc
              </kbd>
            </motion.div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto py-2">
              <AnimatePresence mode="wait">
                {filteredCommands.length === 0 ? (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-6 text-xs text-text-muted text-center"
                  >
                    No commands found
                  </motion.div>
                ) : (
                  <motion.div key="results-list" initial="hidden" animate="show">
                    {filteredCommands.map((cmd, idx) => (
                      <motion.button
                        key={cmd.label}
                        custom={idx}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        whileHover={{ x: 4, backgroundColor: 'color-mix(in srgb, var(--accent-base) 10%, transparent)' }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center px-4 py-3 text-left text-xs transition-colors cursor-pointer rounded-none border-none outline-none ${
                          idx === selectedIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'text-text-primary hover:bg-bg-app'
                        }`}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <motion.span
                          className="mr-3 shrink-0"
                          animate={idx === selectedIndex ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          {cmd.icon}
                        </motion.span>
                        <span className="flex-1 truncate">{cmd.label}</span>
                        <motion.span
                          className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                            idx === selectedIndex
                              ? 'border-accent-foreground/30 text-accent-foreground'
                              : 'border-border-divider text-text-muted'
                          }`}
                          layout
                        >
                          {cmd.category}
                        </motion.span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="border-t border-border-divider px-4 py-2.5 bg-bg-app flex justify-between items-center text-[10px] text-text-muted"
            >
              <div className="flex space-x-3">
                <span>
                  <kbd className="border border-border-divider px-1 mr-1">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="border border-border-divider px-1 mr-1">Enter</kbd> Select
                </span>
              </div>
              <span>Kagami Command Palette</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
