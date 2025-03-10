'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ConnectProject, connectProjectToProject } from '@/types/project';
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
        const [projectsData, savedProjectsData, appliedProjectsData] = await Promise.all([
          getProjects(),
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert ConnectProject objects to Project objects
        const convertedProjects: Project[] = projectsData.map(p => connectProjectToProject(p));
        const convertedSavedProjects: Project[] = savedProjectsData.map(p => connectProjectToProject(p));
        const convertedAppliedProjects: Project[] = appliedProjectsData.map(p => connectProjectToProject(p));
        
        setProjects(convertedProjects);
        setSavedProjects(convertedSavedProjects);
        setAppliedProjects(convertedAppliedProjects);
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
      // Ensure project.id is defined
      if (!project.id) {
        toast.error('Project ID is missing');
        return;
      }
      
      const success = await applyToProject(project.id);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        toast.success('Successfully applied to project!');
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
        
        // Add to applied projects
        setAppliedProjects([...appliedProjects, project]);
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
      // Ensure project.id is defined
      if (!project.id) {
        toast.error('Project ID is missing');
        return;
      }
      
      const success = await saveProject(project.id);
      
      if (success) {
        // Reset the undone projects stack when a new action is performed
        undoneProjectsRef.current = [];
        
        toast.success('Project saved!');
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
        
        // Add to saved projects
        setSavedProjects([...savedProjects, project]);
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
      // Ensure project.id is defined
      if (!project.id) {
        toast.error('Project ID is missing');
        return;
      }
      
      const success = await declineProject(project.id);
      
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
      const originalId = project.id.replace('saved_', '');
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
        const [projectsData, savedProjectsData, appliedProjectsData] = await Promise.all([
          getProjects(),
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert ConnectProject objects to Project objects
        const convertedProjects: Project[] = projectsData.map(p => connectProjectToProject(p));
        const convertedSavedProjects: Project[] = savedProjectsData.map(p => connectProjectToProject(p));
        const convertedAppliedProjects: Project[] = appliedProjectsData.map(p => connectProjectToProject(p));
        
        // If we have an undone project ID, add it to our undone projects list
        if (result.undoneProjectId) {
          undoneProjectsRef.current.push(result.undoneProjectId);
          
          // Store all available projects for future reference
          const allProjects = [
            ...convertedProjects,
            ...convertedSavedProjects,
            ...convertedAppliedProjects,
            ...getSampleProjects().map(p => connectProjectToProject(p as ConnectProject))
          ];
          
          // Remove duplicates
          const uniqueProjects = Array.from(
            new Map(allProjects.map(p => [p.id, p])).values()
          );
          
          allProjectsRef.current = uniqueProjects;
          
          // Reorder projects to show undone projects in the correct order
          // The most recently undone project should be at the top
          const reorderedProjects = [...convertedProjects];
          
          // Add all undone projects to the beginning of the list in reverse order
          // (most recent first)
          for (let i = undoneProjectsRef.current.length - 1; i >= 0; i--) {
            const undoneId = undoneProjectsRef.current[i];
            const undoneProject = allProjectsRef.current.find(p => p.id === undoneId);
            
            if (undoneProject && !reorderedProjects.some(p => p.id === undoneId)) {
              reorderedProjects.unshift(undoneProject);
            }
          }
          
          // Update the projects list with the reordered list
          setProjects(reorderedProjects);
        } else {
          // If no undone project ID, just use the fetched projects
          setProjects(convertedProjects);
        }
        
        setSavedProjects(convertedSavedProjects);
        setAppliedProjects(convertedAppliedProjects);
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