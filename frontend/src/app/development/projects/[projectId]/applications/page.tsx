// src/app/development/projects/[projectId]/applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectById, 
  getProjectPositions, 
  getProjectApplications 
} from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import { Position } from '@/types/position';
import { Application } from '@/types/application';
import ApplicationsReviewManager from '@/components/projects/ApplicationsReviewManager';
import LikedApplicationsManager from '@/components/projects/LikedApplicationsManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProjectApplicationsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'liked'>('review');
  const [selectedPosition, setSelectedPosition] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || typeof projectId !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch project details, positions, and applications in parallel
        const [projectData, positionsData, applicationsData] = await Promise.all([
          getProjectById(projectId),
          getProjectPositions(projectId),
          getProjectApplications(projectId)
        ]);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        setPositions(positionsData || []);
        setApplications(applicationsData || []);
      } catch (err) {
        setError('Error fetching project data');
        console.error('Error fetching project data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Check if user is authorized to view/edit this project
  const isProjectOwner = user?.uid === project?.facultyId || user?.uid === project?.mentorId;
  const isAdmin = userData?.role === 'admin';
  const canManageProject = isProjectOwner || isAdmin;
  
  // Filter applications based on active tab and selected position
  const filteredApplications = applications.filter(app => {
    // Filter by position if a specific position is selected
    if (selectedPosition !== 'all' && app.positionId !== selectedPosition) {
      return false;
    }
    
    // Filter by status based on active tab
    if (activeTab === 'review') {
      return app.status === 'pending';
    } else if (activeTab === 'liked') {
      return app.status === 'liked' || app.status === 'accepted';
    }
    
    return true;
  });
  
  // Calculate stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const likedApplications = applications.filter(app => app.status === 'liked').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
  
  // Handle application update
  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications(currentApplications => 
      currentApplications.map(app => 
        app.id === updatedApplication.id ? updatedApplication : app
      )
    );
  };
  
  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="large" />
            <p className="ml-4 text-gray-600">Loading applications data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
              <button
                onClick={() => router.push('/development/dashboard')}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If not authorized, redirect to dashboard
  if (!canManageProject) {
    router.push('/development/dashboard');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="p-4">
        <FacultySidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {project?.title ? `${project.title} - Applications` : 'Applications'}
            </h1>
            
            {/* Applications stats */}
            <div className="flex items-center">
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: `${((likedApplications + acceptedApplications) / totalApplications) * 100}%` || '0%' }}></div>
                <div className="h-full bg-red-500" style={{ width: `${(rejectedApplications / totalApplications) * 100}%` || '0%' }}></div>
              </div>
              <div className="ml-3 text-sm text-gray-600">
                <span className="font-medium">{pendingApplications}</span> pending
              </div>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('review')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Review Applications
                {pendingApplications > 0 && (
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {pendingApplications}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'liked'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Liked Applications
                {(likedApplications + acceptedApplications) > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {likedApplications + acceptedApplications}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          {/* Position filter */}
          <div className="mb-6">
            <label htmlFor="positionFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Position
            </label>
            <select
              id="positionFilter"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Positions</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id as string}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Applications Manager Component */}
          {activeTab === 'review' ? (
            <ApplicationsReviewManager 
              applications={filteredApplications}
              positions={positions}
              onApplicationUpdated={handleApplicationUpdate}
            />
          ) : (
            <LikedApplicationsManager 
              applications={filteredApplications}
              positions={positions}
              onApplicationUpdated={handleApplicationUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}