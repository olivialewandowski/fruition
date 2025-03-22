'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects } from '@/services/clientProjectService';
import { Project, TimestampValue } from '@/types/project';
import StudentActiveTabApplications from '@/components/dashboard/StudentActiveTabApplications';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectCreationModal from '@/components/projects/ProjectCreationModal';
// Dashboard components 
import { DashboardLayout, DashboardSection } from '@/components/dashboard/layouts/DashboardLayout';
import DashboardCard from '@/components/dashboard/widgets/DashboardCard';
import StatDisplay from '@/components/dashboard/widgets/StatDisplay';
import ClientOnly from '@/components/utils/ClientOnly';

// Define valid tab types for better type safety
type DashboardTabType = 'active' | 'archived';

// Helper function to format timestamps safely
const formatTimestamp = (timestamp: TimestampValue | undefined): string => {
  if (!timestamp) return 'Recent';
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString();
  }
  
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleDateString();
  }
  
  // Handle Firebase Timestamp (has toDate() method)
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch (e) {
      console.warn('Error formatting date', e);
      return 'Recent';
    }
  }
  
  // Default fallback
  return 'Recent';
};

const ProjectsPage: React.FC = () => {
  const { userData, user, loading: authLoading, refreshUserData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTabType>('active');
  const [projectsToShow, setProjectsToShow] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isInitialLoadRef = useRef(true);
  const isRefreshingRef = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Handle initial mount
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Tabs configuration for the navigation
  const dashboardTabs = useMemo(() => [
    {
      id: 'active',
      label: 'Active',
    },
    {
      id: 'archived',
      label: 'Archived',
    }
  ], []);

  // Check for URL tab parameter when component mounts
  useEffect(() => {
    if (!authLoading && hasMounted) {
      const tabParam = searchParams.get('tab') as DashboardTabType | null;
      if (tabParam && ['active', 'archived'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, authLoading, hasMounted]);

  // Fetch projects - combined effect to reduce flickering
  useEffect(() => {
    if (!hasMounted) return;
    
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
  }, [activeTab, user, userData, refreshKey, authLoading, hasMounted]);

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
    
    // Update URL to reflect the active tab - with proper encoding for security
    const encodedTabId = encodeURIComponent(tabId);
    router.push(`/development/dashboard?tab=${encodedTabId}`);
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
  
  // Handle project refresh triggered by children
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Prevent rendering until client-side hydration is complete
  if (!hasMounted) {
    return null;
  }
  
  // Render loading state for the entire page
  if (isLoading) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Dashboard"
            tabs={dashboardTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="flex-grow p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow overflow-auto">
        <TopNavigation 
          title="Dashboard"
          tabs={dashboardTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="flex-grow p-6 bg-gray-50">
          {/* Dashboard Main Content */}
          <DashboardLayout>
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
                <p className="text-gray-500 mt-1">
                  {activeTab === 'active' ? 'Manage your active projects' : 'View your archived projects'}
                </p>
              </div>
              
              <button 
                onClick={toggleModal}
                className="px-4 py-2 text-sm md:text-base text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
              >
                New Project +
              </button>
            </div>
            
            {/* Project Creation Modal - Wrap in ClientOnly to prevent hydration issues */}
            <ClientOnly>
              <ProjectCreationModal isOpen={isModalOpen} onClose={handleModalClose} />
            </ClientOnly>
            
            {/* Dashboard Content based on active tab */}
            {activeTab === 'active' && (
              <>
                {/* For students, show the applications widget and stats */}
                {userData?.role === 'student' && (
                  <>
                    {/* Applications Section - Use the complete widget */}
                    <div className="mb-8">
                      <ClientOnly>
                        <StudentActiveTabApplications onRefresh={handleRefresh} />
                      </ClientOnly>
                    </div>
                  </>
                )}
                
                {/* Projects Grid */}
                <DashboardSection 
                  title="Your Projects" 
                  description="Manage your active projects" 
                  columns={projectsToShow.length > 0 ? 2 : 1}
                >
                  {projectsToShow.length > 0 ? (
                    projectsToShow.map((project) => (
                      <DashboardCard 
                        key={project.id}
                        title={project.title}
                        subtitle={`Status: ${project.status || 'Active'}`}
                      >
                        <div className="py-2">
                          <p className="text-gray-600 mb-2">{project.description || 'No description provided'}</p>
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => router.push(`/development/project/${project.id}`)}
                              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                            >
                              View Project
                            </button>
                          </div>
                        </div>
                      </DashboardCard>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <p className="text-xl text-gray-600">No active projects.</p>
                      <p className="text-gray-500 mt-2">
                        Click &quot;New Project +&quot; to create your first project.
                      </p>
                    </div>
                  )}
                </DashboardSection>
              </>
            )}
            
            {/* Archived Projects Tab */}
            {activeTab === 'archived' && (
              <DashboardSection 
                title="Archived Projects" 
                description="View your archived projects" 
                columns={projectsToShow.length > 0 ? 2 : 1}
              >
                {projectsToShow.length > 0 ? (
                  projectsToShow.map((project) => (
                    <DashboardCard 
                      key={project.id}
                      title={project.title}
                      subtitle={`Archived: ${formatTimestamp(project.updatedAt)}`}
                    >
                      <div className="py-2">
                        <p className="text-gray-600 mb-2">{project.description || 'No description provided'}</p>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => router.push(`/development/project/${project.id}`)}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          >
                            View Project
                          </button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-xl text-gray-600">No archived projects.</p>
                  </div>
                )}
              </DashboardSection>
            )}
          </DashboardLayout>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;