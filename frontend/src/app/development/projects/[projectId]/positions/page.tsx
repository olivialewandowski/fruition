// src/app/development/projects/[projectId]/positions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, getProjectPositions } from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import { Position } from '@/types/position';
import PositionsManager from '@/components/projects/PositionsManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProjectPositionsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
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
        
        // Fetch project details and positions in parallel
        const [projectData, positionsData] = await Promise.all([
          getProjectById(projectId),
          getProjectPositions(projectId)
        ]);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        setPositions(positionsData || []);
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
  
  // Filter positions based on active tab
  const filteredPositions = positions.filter(position => 
    activeTab === 'active' 
      ? position.status !== 'archived' 
      : position.status === 'archived'
  );
  
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
            <p className="ml-4 text-gray-600">Loading project data...</p>
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
              {project?.title ? `${project.title} - Positions` : 'Project Positions'}
            </h1>
            
            <button
              onClick={() => router.push(`/development/projects/${projectId}/positions/create`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Post New Position
            </button>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Positions
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'archived'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Archived Positions
              </button>
            </nav>
          </div>
          
          {/* Positions Manager Component */}
          <PositionsManager 
            projectId={projectId as string}
            positions={filteredPositions}
            onPositionsUpdated={(updatedPositions) => {
              // Update state with the updated positions but keep other positions that aren't in the updated list
              setPositions(currentPositions => {
                const positionIds = updatedPositions.map(p => p.id);
                const otherPositions = currentPositions.filter(p => !positionIds.includes(p.id));
                return [...otherPositions, ...updatedPositions];
              });
            }}
            type={activeTab}
          />
        </div>
      </div>
    </div>
  );
}