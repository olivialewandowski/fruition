'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * A centralized provider for TanStack Query
 * This enables efficient data fetching and caching throughout the application
 */
const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Create a client that persists across renders
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Common defaults for all queries
        staleTime: 60 * 1000, // 1 minute before data is considered stale
        gcTime: 5 * 60 * 1000, // 5 minutes before unused data is garbage collected
        refetchOnWindowFocus: true, // Auto-refetch when window is focused
        refetchOnMount: true, // Refetch on component mount
        retry: 1, // Only retry failed queries once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider; 