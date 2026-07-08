'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Compass },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-border-divider/40 h-14 items-center justify-around z-40 select-none font-mono text-[9px] uppercase tracking-wider"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32, delay: 0.05 }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors border-t-2",
              isActive
                ? "text-accent border-accent font-semibold"
                : "text-text-muted border-transparent hover:text-text-primary"
            )}
          >
            <motion.div
              whileHover={{ y: -1, scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="flex flex-col items-center space-y-1"
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </motion.div>
            {isActive && (
              <motion.span
                layoutId="activeBottomTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5F5F0]"
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.1 }}
              />
            )}
          </Link>
        );
      })}
    </motion.nav>
  );
}
