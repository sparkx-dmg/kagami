'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,         // 5 min — no refetch if fresh
        gcTime: 15 * 60 * 1000,            // 15 min garbage collect
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Retry with exponential backoff; always retry 429s but with a long delay
        retry: (failureCount, error: unknown) => {
          const status =
            error && typeof error === 'object' && 'status' in error
              ? (error as { status: number }).status
              : 0;
          if (status === 404) return false;   // never retry not-found
          if (status === 429) return failureCount < 2; // retry 429 twice with backoff
          return failureCount < 3;
        },
        retryDelay: (attempt, error: unknown) => {
          const status =
            error && typeof error === 'object' && 'status' in error
              ? (error as { status: number }).status
              : 0;
          // Rate limited — wait longer before retry
          if (status === 429) return Math.min(5000 * 2 ** attempt, 30000);
          // Exponential backoff: 1s, 2s, 4s …
          return Math.min(1000 * 2 ** attempt, 10000);
        },
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
