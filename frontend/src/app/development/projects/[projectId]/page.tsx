// src/app/development/projects/[projectId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, updateProject, archiveProject, deleteProject } from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import EditProjectForm from '@/components/projects/EditProjectForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PencilIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProjectArchiveModal from '@/components/projects/ProjectArchiveModal';
import ProjectDeleteModal from '@/components/projects/ProjectDeleteModal';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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

  // Determine if project can be deleted (no hired/accepted team members)
  const canDelete = project && (!project.teamMembers || project.teamMembers.length === 0);

  // Handle project update
  const handleProjectUpdate = (updatedProject: ProjectWithId) => {
    setProject(updatedProject);
    setIsEditing(false);
    setSuccessMessage('Project details updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle project archive
  const handleArchiveProject = async () => {
    if (!projectId || !project) return;
    
    setActionLoading(true);
    try {
      await archiveProject(projectId as string);
      
      // Update local state
      setProject({
        ...project,
        status: project.status === 'archived' ? 'active' : 'archived',
        isActive: project.status === 'archived'
      });
      
      setSuccessMessage(`Project ${project.status === 'archived' ? 'unarchived' : 'archived'} successfully!`);
      setShowArchiveConfirm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error archiving project:', err);
      setError('Error archiving project. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle project delete
  const handleDeleteProject = async () => {
    if (!projectId || !canDelete) return;
    
    setActionLoading(true);
    try {
      await deleteProject(projectId as string);
      
      // Show success message
      setSuccessMessage('Project deleted successfully! Redirecting...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/development/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error deleting project. Please try again.');
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Format date safely
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Not available';
    
    try {
      // Handle Firestore Timestamp
      if (typeof dateValue === 'object' && dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      } 
      // Handle Date object
      else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      } 
      // Handle string or number
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleDateString();
      }
      return 'Not available';
    } catch (e) {
      return 'Not available';
    }
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
            <p className="ml-4 text-gray-600">Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !actionLoading) {
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

  // Display the read-only project overview
  const renderProjectOverview = () => {
    return (
      <div className="space-y-6">
        {/* Project Metadata Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p className="mt-1 text-gray-900">{project?.department || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">University</h3>
              <p className="mt-1 text-gray-900">{project?.university || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project?.status === 'active' ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1 text-gray-900">
                {project?.updatedAt ? formatDate(project.updatedAt) : 'Not available'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Project Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Project Title</h3>
              <p className="mt-1 text-gray-900 text-lg font-medium">{project?.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{project?.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Keywords</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {project?.keywords && project.keywords.length > 0 ? (
                  project.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No keywords specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Mentor Name</h3>
              <p className="mt-1 text-gray-900">{project?.mentorName || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Mentor Email</h3>
              <p className="mt-1 text-gray-900">{project?.mentorEmail || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Mentor Title/Affiliation</h3>
              <p className="mt-1 text-gray-900">{project?.mentorTitle || 'Not specified'}</p>
            </div>
            
            {project?.isPrincipalInvestigator === false && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Principal Investigator</h3>
                  <p className="mt-1 text-gray-900">{project?.principalInvestigatorName || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Principal Investigator Email</h3>
                  <p className="mt-1 text-gray-900">{project?.principalInvestigatorEmail || 'Not specified'}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          {/* Archive Button */}
          <button
            onClick={() => setShowArchiveConfirm(true)}
            disabled={actionLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <ArchiveBoxIcon className="h-5 w-5 mr-2 text-gray-500" />
            {project?.status === 'archived' ? 'Unarchive' : 'Archive'}
          </button>
          
          {/* Delete Button - only show if project can be deleted */}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
              Delete Project
            </button>
          )}
          
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            disabled={actionLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="p-4">
        <FacultySidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Project Overview</h1>
          <p className="text-sm text-gray-500">development/projects/{projectId}</p>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {/* Show either the edit form or the project overview */}
          {isEditing && project ? (
            <EditProjectForm 
              project={project} 
              onProjectUpdated={handleProjectUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            renderProjectOverview()
          )}
        </div>
      </div>
      
      {/* Modals */}
      {project && (
        <>
          <ProjectArchiveModal
            isOpen={showArchiveConfirm}
            onClose={() => setShowArchiveConfirm(false)}
            onArchive={handleArchiveProject}
            projectTitle={project.title || 'Untitled Project'}
            isArchiving={actionLoading}
            isArchived={project.status === 'archived'}
          />
          
          <ProjectDeleteModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onDelete={handleDeleteProject}
            projectTitle={project.title || 'Untitled Project'}
            isDeleting={actionLoading}
          />
        </>
      )}
    </div>
  );
}