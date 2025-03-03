import React, { ReactNode, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
  tabs?: Array<{
    id: string;
    label: string;
    isAvailable?: (role?: string) => boolean;
  }>;
  defaultTab?: string;
}

export default function BaseLayout({ children, title, tabs, defaultTab }: BaseLayoutProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultTab);
  
  // Authentication check
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/development/login');
    }
  }, [user, loading, router]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Unauthorized state
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h2>
          <p className="text-gray-700 mb-6">Please log in to access this page.</p>
          <button
            onClick={() => router.push('/development/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen pt-3">
        <div className="h-screen pl-3">
          <Sidebar />
        </div>
        
        <div className="flex-1 transition-all duration-300 overflow-y-auto pl-6">
          <div className="pr-4">
            <TopNavigation 
              title={title} 
              tabs={tabs} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            
            <div className="pr-4 pb-8 mt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}