import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/config/firebase';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface TopNavigationProps {
  title?: string;
  tabs?: Array<{
    id: string;
    label: string;
    isAvailable?: (role?: string) => boolean;
    count?: number;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

// Toggle switch component for "Include Student Projects"
const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}> = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-700">{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-5 w-9 items-center rounded-full focus:outline-none ${
          enabled ? 'bg-violet-700' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  title = 'Dashboard', 
  tabs = [],
  activeTab,
  onTabChange
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [includeStudentProjects, setIncludeStudentProjects] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useAuth();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/development/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Determine if we're on the connect page
  const isConnectPage = pathname?.includes('/connect');
  
  // Determine dashboard tabs based on user role
  const getDashboardTabs = () => {
    if (userData?.role === 'student') {
      return [
        { id: 'active', label: 'Active' },
        { id: 'applied', label: 'Applied' },
        { id: 'archived', label: 'Archived' }
      ];
    } else {
      return [
        { id: 'active', label: 'Active' },
        { id: 'archived', label: 'Archived' }
      ];
    }
  };
  
  // Determine connect tabs
  const getConnectTabs = () => {
    return [
      { id: 'discover', label: 'Discover' },
      { id: 'saved', label: 'Saved' },
      { id: 'applied', label: 'Applied' }
    ];
  };
  
  // Select tabs based on current page
  const dynamicTabs = isConnectPage ? getConnectTabs() : getDashboardTabs();
  
  // Combine provided tabs with dynamic tabs
  const displayTabs = tabs.length > 0 ? tabs : dynamicTabs;
  
  // Filter tabs based on user role if isAvailable function is provided
  const availableTabs = displayTabs.filter(tab => 
    !('isAvailable' in tab) || (tab as {isAvailable?: (role?: string) => boolean}).isAvailable?.(userData?.role)
  );
  
  return (
    <div className="relative z-10">
      <div className={`
        bg-white shadow-md rounded-2xl border border-gray-200 
        pb-2 pl-1 pr-4 mt-0
      `}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4">
          {/* Left side - Title */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {isConnectPage ? 'Connect' : title}
            </h1>
          </div>
          
          {/* Center - Navigation Tabs */}
          <div className="flex items-center space-x-2 md:space-x-4 self-start md:self-center mt-2 md:mt-0">
            {availableTabs.map(tab => {
              // Use type assertion to handle the count property
              const tabWithCount = tab as { id: string; label: string; count?: number };
              
              return (
                <button 
                  key={tab.id}
                  className={`px-3 md:px-6 py-2 text-sm md:text-base font-medium rounded-lg flex items-center
                    ${activeTab === tab.id 
                      ? 'bg-violet-100 text-violet-900' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                >
                  {tab.label}
                  {tabWithCount.count !== undefined && tabWithCount.count > 0 && (
                    <span className="ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {tabWithCount.count}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Toggle switch for including student projects (only for Connect page) */}
            {isConnectPage && userData?.role === 'student' && (
              <div className="ml-2 hidden md:block">
                <ToggleSwitch
                  enabled={includeStudentProjects}
                  onChange={setIncludeStudentProjects}
                  label="Include Student Projects"
                />
              </div>
            )}
          </div>
          
          {/* Right side - User menu */}
          <div className="flex items-center space-x-2 md:space-x-3 self-end md:self-center mt-2 md:mt-0">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
              <BellIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            
            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                  {userData?.firstName?.charAt(0) || 'U'}
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">
                      {userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}` : 'User'}
                    </p>
                    <p className="text-sm text-gray-500">{userData?.email || ''}</p>
                    <p className="text-xs font-medium text-violet-700 mt-1">
                      {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        router.push('/development/profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push('/development/settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-5 py-3 text-base text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-5 py-3 text-base text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;