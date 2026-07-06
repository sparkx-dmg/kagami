import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark' | 'system' | 'sepia' | 'forest' | 'charcoal';
export type AppAccent = 'crimson' | 'grove' | 'amber' | 'mono' | 'sakura' | 'terracotta' | 'wasabi';
export type ReaderMode = 'single' | 'double' | 'webtoon';
export type ReadingDirection = 'rtl' | 'ltr';
export type ImageQuality = 'native' | 'saver';
export type PageFit = 'height' | 'width' | 'natural';

export interface UserSettings {
  theme: AppTheme;
  accent: AppAccent;
  sfwMode: boolean;
  readerMode: ReaderMode;
  readingDirection: ReadingDirection;
  imageQuality: ImageQuality;
  autoplayNext: boolean;
  markReadThreshold: number;
  languages: string[];
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  pageFit: PageFit;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  accent: 'crimson',
  sfwMode: true,
  readerMode: 'webtoon',
  readingDirection: 'rtl',
  imageQuality: 'saver',
  autoplayNext: true,
  markReadThreshold: 90,
  languages: ['en'],
  reducedMotion: false,
  highContrast: false,
  fontSize: 'base',
  pageFit: 'height',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'kagami-settings',
    }
  )
);
