import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarState } from '@/hooks/useSidebarState';
import { auth } from '@/config/firebase';

// Heroicons imports
import { 
  HomeIcon, 
  InboxIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  BookOpenIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Cog6ToothIcon,
  XMarkIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, isCollapsed, isMobile }) => {
  return (
    <Link href={href} className="w-full">
      <div className={`
        flex items-center px-4 py-3 rounded-lg transition-all duration-200
        ${isActive ? 'bg-violet-100 text-violet-900' : 'hover:bg-purple-50 text-gray-700'}
        ${isCollapsed && !isMobile ? 'justify-center' : 'gap-3'}
      `}>
        <div className="w-6 h-6 min-w-[1.5rem] flex items-center justify-center">
          {icon}
        </div>
        {(!isCollapsed || isMobile) && (
          <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
        )}
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen } = useSidebarState();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname, setMobileOpen, isMobileOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, setMobileOpen]);
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/development/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/development/dashboard', icon: <HomeIcon className="w-5 h-5" />, label: 'Dashboard' },
    { href: '#', icon: <InboxIcon className="w-5 h-5" />, label: 'Inbox' },
    { href: '#', icon: <DocumentTextIcon className="w-5 h-5" />, label: 'Projects' },
    { href: '#', icon: <UserGroupIcon className="w-5 h-5" />, label: 'Forums' },
    { href: '#', icon: <CurrencyDollarIcon className="w-5 h-5" />, label: 'Grants' },
    { href: '#', icon: <BookOpenIcon className="w-5 h-5" />, label: 'Publications' },
    { href: '/development/connect', icon: <LinkIcon className="w-5 h-5" />, label: 'Connect' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`
        transition-all duration-300 h-full
        ${isMobileOpen ? 'fixed inset-y-0 left-0 p-0 w-full md:w-auto' : 'p-0 left-0'}
        ${!isMobileOpen && !isCollapsed ? 'md:w-64' : ''}
        ${!isMobileOpen && isCollapsed ? 'md:w-24' : ''}
        ${!isMobileOpen && 'hidden md:block'}
      `}>
        {/* Actual sidebar with rounded corners */}
        <div className={`
          flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 mt-0
          ${isCollapsed && !isMobileOpen ? 'w-16' : 'w-full md:w-64'}
          ${isMobileOpen ? 'mx-4 my-4 h-[calc(100%-2rem)]' : 'h-full'}
        `}>
          {/* Logo */}
          <div className={`
            flex items-center h-16 px-4 border-b border-gray-200 rounded-t-2xl
            ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'}
          `}>
            {(!isCollapsed || isMobileOpen) && (
              <div className="text-2xl font-extrabold tracking-tighter text-violet-900">
                fruition
              </div>
            )}
            {isCollapsed && !isMobileOpen && (
              <div className="text-2xl font-extrabold tracking-tighter text-violet-900">
                f
              </div>
            )}
            
            {isMobileOpen ? (
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hidden md:block"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-5 h-5" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* General section label */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-4 pt-6 pb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                GENERAL
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
                isMobile={isMobileOpen}
              />
            ))}
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200">
            <div className={`
              flex items-center p-4
              ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'}
            `}>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                    {user?.displayName?.charAt(0) || 'O'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{user?.displayName || 'Olive Mountain'}</span>
                    <span className="text-xs text-gray-500">View profile</span>
                  </div>
                </div>
              )}
              {isCollapsed && !isMobileOpen && (
                <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                  {user?.displayName?.charAt(0) || 'O'}
                </div>
              )}
              {(!isCollapsed || isMobileOpen) && (
                <button className="p-1 rounded-md text-gray-500 hover:bg-gray-100">
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Logout Button */}
            <div className={`px-3 pb-4 ${isCollapsed && !isMobileOpen ? 'text-center' : ''} rounded-b-2xl`}>
              <button 
                onClick={handleSignOut}
                className={`
                  w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors
                  ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-start gap-3'}
                `}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-medium">Log out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 md:hidden z-20 bg-violet-600 text-white p-3 rounded-full shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};

export default Sidebar;