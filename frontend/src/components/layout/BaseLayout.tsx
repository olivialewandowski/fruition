import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
  tabs?: Array<{
    id: string;
    label: string;
    isAvailable?: (role?: string) => boolean;
    count?: number;
  }>;
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function BaseLayout({ 
  children, 
  title, 
  tabs, 
  defaultTab,
  activeTab: propActiveTab,
  onTabChange: propOnTabChange
}: BaseLayoutProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [internalActiveTab, setInternalActiveTab] = useState<string | undefined>(defaultTab);
  
  // Use the prop activeTab if provided, otherwise use internal state
  const activeTab = propActiveTab || internalActiveTab;
  
  // Determine if we're on the connect page
  const isConnectPage = pathname?.includes('/connect');
  
  // Set default title based on the current page
  useEffect(() => {
    if (!title) {
      if (isConnectPage) {
        setPageTitle('Connect');
      } else {
        setPageTitle('Dashboard');
      }
    } else {
      setPageTitle(title);
    }
  }, [title, isConnectPage]);
  
  const [pageTitle, setPageTitle] = useState<string>(title || 'Dashboard');
  
  // Create default tabs based on the current page and user role
  useEffect(() => {
    if (!tabs || tabs.length === 0) {
      if (isConnectPage) {
        // Connect tabs are the same for all users (only students have access)
        setDefaultTabs([
          { id: 'discover', label: 'Discover' },
          { id: 'saved', label: 'Saved' },
          { id: 'applied', label: 'Applied' }
        ]);
        
        // Set default active tab
        if (!activeTab) {
          setInternalActiveTab('discover');
        }
      } else {
        // Dashboard tabs differ based on user role
        if (userData?.role === 'student') {
          setDefaultTabs([
            { id: 'active', label: 'Active' },
            { id: 'applied', label: 'Applied' },
            { id: 'archived', label: 'Archived' }
          ]);
        } else {
          setDefaultTabs([
            { id: 'active', label: 'Active' },
            { id: 'archived', label: 'Archived' }
          ]);
        }
        
        // Set default active tab
        if (!activeTab) {
          setInternalActiveTab('active');
        }
      }
    }
  }, [tabs, userData?.role, isConnectPage, activeTab]);
  
  const [defaultTabs, setDefaultTabs] = useState<Array<{
    id: string;
    label: string;
    isAvailable?: (role?: string) => boolean;
    count?: number;
  }>>([]);
  
  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/development/login');
    }
  }, [user, loading, router]);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (propOnTabChange) {
      propOnTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };
  
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
  
  // Check if the user has permission to access the current page
  if (isConnectPage && userData?.role !== 'student' && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">
            The Connect feature is only available for Student accounts.
          </p>
          <button
            onClick={() => router.push('/development/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen pt-3">
        <div className="h-screen pl-3">
          <Sidebar />
        </div>
        
        <div className="flex-1 transition-all duration-300 overflow-y-auto pl-6">
          <div className="pr-4">
            <TopNavigation 
              title={pageTitle} 
              tabs={tabs || defaultTabs}
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