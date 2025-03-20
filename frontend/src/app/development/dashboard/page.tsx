'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import ProjectSection from '@/components/dashboard/ProjectSection';
import ProjectCreationModal from '@/components/projects/ProjectCreationModal';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects } from '@/services/clientProjectService';
import { Project } from '@/types/project';
import { getStudentApplications } from '@/services/studentService';
import StudentAppliedProjectsTab from '@/components/dashboard/StudentAppliedProjectsTab';
import StudentActiveTabApplications from '@/components/dashboard/StudentActiveTabApplications';
import { useSearchParams, useRouter } from 'next/navigation';

// Define valid tab types for better type safety
type DashboardTabType = 'active' | 'applied' | 'archived';

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
  
  // Use useMemo to avoid recreating tabs on each render
  const tabs = useMemo(() => {
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
  }, [userData?.role]);

  // Check for URL tab parameter when component mounts
  useEffect(() => {
    if (!authLoading) {
      const tabParam = searchParams.get('tab') as DashboardTabType | null;
      if (tabParam && ['active', 'applied', 'archived'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, authLoading]);

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
        
        const projects = await getUserProjects(activeTab as 'active' | 'archived' | 'applied');
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
    if (!['active', 'applied', 'archived'].includes(tabId)) {
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
  
  // Rendered component based on loading state
  const renderLoadingState = () => (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading projects...</p>
    </div>
  );

  return (
    <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow overflow-auto">
        <TopNavigation 
          title="Dashboard"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="px-6 py-5">
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
                {activeTab === 'active' && (
                  <>
                    {/* Student Applications Section (only for students) */}
                    {userData?.role === 'student' && (
                      <StudentActiveTabApplications onRefresh={handleRefresh} />
                    )}
                    
                    {/* Project List */}
                    <ProjectSection title="" projects={projectsToShow} hideTitle={true} />
                    
                    {projectsToShow.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-gray-600">No active projects.</p>
                        <p className="text-gray-500 mt-2">
                          Click &quot;New Project +&quot; to create your first project.
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'applied' && userData?.role === 'student' && (
                  <div className="space-y-6">
                    {/* Applied Projects Tab */}
                    <StudentAppliedProjectsTab 
                      onRefresh={handleRefresh} 
                      hideTopChoicesManager={true}
                    />
                  </div>
                )}
                
                {activeTab === 'archived' && (
                  <>
                    {/* Archived Projects */}
                    {projectsToShow.length > 0 ? (
                      <ProjectSection title="" projects={projectsToShow} hideTitle={true} />
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-xl text-gray-600">No archived projects.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;