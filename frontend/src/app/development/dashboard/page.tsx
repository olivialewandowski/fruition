'use client';

import React, { useState, useEffect } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import ProjectSection from '@/components/dashboard/ProjectSection';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Sample projects import 
import { yourProjects, facultyProjects, peerProjects } from '@/data/sampleProjects';

export default function DashboardPage() {
  const { userData, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [projectsToShow, setProjectsToShow] = useState<any[]>([]);
  const [isPageReady, setIsPageReady] = useState(false);

  // Define tabs based on user role
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

  // Set page ready state when user data is loaded
  useEffect(() => {
    if (!loading && userData) {
      // Add a small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setIsPageReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading, userData]);

  // Update displayed projects when tab changes or user data loads
  useEffect(() => {
    if (!userData) return;

    // For student role
    if (userData.role === 'student') {
      switch (activeTab) {
        case 'active':
          setProjectsToShow(yourProjects);
          break;
        case 'applied':
          // In a real implementation, this would be projects the student has applied to
          setProjectsToShow(yourProjects.slice(0, 1));
          break;
        case 'archived':
          // In a real implementation, this would be archived projects
          setProjectsToShow([]);
          break;
        default:
          setProjectsToShow(yourProjects);
      }
    } 
    // For faculty role
    else if (userData.role === 'faculty' || userData.role === 'admin') {
      switch (activeTab) {
        case 'active':
          setProjectsToShow(facultyProjects);
          break;
        case 'archived':
          // In a real implementation, this would be archived projects
          setProjectsToShow([]);
          break;
        default:
          setProjectsToShow(facultyProjects);
      }
    }
  }, [activeTab, userData]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Show loading state if page is not ready
  if (!isPageReady) {
    return (
      <BaseLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="mb-4">
              <LoadingSpinner size="medium" />
            </div>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout 
      title="Dashboard" 
      tabs={getDashboardTabs()}
      defaultTab="active"
    >
      {/* Page Header */}
      <div className="flex flex-wrap gap-3 md:gap-5 justify-between mb-4 md:mb-5">
        <div className="text-2xl md:text-3xl font-bold text-gray-900">Your Projects</div>
        <div className="flex gap-2 md:gap-4">
          {userData?.role === 'student' && (
            <button 
              onClick={() => location.href = '/development/connect'}
              className="px-3 md:px-6 py-2 text-sm md:text-lg text-violet-800 border-2 border-violet-800 rounded-full hover:bg-violet-100 transition-colors"
            >
              Connect
            </button>
          )}
          {(userData?.role === 'faculty' || userData?.role === 'admin') && (
            <button className="px-3 md:px-6 py-2 text-sm md:text-lg text-white bg-violet-800 rounded-full hover:bg-violet-700 transition-colors">
              New Project +
            </button>
          )}
        </div>
      </div>
      
      {/* Project Sections */}
      <div className="mt-6">
        {activeTab === 'active' && (
          <>
            <ProjectSection title="" projects={projectsToShow} hideTitle={true} />
            
            {userData?.role === 'student' && (
              <>
                <ProjectSection title="Faculty Projects" projects={facultyProjects} />
                <ProjectSection title="Peer Projects" projects={peerProjects} />
              </>
            )}
            
            {(userData?.role === 'faculty' || userData?.role === 'admin') && projectsToShow.length === 0 && (
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
          <>
            {projectsToShow.length > 0 ? (
              <ProjectSection title="" projects={projectsToShow} hideTitle={true} />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600">No applied projects.</p>
                <p className="text-gray-500 mt-2">
                  Go to Connect to find and apply to projects.
                </p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'archived' && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-xl text-gray-600">No archived projects.</p>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}