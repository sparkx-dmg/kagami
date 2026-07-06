'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSettingsStore } from '@/stores/settingsStore';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Categories', href: '/categories' },
  { label: 'Library', href: '/library' },
  { label: 'History', href: '/history' },
  { label: 'Settings', href: '/settings' },
];

export function Header() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center pt-4 pb-2 bg-gradient-to-b from-bg-app via-bg-app/95 to-transparent">
      <div className="max-w-5xl w-[95%] flex items-center justify-between bg-surface/80 backdrop-blur-md border border-border-divider rounded-full px-5 py-2.5 select-none transition-all duration-300">
        <div className="flex items-center pl-2">
          <Link href="/" className="font-sans font-black text-sm tracking-widest text-accent uppercase hover:scale-[1.02] transition-transform duration-200">
            鏡 KAGAMI
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 text-xs rounded-full transition-colors duration-300 z-10",
                  isActive ? "text-bg-app" : "text-text-muted hover:text-text-primary"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-text-primary rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <Link 
            href="/search"
            className="text-[9px] uppercase font-bold tracking-widest bg-border-divider text-text-primary px-3 py-1 rounded-full animate-pulse"
          >
            Search
          </Link>
          <Link 
            href="/categories"
            className="text-[9px] uppercase font-bold tracking-widest bg-border-divider text-text-primary px-3 py-1 rounded-full animate-pulse"
          >
            Browse
          </Link>
        </div>

        <div className="flex items-center space-x-3 pr-1">
          <div 
            className="flex items-center justify-center cursor-pointer"
            title={isOnline ? "System Online" : "System Offline"}
            onClick={() => router.push('/offline')}
          >
            {isOnline ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            )}
          </div>

          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-border-divider bg-bg-app/40 text-text-primary hover:bg-surface transition-colors cursor-pointer"
            aria-label="Refresh Page"
          >
            <RefreshCw className="w-3 h-3 text-text-primary" />
          </motion.button>

          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-border-divider bg-bg-app/40 text-text-primary hover:bg-surface transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'light' ? (
              <Moon className="w-3 h-3 text-text-primary" />
            ) : (
              <Sun className="w-3 h-3 text-text-primary" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
