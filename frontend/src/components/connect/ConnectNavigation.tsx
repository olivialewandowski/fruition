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
    <div className="flex overflow-visible relative flex-wrap gap-5 justify-center px-6 py-3.5 w-full bg-white border border-solid border-neutral-200 shadow-md rounded-2xl max-w-[100%] mx-auto mb-4">
      <div className="flex gap-10 items-center text-lg text-center text-violet-900 whitespace-nowrap max-md:max-w-full">
        <div 
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'discover' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'}`}
          onClick={() => onTabChange('discover')}
        >
          Discover
        </div>
        <div 
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'saved' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'}`}
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
          className={`self-stretch px-5 py-2 rounded-3xl max-md:px-5 cursor-pointer ${activeTab === 'applied' ? 'bg-purple-200 font-semibold text-violet-900' : 'font-medium text-gray-700'}`}
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
    </div>
  );
};

export default ConnectNavigation; 