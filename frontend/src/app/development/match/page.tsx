'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import BaseLayout from '@/components/layout/BaseLayout';
import MatchProjectsList from '@/components/match/MatchProjectsList';
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

// Define the tabs for the match page
type MatchTab = 'browse' | 'saved' | 'applied';

export default function MatchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MatchTab>('browse');
  const { user, userData } = useAuth();
  const router = useRouter();

  // Define the tabs for match navigation
  const matchTabs = [
    { id: 'browse', label: 'Browse' },
    { id: 'saved', label: 'Saved', count: savedProjects.length },
    { id: 'applied', label: 'Applied', count: appliedProjects.length }
  ];

  // Handle tab change with type conversion
  const handleTabChange = (tabId: string) => {
    // Convert string to MatchTab type
    setActiveTab(tabId as MatchTab);
  };

  // Redirect non-student users
  useEffect(() => {
    if (userData && userData.role !== 'student' && !isLoading) {
      router.push('/development/dashboard');
      toast.error('The Match feature is only available for Student accounts');
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
    <BaseLayout 
      title="Match" 
      tabs={matchTabs}
      defaultTab="browse"
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
            {activeTab === 'browse' && (
              <MatchProjectsList 
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
              <AppliedTab 
                appliedProjects={appliedProjects} 
              />
            )}
          </>
        )}
      </div>
    </BaseLayout>
  );
} 