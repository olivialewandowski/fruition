'use client';

import React, { useState, useEffect } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import { Project } from '@/types/project';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';
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
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define the tabs for the connect page
type ConnectTab = 'discover' | 'saved' | 'applied';

export default function ConnectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const { user, userData } = useAuth();

  // Define the tabs
  const connectTabs = [
    { 
      id: 'discover', 
      label: 'Discover',
      isAvailable: (role?: string) => role === 'student'  // Only for students
    },
    { 
      id: 'saved', 
      label: 'Saved',
      isAvailable: (role?: string) => role === 'student'  // Only for students
    },
    { 
      id: 'applied', 
      label: 'Applied',
      isAvailable: (role?: string) => role === 'student'  // Only for students
    }
  ];

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

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as ConnectTab);
  };

  // Handle applying to a project
  const handleApplyProject = async (project: Project) => {
    try {
      const success = await applyToProject(project.id);
      
      if (success) {
        toast.success('Successfully applied to project!');
        
        // Update the projects list
        setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
        
        // Add to applied projects
        setAppliedProjects(prev => [
          ...prev, 
          { ...project, id: `applied_${project.id}` }
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
      const success = await saveProject(project.id);
      
      if (success) {
        toast.success('Project saved!');
        
        // Update the projects list
        setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
        
        // Add to saved projects
        setSavedProjects(prev => [
          ...prev, 
          { ...project, id: `saved_${project.id}` }
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
      const success = await declineProject(project.id);
      
      if (success) {
        toast.success('Project declined');
        
        // Update the projects list
        setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
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
      // Extract the original project ID
      const originalId = project.id.replace('saved_', '');
      const success = await removeProject(originalId);
      
      if (success) {
        toast.success('Project removed from saved');
        
        // Update the saved projects list
        setSavedProjects(prev => prev.filter(p => p.id !== project.id));
      } else {
        toast.error('Failed to remove project. Please try again.');
      }
    } catch (error) {
      console.error('Error removing project:', error);
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
        
        // If we have an undone project ID, find that project in the sample data
        // and add it to the top of the projects list
        if (result.undoneProjectId) {
          // Get the sample projects to find the undone project
          const sampleProjects = getSampleProjects();
          const undoneProject = sampleProjects.find((p: Project) => p.id === result.undoneProjectId);
          
          if (undoneProject) {
            // Add the undone project to the top of the list
            setProjects([undoneProject, ...projectsData.filter(p => p.id !== result.undoneProjectId)]);
          } else {
            // If we can't find the undone project, just use the fetched projects
            setProjects(projectsData);
          }
        } else {
          // If no undone project ID, just use the fetched projects
          setProjects(projectsData);
        }
        
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
    <div className="flex h-screen bg-gray-50">
      <div className="h-screen pl-3 pt-3 pb-3 shadow-lg">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <ConnectNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              savedCount={savedProjects.length}
              appliedCount={appliedProjects.length}
            />
            
            <ClientOnly>
              {!authChecked ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : !isUserAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-lg mb-6">Please sign in to view projects</p>
                  <button 
                    onClick={handleSignIn}
                    className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                      projects={savedProjects} 
                      onRemoveProject={handleRemoveSavedProject}
                      onApplyProject={handleApplyProject}
                    />
                  )}
                  
                  {activeTab === 'applied' && (
                    <AppliedTab projects={appliedProjects} />
                  )}
                </>
              )}
            </ClientOnly>
          </div>
        </main>
      </div>
    </div>
  );
}