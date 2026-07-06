import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

// Mock Next.js usePathname and useRouter
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('App Layout Navigation Components', () => {
  it('renders Header with brand logo and dashboard link', () => {
    render(<Header />);
    const logo = screen.getByText(/Kagami/i);
    expect(logo).toBeInTheDocument();
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
  });

  it('renders BottomNav on mobile views', () => {
    render(<BottomNav />);
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
  });
});
