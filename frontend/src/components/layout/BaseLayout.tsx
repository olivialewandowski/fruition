import React, { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { User } from 'firebase/auth';

// Define proper types for user data
interface UserData {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'admin' | 'user';
  university?: string; // Changed from institution to university
  createdAt?: string;
  profileCompleted?: boolean;
}

// Custom hook for profile redirection with proper types
function useProfileRedirection(
  user: User | null, 
  userData: UserData | null, 
  loading: boolean, 
  pathname: string | null
) {
  const redirectionAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Only run this once per component instance
    if (redirectionAttemptedRef.current) return;
    
    // Validate inputs
    if (!user || !userData || loading) return;
    
    // Safely check pathname
    const safePathname = pathname && typeof pathname === 'string' ? pathname : '';
    const isProfileCompletionPage = safePathname.includes('/complete-profile');
    if (isProfileCompletionPage) return;
    
    // Check if this is a Google user
    const isGoogleUser = user.providerData?.some(provider => 
      provider && provider.providerId === 'google.com'
    );
    if (!isGoogleUser) return;
    
    // Check if profile is incomplete
    const hasIncompleteProfile = userData.profileCompleted === false || 
      (!userData.profileCompleted && (!userData.role || !userData.firstName || !userData.lastName || !userData.university));
    
    if (hasIncompleteProfile) {
      console.log('Redirecting to profile completion page. User data:', {
        ...userData,
        // Don't log sensitive data
        email: userData.email ? '***@***' : null
      });
      redirectionAttemptedRef.current = true;
      
      // Use setTimeout to avoid React router errors
      setTimeout(() => {
        try {
          // Use a relative URL for security
          window.location.href = '/development/complete-profile';
        } catch (error) {
          console.error('Error during redirection:', error);
          // Fallback if location change fails
          window.location.replace('/development/complete-profile');
        }
      }, 0);
    }
  }, [user, userData, loading, pathname]);
  
  // Return whether redirection is needed
  return {
    needsRedirection: !!(user && userData && 
      user.providerData?.some(provider => provider && provider.providerId === 'google.com') && 
      (userData.profileCompleted === false || 
       (!userData.profileCompleted && (!userData.role || !userData.firstName || !userData.lastName || !userData.university))) && 
      !pathname?.includes('/complete-profile') && 
      !loading)
  };
}

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
  const [pageTitle, setPageTitle] = useState<string>(title || 'Dashboard');
  const [defaultTabs, setDefaultTabs] = useState<Array<{
    id: string;
    label: string;
    isAvailable?: (role?: string) => boolean;
    count?: number;
  }>>([]);
  
  // Use the custom hook for profile redirection with proper type casting
  const { needsRedirection } = useProfileRedirection(
    user, 
    userData as UserData | null, 
    loading, 
    pathname
  );
  
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
  
  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/development/login');
    }
  }, [user, loading, router]);
  
  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    if (propOnTabChange) {
      propOnTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  }, [propOnTabChange, setInternalActiveTab]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading your profile data...</p>
        <p className="mt-2 text-sm text-gray-500">This may take a moment</p>
      </div>
    );
  }
  
  // Show a temporary loading state if we have a user but no userData yet
  if (user && !userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Synchronizing your profile...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
      </div>
    );
  }
  
  // Show loading state during redirection, but don't attempt to redirect again
  if (needsRedirection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Your profile needs to be completed</p>
        <p className="mt-2 text-sm text-gray-500">Redirecting to profile completion...</p>
      </div>
    );
  }
  
  // Unauthorized state
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <div className="min-h-screen bg-white">
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