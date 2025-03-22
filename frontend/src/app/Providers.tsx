'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/contexts/QueryProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  );
}