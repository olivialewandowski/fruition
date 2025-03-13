'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ConnectProject } from '@/types/project';
import BaseLayout from '@/components/layout/BaseLayout';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { 
  getProjects, 
  applyToProject, 
  saveProject, 
  getSavedProjects, 
  getAppliedProjects, 
  declineProject, 
  removeProject,
  undoLastAction,
  getSampleProjects
} from '@/services/projectsService';
import { convertConnectProjectsToProjects, extractOriginalId } from '@/utils/connect-helper';

// Define the tabs for the connect page
type ConnectTab = 'discover' | 'saved' | 'applied';

export default function ConnectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const { user, userData } = useAuth();
  const router = useRouter();
  
  // Keep track of undone projects for multiple undos
  const undoneProjectsRef = useRef<string[]>([]);
  const allProjectsRef = useRef<Project[]>([]);

  // Define the tabs for connect navigation
  const connectTabs = [
    { id: 'discover', label: 'Discover' },
    { id: 'saved', label: 'Saved', count: savedProjects.length },
    { id: 'applied', label: 'Applied', count: appliedProjects.length }
  ];

  // Handle tab change with type conversion
  const handleTabChange = (tabId: string) => {
    // Convert string to ConnectTab type
    setActiveTab(tabId as ConnectTab);
  };

  // Redirect non-student users
  useEffect(() => {
    if (userData && userData.role !== 'student' && !isLoading) {
      router.push('/development/dashboard');
      toast.error('The Connect feature is only available for Student accounts');
    }
  }, [userData, isLoading, router]);

  // Fetch projects when user is authenticated
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all types of projects in parallel
        const [connectProjects, savedConnectProjects, appliedConnectProjects] = await Promise.all([
          getProjects(),
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert connect projects to full projects
        const projectsData = convertConnectProjectsToProjects(connectProjects);
        const savedProjectsData = convertConnectProjectsToProjects(savedConnectProjects).map(p => ({
          ...p,
          id: `saved_${p.id}`
        }));
        const appliedProjectsData = convertConnectProjectsToProjects(appliedConnectProjects).map(p => ({
          ...p,
          id: `applied_${p.id}`
        }));
        
        setProjects(projectsData);
        setSavedProjects(savedProjectsData);
        setAppliedProjects(appliedProjectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle applying to a project
  const handleApplyProject = async (project: Project) => {
    try {
      // Extract original ID if it's a saved project
      const originalId = extractOriginalId(project.id);
      const success = await applyToProject(originalId);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        toast.success('Successfully applied to project!');
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
        
        // Add to applied projects
        setAppliedProjects(prev => [
          ...prev, 
          { ...project, id: `applied_${originalId}` }
        ]);
      } else {
        toast.error('Failed to apply to project. Please try again.');
      }
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('An error occurred while applying to the project.');
    }
  };

  // Handle saving a project
  const handleSaveProject = async (project: Project) => {
    try {
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      const success = await saveProject(originalId);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        toast.success('Project saved!');
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
        
        // Add to saved projects
        setSavedProjects(prev => [
          ...prev, 
          { ...project, id: `saved_${originalId}` }
        ]);
      } else {
        toast.error('Failed to save project. Please try again.');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('An error occurred while saving the project.');
    }
  };

  // Handle declining a project
  const handleDeclineProject = async (project: Project) => {
    try {
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      const success = await declineProject(originalId);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
      } else {
        toast.error('Failed to decline project. Please try again.');
      }
    } catch (error) {
      console.error('Error declining project:', error);
      toast.error('An error occurred while declining the project.');
    }
  };

  // Handle removing a saved project
  const handleRemoveSavedProject = async (project: Project) => {
    try {
      // Ensure project.id is defined
      if (!project.id) {
        toast.error('Project ID is missing');
        return;
      }
      
      // Extract the original project ID
      const originalId = extractOriginalId(project.id);
      const success = await removeProject(originalId);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        toast.success('Project removed from saved list');
        
        // Remove from saved projects
        setSavedProjects(savedProjects.filter(p => p.id !== project.id));
      } else {
        toast.error('Failed to remove project. Please try again.');
      }
    } catch (error) {
      console.error('Error removing saved project:', error);
      toast.error('An error occurred while removing the project.');
    }
  };

  // Handle undoing the last action
  const handleUndoAction = async () => {
    try {
      const result = await undoLastAction();
      
      if (result.success) {
        toast.success('Action undone successfully');
        
        // Refresh all project lists to reflect the changes
        const [connectProjects, savedConnectProjects, appliedConnectProjects] = await Promise.all([
          getProjects(),
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert connect projects to full projects
        let projectsData = convertConnectProjectsToProjects(connectProjects);
        const savedProjectsData = convertConnectProjectsToProjects(savedConnectProjects).map(p => ({
          ...p,
          id: `saved_${p.id}`
        }));
        const appliedProjectsData = convertConnectProjectsToProjects(appliedConnectProjects).map(p => ({
          ...p,
          id: `applied_${p.id}`
        }));
        
        // If we have an undone project ID, find that project in the sample data
        // and add it to the top of the projects list
        if (result.undoneProjectId) {
          // Get the sample projects to find the undone project
          const sampleProjects = convertConnectProjectsToProjects(getSampleProjects());
          const undoneProject = sampleProjects.find(p => p.id === result.undoneProjectId);
          
          if (undoneProject) {
            // Add the undone project to the top of the list
            projectsData = [undoneProject, ...projectsData.filter(p => p.id !== result.undoneProjectId)];
          }
        }
        
        setProjects(projectsData);
        setSavedProjects(savedProjectsData);
        setAppliedProjects(appliedProjectsData);
      } else {
        toast.error(result.message || 'Failed to undo action. Please try again.');
      }
    } catch (error) {
      console.error('Error undoing action:', error);
      toast.error('An error occurred while undoing the action.');
    }
  };

  return (
    <BaseLayout 
      title="Connect" 
      tabs={connectTabs}
      defaultTab="discover"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {activeTab === 'discover' && (
              <DiscoverTab 
                projects={projects} 
                onApplyProject={handleApplyProject}
                onSaveProject={handleSaveProject}
                onDeclineProject={handleDeclineProject}
                onUndoAction={handleUndoAction}
              />
            )}
            
            {activeTab === 'saved' && (
              <SavedTab 
                savedProjects={savedProjects} 
                onApplyProject={handleApplyProject}
                onRemoveProject={handleRemoveSavedProject}
              />
            )}
            
            {activeTab === 'applied' && (
              <AppliedTab appliedProjects={appliedProjects} />
            )}
          </>
        )}
      </div>
    </BaseLayout>
  );
}