'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

const THEMES = ['light', 'dark', 'theme-sepia', 'theme-forest', 'theme-charcoal'];
const ACCENTS = [
  'accent-crimson',
  'accent-grove',
  'accent-amber',
  'accent-mono',
  'accent-sakura',
  'accent-terracotta',
  'accent-wasabi'
];
const SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (themeMode: string) => {
      root.classList.remove(...THEMES);
      if (themeMode === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else if (themeMode === 'sepia') {
        root.classList.add('light', 'theme-sepia');
      } else if (themeMode === 'forest') {
        root.classList.add('dark', 'theme-forest');
      } else if (themeMode === 'charcoal') {
        root.classList.add('dark', 'theme-charcoal');
      } else {
        root.classList.add(themeMode);
      }
    };

    applyTheme(settings.theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    root.classList.remove(...ACCENTS);
    root.classList.add(`accent-${settings.accent}`);

    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('high-contrast', settings.highContrast);

    root.classList.remove(...SIZES);
    root.classList.add(`text-${settings.fontSize}`);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [
    settings.theme,
    settings.accent,
    settings.reducedMotion,
    settings.highContrast,
    settings.fontSize,
  ]);

  return <>{children}</>;
}
