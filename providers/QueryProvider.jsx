'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,

            // Retry configuration
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Default stale time - will be overridden per query
            staleTime: 5 * 60 * 1000, // 5 minutes default

            // Cache time - how long to keep unused data in cache
            gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
