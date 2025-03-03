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
  removeProject
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

  // If user is not a student, they shouldn't have access to Connect
  if (userData && userData.role !== 'student') {
    return (
      <BaseLayout title="Connect">
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">
            The Connect feature is only available to students.
          </p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout 
      title="Connect"
      tabs={connectTabs}
      defaultTab="discover"
    >
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
    </BaseLayout>
  );
}