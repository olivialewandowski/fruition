'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectById, 
  getProjectPositions, 
  getProjectApplications,
  getProjectTeamMembers,
  archiveProject,
  deleteProject
} from '@/services/clientProjectService';
import { Project, ProjectWithId } from '@/types/project';
import { Position } from '@/types/position';
import { Application } from '@/types/application';
import { User } from '@/types/user';
import EditProjectForm from '@/components/projects/EditProjectForm';
import ApplicationsManager from '@/components/projects/ApplicationsManager';
import TeamManager from '@/components/projects/TeamManager';
import MaterialsManager from '@/components/projects/MaterialsManager';
import ProjectDeleteModal from '@/components/projects/ProjectDeleteModal';
import ProjectArchiveModal from '@/components/projects/ProjectArchiveModal';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { userData, user } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current active tab
  const [activeTab, setActiveTab] = useState<string>('details');
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

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
        
        // Fetch associated data
        const [positionsData, applicationsData, teamData] = await Promise.all([
          getProjectPositions(projectId),
          getProjectApplications(projectId),
          getProjectTeamMembers(projectId)
        ]);
        
        setPositions(positionsData || []);
        setApplications(applicationsData || []);
        setTeamMembers(teamData || []);
        
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
  
  // If not authorized, redirect to dashboard
  useEffect(() => {
    if (!isLoading && !canManageProject && !error) {
      router.push('/development/dashboard');
    }
  }, [isLoading, canManageProject, router, error]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle project archive
  const handleArchiveProject = async () => {
    if (!project || !project.id) return;
    
    try {
      setActionInProgress(true);
      await archiveProject(project.id);
      router.push('/development/dashboard');
    } catch (err) {
      console.error('Error archiving project:', err);
      setError('Failed to archive project');
    } finally {
      setActionInProgress(false);
      setIsArchiveModalOpen(false);
    }
  };

  // Handle project delete
  const handleDeleteProject = async () => {
    if (!project || !project.id) return;
    
    try {
      setActionInProgress(true);
      await deleteProject(project.id);
      router.push('/development/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    } finally {
      setActionInProgress(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Define tabs
  const tabs = [
    { id: 'details', label: 'Project Details' },
    { id: 'applications', label: 'Applications' },
    { id: 'team', label: 'Team' },
    { id: 'materials', label: 'Materials' }
  ];

  if (isLoading) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Project Details"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Project Details"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-8">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button 
                onClick={() => router.push('/development/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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
    <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow overflow-auto">
        <TopNavigation 
          title={project?.title || 'Project Details'}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <div className="px-6 py-5">
          {/* Action buttons */}
          <div className="flex justify-end space-x-4 mb-6">
            <button 
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              disabled={actionInProgress}
            >
              {project?.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              disabled={actionInProgress}
            >
              Delete Project
            </button>
          </div>
          
          {/* Tab content */}
          <div className="mt-4">
            {activeTab === 'details' && project && (
              <EditProjectForm 
                project={project} 
                onProjectUpdated={(updatedProject) => setProject(updatedProject)}
              />
            )}
            
            {activeTab === 'applications' && project && (
              <ApplicationsManager 
                projectId={project.id} 
                positions={positions}
                applications={applications}
                onApplicationsUpdated={(newApplications) => setApplications(newApplications)}
                onTeamUpdated={(newTeamMembers) => setTeamMembers(newTeamMembers)}
              />
            )}
            
            {activeTab === 'team' && project && (
              <TeamManager 
                projectId={project.id}
                teamMembers={teamMembers}
                onTeamUpdated={(newTeamMembers) => setTeamMembers(newTeamMembers)}
              />
            )}
            
            {activeTab === 'materials' && project && (
              <MaterialsManager 
                projectId={project.id}
              />
            )}
          </div>
        </div>
        
        {/* Modals */}
        <ProjectDeleteModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteProject}
          projectTitle={project?.title || ''}
          isDeleting={actionInProgress}
        />
        
        <ProjectArchiveModal 
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          onArchive={handleArchiveProject}
          projectTitle={project?.title || ''}
          isArchiving={actionInProgress}
          isArchived={project?.status === 'archived'}
        />
      </div>
    </div>
  );
}