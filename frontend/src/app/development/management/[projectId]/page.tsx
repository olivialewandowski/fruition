// src/app/management/[projectId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectById, 
  updateProject, 
  archiveProject, 
  deleteProject,
  getProjectMaterials,
  getProjectTeamMembers,
  getProjectPositions,
  getProjectApplications
} from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import { User } from '@/types/user';
import { Position } from '@/types/position';
import { Application } from '@/types/application';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PencilIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';
import EditProjectForm from '@/components/projects/EditProjectForm';
import ProjectArchiveModal from '@/components/projects/ProjectArchiveModal';
import ProjectDeleteModal from '@/components/projects/ProjectDeleteModal';
import PositionsManager from '@/components/projects/PositionsManager';
import TeamManagementPanel from '@/components/projects/TeamManagementPanel';
import ApplicationsManager from '@/components/projects/ApplicationsManager';

export default function ManagementProjectPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'overview' | 'positions' | 'applications' | 'team'>('overview');

  // Check if user is authorized to view/edit this project
  const isProjectOwner = user?.uid === project?.facultyId || user?.uid === project?.mentorId;
  const isAdmin = userData?.role === 'admin';
  const canManageProject = isProjectOwner || isAdmin;

  // Determine if project can be deleted (no hired/accepted team members)
  const canDelete = project && (!project.teamMembers || project.teamMembers.length === 0);

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
        
        // Get project details
        const projectData = await getProjectById(projectId);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Get related data
        const [materialsData, teamData, positionsData, applicationsData] = await Promise.all([
          getProjectMaterials(projectId),
          getProjectTeamMembers(projectId),
          getProjectPositions(projectId),
          getProjectApplications(projectId)
        ]);
        
        setMaterials(materialsData || []);
        setTeamMembers(teamData || []);
        setPositions(positionsData || []);
        setApplications(applicationsData || []);
        
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Error fetching project data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user]);

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
        router.push('/dashboard');
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

  // Handler for applications update
  const handleApplicationsUpdated = (updatedApplications: Application[]) => {
    setApplications(updatedApplications);
  };

  // Handler for team update
  const handleTeamUpdated = (updatedTeam: User[]) => {
    setTeamMembers(updatedTeam);
  };

  // Handler for positions update
  const handlePositionsUpdated = (updatedPositions: Position[]) => {
    setPositions(updatedPositions);
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
                onClick={() => router.push('/dashboard')}
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
    router.push('/dashboard');
    return null;
  }

  // Project not found
  if (!project) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Project not found</h2>
              <button
                onClick={() => router.push('/dashboard')}
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

  return (
  <div className="flex h-screen bg-gray-50">
    <div className="p-4 h-full">
      <FacultySidebar 
        projectId={projectId as string}
        activeFeature={activeFeature}
        onFeatureSelect={setActiveFeature}
      />
  </div>
  <div className="flex-1 flex flex-col bg-white rounded-2xl my-4 mr-4 overflow-y-auto">
    <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {project?.title ? `${project.title}` : 'Project Management'}
              <span className="ml-2 text-lg font-normal text-gray-500">| {activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)}</span>
            </h1>
            
            {activeFeature === 'overview' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArchiveBoxIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
                
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
                    Delete
                  </button>
                )}
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit
                </button>
              </div>
            )}
            
            {activeFeature === 'positions' && (
              <button
                onClick={() => router.push(`/development/management/${projectId}/positions/create`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Post New Position
              </button>
            )}
            
            {activeFeature === 'team' && (
              <button
                onClick={() => router.push(`/development/management/${projectId}/team/add`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Team Member
              </button>
            )}
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
              {successMessage}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          {/* Overview Feature */}
          {activeFeature === 'overview' && (
            isEditing ? (
              <EditProjectForm 
                project={project} 
                onProjectUpdated={handleProjectUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
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
              </div>
            )
          )}
          
          {/* Positions Feature */}
          {activeFeature === 'positions' && (
            <PositionsManager 
              projectId={projectId as string}
              positions={positions}
              onPositionsUpdated={handlePositionsUpdated}
              type="active"
            />
          )}
          
          {/* Applications Feature */}
          {activeFeature === 'applications' && (
            <ApplicationsManager
              projectId={projectId as string}
              positions={positions}
              applications={applications}
              onApplicationsUpdated={handleApplicationsUpdated}
              onTeamUpdated={handleTeamUpdated}
            />
          )}
          
          {/* Team Feature */}
          {activeFeature === 'team' && (
            <TeamManagementPanel
              projectId={projectId as string}
              teamMembers={teamMembers}
              onTeamUpdated={handleTeamUpdated}
            />
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