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
    <div className="flex min-h-screen bg-bg-app text-text-primary overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative pb-14 md:pb-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-6 md:pt-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
        <BottomNav />
      </div>
      <CommandMenu />
    </div>
  );
}
