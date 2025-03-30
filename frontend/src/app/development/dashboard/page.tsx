// src/app/development/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects } from '@/services/clientProjectService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ClientOnly from '@/components/utils/ClientOnly';
import QueryProvider from '@/contexts/QueryProvider';

// Student dashboard components
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { Project } from '@/types/project';
import ProjectCreationModal from '@/components/projects/ProjectCreationModal';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Faculty Dashboard Handler - Simply redirects to the appropriate page
function FacultyDashboardHandler() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user has any projects and redirect
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const projects = await getUserProjects('active');
        
        if (projects && projects.length > 0) {
          // User has projects, redirect to the first one
          router.push(`/development/projects/${projects[0].id}`);
        } else {
          // User has no projects, redirect to onboarding
          router.push('/development/faculty-onboarding');
        }
      } catch (error) {
        console.error("Error checking for user projects:", error);
        // On error, redirect to onboarding to ensure a path forward
        router.push('/development/faculty-onboarding');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && !loading) {
      checkAndRedirect();
    }
  }, [user, loading, router]);
  
  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Redirecting to your projects...</p>
      </div>
    </div>
  );
}

// Define valid tab types for better type safety
type DashboardTabType = 'active' | 'archived';

// Student Dashboard Component
function StudentDashboard() {
  const { userData, user, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTabType>('active');
  const [projectsToShow, setProjectsToShow] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isInitialLoadRef = useRef(true);
  const isRefreshingRef = useRef(false);
  
  // Use useMemo to avoid recreating tabs on each render
  const tabs = useMemo(() => {
    return [
      { id: 'active', label: 'Active' },
      { id: 'archived', label: 'Archived' }
    ];
  }, []);

  // Fetch projects - combined effect to reduce flickering
  useEffect(() => {
    const fetchProjects = async () => {
      // Don't show loading indicator for refreshes, only for initial load or tab changes
      if (isInitialLoadRef.current) {
        setIsLoading(true);
      }
      
      try {
        if (!user) return;
        
        // If we're refreshing from modal close, wait for userData to be up-to-date
        if (isRefreshingRef.current && userData?.activeProjects) {
          isRefreshingRef.current = false;
        }
        
        const projects = await getUserProjects(activeTab as 'active' | 'archived');
        setProjectsToShow(projects || []);
        
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error("Error fetching projects:", error);
        console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
        setProjectsToShow([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchProjects();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [activeTab, user, userData, refreshKey, authLoading]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    // Validate tab ID for type safety
    if (!['active', 'archived'].includes(tabId)) {
      console.error(`Invalid tab ID: ${tabId}`);
      return;
    }
    
    // For tab changes, we do want to show loading
    isInitialLoadRef.current = true;
    setActiveTab(tabId as DashboardTabType);
  };

  // Toggle modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Close modal and refresh projects
  const handleModalClose = () => {
    setIsModalOpen(false);
    isRefreshingRef.current = true;
    
    // Add a small delay before triggering the refresh
    setTimeout(() => {
      refreshUserData().then(() => {
        setRefreshKey(prev => prev + 1);
      });
    }, 500); // 500ms delay to avoid UI glitches
  };
  
  // Rendered component based on loading state
  const renderLoadingState = () => (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading projects...</p>
    </div>
  );

  // Component to render a project card
  const ProjectCard = ({ project }: { project: Project }) => (
    <div 
      onClick={() => router.push(`/development/projects/${project.id}`)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{project.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status === 'active' ? 'Active' : 'Archived'}
          </span>
        </div>
        
        <p className="text-gray-600 line-clamp-3 mb-4">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.keywords?.slice(0, 3).map((keyword, index) => (
            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
              {keyword}
            </span>
          ))}
          {project.keywords && project.keywords.length > 3 && (
            <span className="text-xs text-gray-500">
              +{project.keywords.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600">
              {project.teamMembers?.length || 0} team members
            </span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600">
              {project.applicationCount || 0} applications
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavigation 
          title="Projects"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <div className="flex-1 overflow-auto px-6 py-5">
          {/* Page Header */}
          <div className="flex flex-wrap gap-3 md:gap-5 justify-between mb-4 md:mb-5">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">Your Projects</div>
            <div className="flex gap-2 md:gap-4">
              <button 
                onClick={toggleModal}
                className="px-3 md:px-6 py-2 text-sm md:text-lg text-white bg-violet-800 rounded-full hover:bg-violet-700 transition-colors"
              >
                New Project +
              </button>
            </div>
          </div>
          
          {/* Project Creation Modal */}
          <ProjectCreationModal isOpen={isModalOpen} onClose={handleModalClose} />
          
          {/* Project Sections */}
          <div className="mt-6">
            {isLoading ? (
              renderLoadingState()
            ) : (
              <>
                {/* Projects grid */}
                {projectsToShow.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsToShow.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <p className="text-xl text-gray-600">
                      {activeTab === 'active' ? 'No active projects.' : 'No archived projects.'}
                    </p>
                    {activeTab === 'active' && (
                      <p className="text-gray-500 mt-2">
                        Click &quot;New Project +&quot; to create your first project.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard component that renders the appropriate dashboard based on role
const DashboardPage: React.FC = () => {
  const { userData, loading } = useAuth();

  // Show loading while determining the user's role
  if (loading) {
    return <LoadingFallback />;
  }

  // Render the appropriate dashboard based on user role
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QueryProvider>
        {userData?.role === 'faculty' || userData?.role === 'admin' ? (
          <FacultyDashboardHandler />
        ) : (
          <StudentDashboard />
        )}
      </QueryProvider>
    </Suspense>
  );
};

export default DashboardPage;