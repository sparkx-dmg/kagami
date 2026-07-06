'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore, AppTheme, AppAccent } from '@/stores/settingsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { Download, Upload, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem, fadeLeftItem } from '@/utils/animations';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
} as const;

const switchRowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
} as const;

const THEMES: { value: AppTheme; label: string; desc: string; bg: string; surface: string; text: string; border: string }[] = [
  { value: 'light',    label: 'Warm Paper',      desc: 'Soft sand whites',   bg: '#FAF9F6', surface: '#F5F3F0', text: '#1C1A17', border: '#E6E4E0' },
  { value: 'dark',     label: 'Obsidian',         desc: 'Pitch-black ink',    bg: '#0B0B0A', surface: '#141413', text: '#F5F5F0', border: '#262624' },
  { value: 'system',   label: 'System',           desc: 'Follows OS setting', bg: '#94A3B8', surface: '#64748B', text: '#F8FAFC', border: '#475569' },
  { value: 'sepia',    label: 'Sepia Parchment',  desc: 'Aged warm paper',    bg: '#F3ECD9', surface: '#EDE3CB', text: '#2C2315', border: '#D6C9A8' },
  { value: 'forest',   label: 'Forest Night',     desc: 'Deep mossy greens',  bg: '#0D1410', surface: '#141C17', text: '#E8F0EA', border: '#253028' },
  { value: 'charcoal', label: 'Pure Charcoal',    desc: 'Neutral slate grey', bg: '#111111', surface: '#1C1C1C', text: '#EFEFEF', border: '#2E2E2E' },
];

const ACCENTS: { value: AppAccent; label: string; hex: string; darkHex: string }[] = [
  { value: 'crimson',    label: 'Kagami Crimson',  hex: '#E11D48', darkHex: '#F43F5E' },
  { value: 'grove',      label: 'Wasabi Grove',    hex: '#16A34A', darkHex: '#10B981' },
  { value: 'amber',      label: 'Amber Minimal',   hex: '#D97706', darkHex: '#F59E0B' },
  { value: 'mono',       label: 'Mono Zen',        hex: '#3D3D3A', darkHex: '#F5F5F0' },
  { value: 'sakura',     label: 'Sakura Pink',     hex: '#E879A0', darkHex: '#F472B6' },
  { value: 'terracotta', label: 'Terracotta',      hex: '#C2622D', darkHex: '#E07A46' },
  { value: 'wasabi',     label: 'Wasabi Leaf',     hex: '#6BAA4D', darkHex: '#86C564' },
];

