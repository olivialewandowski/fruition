'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects to the main dashboard since we now have integrated grid layout directly
 */
export default function DashboardGridRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/development/dashboard');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 