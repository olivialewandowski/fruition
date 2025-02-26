'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, userData, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/development/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex overflow-visible relative flex-wrap gap-5 justify-between px-6 py-3.5 w-full bg-purple-50 border border-solid border-neutral-200 max-md:pl-5 max-md:max-w-full">
      <div className="flex gap-10 items-center text-2xl font-medium text-center text-black whitespace-nowrap max-md:max-w-full">
        <div className="grow self-stretch my-auto text-3xl font-extrabold">
          Connect
        </div>
        <div 
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'discover' ? 'bg-purple-200' : ''}`}
          onClick={() => onTabChange('discover')}
        >
          Discover
        </div>
        <div 
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'saved' ? 'bg-purple-200' : ''}`}
          onClick={() => onTabChange('saved')}
        >
          Saved
          {savedCount > 0 && (
            <span className="ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {savedCount}
            </span>
          )}
        </div>
        <div 
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'applied' ? 'bg-purple-200' : ''}`}
          onClick={() => onTabChange('applied')}
        >
          Applied
          {appliedCount > 0 && (
            <span className="ml-2 bg-purple-300 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {appliedCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-7 self-start relative">
        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="w-[34px] h-[34px] rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-medium"
        >
          {auth.currentUser?.email?.[0].toUpperCase() || 'U'}
        </button>
        
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  router.push('/development/profile');
                  setIsProfileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsProfileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 border-t border-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectNavigation; 