const FONT_SIZES: { value: 'sm' | 'base' | 'lg' | 'xl'; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { items, history } = useLibraryStore();

  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      settings,
      library: {
        items,
        history,
      },
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `kagami_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.version === 1) {
          if (parsed.settings) {
            updateSettings(parsed.settings);
          }
          if (parsed.library) {
            useLibraryStore.setState({
              items: parsed.library.items || {},
              history: parsed.library.history || {},
            });
          }
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file version.');
        }
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <AppShell>
      <motion.div
        variants={fadeUpItem}
        initial="hidden"
        animate="show"
        className="mb-8"
      >
        <h1 className="text-xl font-bold tracking-tight mb-2 uppercase">Preferences & Settings</h1>
        <p className="text-xs text-text-muted font-mono uppercase">
          Customize your reading environment and accessibility preferences.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-2xl font-mono"
      >
        {/* Color Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Color Theme</CardTitle>
            <CardDescription>Select the background mode that suits your eyes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const isActive = settings.theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => updateSettings({ theme: t.value })}
                    className={`group relative flex flex-col overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer text-left ${
                      isActive
                        ? 'border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                        : 'border-border-divider hover:border-text-muted hover:scale-[1.01]'
                    }`}
                  >
                    {/* Mini palette preview */}
                    <div className="flex h-10 w-full" style={{ backgroundColor: t.bg }}>
                      <div className="w-1/2 h-full" style={{ backgroundColor: t.surface }} />
                      <div className="w-1/2 h-full flex items-center justify-end pr-2">
                        <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: t.text, opacity: 0.7 }} />
                      </div>
                    </div>
                    {/* Border stripe */}
                    <div className="h-px w-full" style={{ backgroundColor: t.border }} />
                    {/* Label */}
                    <div className={`px-2.5 py-2 ${isActive ? 'bg-accent text-accent-foreground' : 'bg-surface text-text-primary'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest truncate">{t.label}</p>
                      <p className={`text-[9px] mt-0.5 truncate ${isActive ? 'opacity-80' : 'text-text-muted'}`}>{t.desc}</p>
                    </div>
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground/30 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Accent Tone</CardTitle>
            <CardDescription>Select the highlight color used for interactive controls and indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACCENTS.map((acc) => {
                const isActive = settings.accent === acc.value;
                // Show the right shade based on current dark/system theme
                const isDarkTheme = ['dark', 'forest', 'charcoal'].includes(settings.theme);
                const swatchColor = isDarkTheme ? acc.darkHex : acc.hex;
                return (
                  <button
                    key={acc.value}
                    onClick={() => updateSettings({ accent: acc.value })}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/5 scale-[1.04]'
                        : 'border-border-divider hover:border-text-muted hover:scale-[1.02] bg-surface/40'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full shadow-md ring-2 ring-offset-2 ring-offset-bg-app transition-all duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: swatchColor,
                        outline: isActive ? `2px solid ${swatchColor}` : '2px solid transparent',
                      }}
                    />
                    <div className="text-center">
                      <p className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                        {acc.label.split(' ').slice(-1)[0]}
                      </p>
                      <p className="text-[8px] text-text-muted font-mono mt-0.5">{swatchColor}</p>
                    </div>
                    {isActive && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: swatchColor }}>
                        <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility & Options */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Accessibility Options</CardTitle>
              <CardDescription>Preferences to adapt Kagami to your device and readability needs.</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {/* SFW Toggle */}
                <motion.div variants={switchRowVariants} className="flex items-center justify-between py-2 border-b border-border-divider/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase">Content Safety (SFW Mode)</span>
                    <span className="text-[10px] text-text-muted font-sans mt-0.5">
                      Filters out sexually explicit titles, covers, and chapters.
                    </span>
                  </div>
                  <Switch
                    checked={settings.sfwMode}
                    onCheckedChange={(checked) => updateSettings({ sfwMode: checked })}
                  />
                </motion.div>

                {/* Reduced Motion */}
                <motion.div variants={switchRowVariants} className="flex items-center justify-between py-2 border-b border-border-divider/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase">Disable Animations</span>
                    <span className="text-[10px] text-text-muted font-sans mt-0.5">
                      Minimizes page-turn slides and loading transitions.
                    </span>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  />
                </motion.div>

                {/* High Contrast */}
                <motion.div variants={switchRowVariants} className="flex items-center justify-between py-2 border-b border-border-divider/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase">High Contrast Borders</span>
                    <span className="text-[10px] text-text-muted font-sans mt-0.5">
                      Darkens borders and optimizes readability.
                    </span>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  />
                </motion.div>

                {/* Font Size Selector */}
                <motion.div variants={switchRowVariants} className="flex flex-col space-y-2 py-2">
                  <span className="text-xs font-semibold uppercase">Application Font Size</span>
                  <div className="grid grid-cols-4 gap-2">
                    {FONT_SIZES.map((sz) => (
                      <motion.div
                        key={sz.value}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                      >
                        <Button
                          variant={settings.fontSize === sz.value ? 'primary' : 'outline'}
                          onClick={() => updateSettings({ fontSize: sz.value })}
                          className="w-full text-[10px]"
                        >
                          {sz.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Sync & Backups */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Shield className="w-4 h-4 text-accent" />
                </motion.div>
                <CardTitle className="text-sm">Data Backup & Sync</CardTitle>
              </div>
              <CardDescription>Export your library progress and settings to a JSON file, or restore from a previous backup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                variants={fadeLeftItem}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border-divider/50"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase">Library Statistics</span>
                  <span className="text-[10px] text-text-muted font-sans mt-0.5">
                    Followed titles: {Object.keys(items).length} • Read checkpoints: {Object.values(history).flat().length}
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpItem}
                className="flex flex-wrap gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 440, damping: 22 }}
                >
                  <Button variant="outline" size="sm" onClick={handleExportBackup} className="text-[10px] flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Export Data Backup
                  </Button>
                </motion.div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload Backup File"
                  />
                  <motion.div
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 440, damping: 22 }}
                  >
                    <Button variant="outline" size="sm" className="text-[10px] flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5" /> Import Data Backup
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reset preferences */}
        <motion.div
          variants={fadeUpItem}
          className="flex justify-end"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 440, damping: 22 }}
          >
            <Button variant="destructive" size="sm" onClick={resetSettings}>
              Reset to Default Settings
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
