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

  // Fetch projects function to be called after actions or on load
  const fetchAllProjects = async () => {
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
      
      console.log('Projects refreshed - Applied projects:', appliedProjectsData.length);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
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
    fetchAllProjects();
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
        
        // Remove from saved projects if it was a saved project
        if (project.id.startsWith('saved_')) {
          setSavedProjects(prev => prev.filter(p => p.id !== project.id));
        }
        
        // Refresh all projects to ensure applied projects are up to date
        await fetchAllProjects();
        
        // Switch to applied tab to show the result
        setActiveTab('applied');
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
        
        // Refresh all projects
        await fetchAllProjects();
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