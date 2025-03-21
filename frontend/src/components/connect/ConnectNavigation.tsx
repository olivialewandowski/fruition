import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Toggle switch component for "Include Student Projects"
const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}> = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
          enabled ? 'bg-violet-700' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

interface ConnectNavigationProps {
  activeTab: 'discover' | 'saved' | 'applied';
  onTabChange: (tab: 'discover' | 'saved' | 'applied') => void;
  savedCount?: number;
  appliedCount?: number;
}

const ConnectNavigation: React.FC<ConnectNavigationProps> = ({ 
  activeTab, 
  onTabChange,
  savedCount = 0,
  appliedCount = 0
}) => {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [includeStudentProjects, setIncludeStudentProjects] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, userData } = useAuth();

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

  return (
    <div className="relative z-10 w-full mt-3">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 pb-3 pl-1 pr-4 mt-0 mb-6 w-full max-w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 md:p-6 w-full">
          {/* Left side - Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Connect</h1>
          </div>

          {/* Center - Navigation Tabs */}
          <div className="flex items-center space-x-2 md:space-x-4 self-start md:self-center mt-4 md:mt-0">
            <button 
              className={`px-4 md:px-8 py-3 text-base md:text-lg font-medium rounded-lg
                ${activeTab === 'discover' 
                  ? 'bg-violet-100 text-violet-900' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => onTabChange('discover')}
            >
              Discover
            </button>
            <button 
              className={`px-4 md:px-8 py-3 text-base md:text-lg font-medium rounded-lg flex items-center
                ${activeTab === 'saved' 
                  ? 'bg-violet-100 text-violet-900' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => onTabChange('saved')}
            >
              Saved
              {savedCount > 0 && (
                <span className="ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
            <button 
              className={`px-4 md:px-8 py-3 text-base md:text-lg font-medium rounded-lg flex items-center
                ${activeTab === 'applied' 
                  ? 'bg-violet-100 text-violet-900' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => onTabChange('applied')}
            >
              Applied
              {appliedCount > 0 && (
                <span className="ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {appliedCount}
                </span>
              )}
            </button>

            {/* Toggle switch for including student projects */}
            <div className="ml-4">
              <ToggleSwitch
                enabled={includeStudentProjects}
                onChange={setIncludeStudentProjects}
                label="Include Student Projects"
              />
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-3 md:space-x-5 self-end md:self-center mt-4 md:mt-0">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <BellIcon className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                  {userData?.firstName?.charAt(0) || 'U'}
                </div>
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
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

export default ConnectNavigation;