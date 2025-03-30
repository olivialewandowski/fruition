// src/app/development/projects/[projectId]/positions/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById } from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import PositionCreationForm from '@/components/projects/PositionCreationForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CreatePositionPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || typeof projectId !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const projectData = await getProjectById(projectId);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
      } catch (err) {
        setError('Error fetching project data');
        console.error('Error fetching project data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Check if user is authorized to view/edit this project
  const isProjectOwner = user?.uid === project?.facultyId || user?.uid === project?.mentorId;
  const isAdmin = userData?.role === 'admin';
  const canManageProject = isProjectOwner || isAdmin;
  
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {project?.title ? `${project.title} - Add Position` : 'Add Position'}
          </h1>
          
          {project && (
            <PositionCreationForm 
              projectId={projectId as string}
              project={project}
              onSuccess={() => router.push(`/development/projects/${projectId}/positions`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}