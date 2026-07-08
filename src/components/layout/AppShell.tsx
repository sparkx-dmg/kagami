'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { CommandMenu } from './CommandMenu';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex w-full max-w-full min-h-[100dvh] bg-bg-app text-text-primary overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-[100dvh] relative pb-14 md:pb-0 w-full max-w-full overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 md:p-6 lg:p-8 pt-3 md:pt-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
        <BottomNav />
      </div>
      <CommandMenu />
    </div>
  );
}
