// src/components/layout/FacultySidebar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarState } from '@/hooks/useSidebarState';
import { auth } from '@/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Project } from '@/types/project';

// Heroicons imports
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  PlusCircleIcon
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
        ${isActive ? 'bg-gray-100 text-violet-700' : 'hover:bg-gray-50 text-gray-700'}
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

const FacultySidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen } = useSidebarState();
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  // Extract the projectId from pathname
  const projectIdMatch = pathname?.match(/\/development\/projects\/([^\/]+)/);
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null;
  
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
  
  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user || !user.uid) return;
      
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("facultyId", "==", user.uid)
        );
        
        const snapshot = await getDocs(projectsQuery);
        const projects: Project[] = [];
        
        snapshot.forEach((doc) => {
          projects.push({ 
            id: doc.id,
            ...doc.data() 
          } as Project);
        });
        
        setUserProjects(projects);
        
        // Set current project based on URL or first project
        if (currentProjectId) {
          const matchedProject = projects.find(p => p.id === currentProjectId);
          if (matchedProject) {
            setCurrentProject(matchedProject);
          }
        } else if (projects.length > 0 && !currentProject) {
          setCurrentProject(projects[0]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [user, currentProjectId]);
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/development/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Generate navigation items based on the current project
  const projectNavItems = currentProject ? [
    {
      href: `/development/projects/${currentProject.id}`,
      icon: <DocumentTextIcon className="w-5 h-5" />,
      label: 'Details'
    },
    {
      href: `/development/projects/${currentProject.id}/positions`,
      icon: <DocumentDuplicateIcon className="w-5 h-5" />,
      label: 'Positions'
    },
    {
      href: `/development/projects/${currentProject.id}/applications`,
      icon: <DocumentPlusIcon className="w-5 h-5" />,
      label: 'Applications'
    },
    {
      href: `/development/projects/${currentProject.id}/team`,
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: 'Team'
    }
  ] : [];

  // Find the base route for projects
  const isInProjectsRoute = pathname?.includes('/development/projects/');
  
  // Toggle project dropdown
  const toggleProjectDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
  };
  
  // Switch to a different project
  const switchProject = (project: Project) => {
    setCurrentProject(project);
    setIsProjectDropdownOpen(false);
    router.push(`/development/projects/${project.id}`);
  };
  
  // Create a new project
  const handleCreateProject = () => {
    setIsProjectDropdownOpen(false);
    router.push('/development/projects/create');
  };

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
          flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-md transition-all duration-300 mt-0
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
                NYU
              </div>
            )}
            {isCollapsed && !isMobileOpen && (
              <div className="text-2xl font-extrabold tracking-tighter text-violet-900">
                N
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

          {/* Project selector */}
          {!isCollapsed || isMobileOpen ? (
            <div className="px-3 pt-6 pb-2">
              <div className="relative">
                <button 
                  onClick={toggleProjectDropdown}
                  className="w-full flex items-center justify-between px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium truncate max-w-[150px]">
                      {currentProject ? currentProject.title : 'Select a Project'}
                    </span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isProjectDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Project dropdown */}
                {isProjectDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul className="py-1 max-h-60 overflow-auto">
                      {userProjects.map((project) => (
                        <li key={project.id}>
                          <button 
                            onClick={() => switchProject(project)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentProject?.id === project.id ? 'bg-violet-50 text-violet-800 font-medium' : 'text-gray-700'}`}
                          >
                            {project.title}
                          </button>
                        </li>
                      ))}
                      <li className="border-t border-gray-100">
                        <button 
                          onClick={handleCreateProject}
                          className="w-full text-left px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 flex items-center"
                        >
                          <PlusCircleIcon className="w-5 h-5 mr-2" />
                          Create New Project
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-6 pb-2">
              <button
                onClick={() => router.push('/development/dashboard')}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-violet-100 text-violet-800 hover:bg-violet-200"
              >
                <DocumentTextIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Project navigation */}
          {currentProject && isInProjectsRoute && (
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
              {projectNavItems.map((item) => (
                <NavItem
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                  isCollapsed={isCollapsed}
                  isMobile={isMobileOpen}
                />
              ))}
            </div>
          )}
          
          {/* Spacer */}
          <div className="flex-1"></div>

          {/* User Profile */}
          <div className="border-t border-gray-200">
            <div className={`
              flex items-center p-4
              ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'}
            `}>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                    {userData?.firstName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.firstName 
                        ? `${userData.firstName} ${userData.lastName || ''}` 
                        : user?.displayName || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
                    </span>
                  </div>
                </div>
              )}
              {isCollapsed && !isMobileOpen && (
                <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-violet-200 flex items-center justify-center text-violet-800 font-semibold">
                  {userData?.firstName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              {(!isCollapsed || isMobileOpen) && (
                <button 
                  onClick={() => router.push('/development/profile')}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                >
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
        className="fixed bottom-4 right-4 md:hidden z-20 bg-violet-600 text-white p-3 rounded-full shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};

export default FacultySidebar;