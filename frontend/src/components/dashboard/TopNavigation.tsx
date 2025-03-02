'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const TopNavigation: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
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
    <div className="relative z-10">
      <div className={`
        bg-white shadow-md rounded-2xl border border-gray-200 
        pb-3 pl-1 pr-4 mt-0
      `}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 md:p-6">
          {/* Left side - Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          
          {/* Center - Navigation */}
          <div className="flex items-center space-x-2 md:space-x-4 self-start md:self-center mt-4 md:mt-0">
            <button className="px-4 md:px-8 py-3 text-base md:text-lg font-medium bg-violet-100 text-violet-900 rounded-lg">
              Active
            </button>
            <button className="px-4 md:px-8 py-3 text-base md:text-lg font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Applied
            </button>
            <button className="px-4 md:px-8 py-3 text-base md:text-lg font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Archived
            </button>
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
                  O
                </div>
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">Olive Mountain</p>
                    <p className="text-sm text-gray-500">olive@example.com</p>
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