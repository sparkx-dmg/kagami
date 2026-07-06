import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoriesPage from '@/app/categories/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/categories',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Categories Bento page', () => {
  it('renders bento category items and options list correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    // Verify header title and description
    const headerTitle = screen.getByText(/Genre Directory/i);
    expect(headerTitle).toBeInTheDocument();

    const descText = screen.getByText(/Browse genres, themes/i);
    expect(descText).toBeInTheDocument();

    // Verify some major categories are present
    const actionCard = screen.getByText('Action');
    expect(actionCard).toBeInTheDocument();

    const romanceCard = screen.getByText('Romance');
    expect(romanceCard).toBeInTheDocument();

    const scifiCard = screen.getByText('Sci-Fi');
    expect(scifiCard).toBeInTheDocument();
  });
});
