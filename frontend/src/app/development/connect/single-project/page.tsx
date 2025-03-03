'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import BaseLayout from '@/components/layout/BaseLayout';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';
import { 
  applyToProject, 
  saveProject, 
  getSavedProjects, 
  getAppliedProjects,
  declineProject,
  removeProject
} from '@/services/projectsService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define the tabs for the connect page
type ConnectTab = 'discover' | 'saved' | 'applied';

// Single test project
const singleProject: Project = {
  id: 'test-single-project',
  title: 'Test Single Project',
  description: 'This is a test project to verify the functionality of the Connect feature with a single project.',
  faculty: 'Test Faculty',
  department: 'Test Department',
  skills: ['Testing', 'Edge Cases', 'React'],
  duration: '1 month',
  commitment: '5 hours/week'
};

export default function SingleProjectTestPage() {
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const [projects, setProjects] = useState<Project[]>([singleProject]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Define the tabs
  const connectTabs = [
    { 
      id: 'discover', 
      label: 'Discover',
      isAvailable: (role?: string) => role === 'student'
    },
    { 
      id: 'saved', 
      label: 'Saved',
      isAvailable: (role?: string) => role === 'student'
    },
    { 
      id: 'applied', 
      label: 'Applied',
      isAvailable: (role?: string) => role === 'student'
    }
  ];

  // Fetch projects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch saved and applied projects
        const [savedProjectsData, appliedProjectsData] = await Promise.all([
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        setSavedProjects(savedProjectsData);
        setAppliedProjects(appliedProjectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle applying to a project
  const handleApplyProject = async (project: Project) => {
    try {
      await applyToProject(project.id);
      
      // Update state to reflect the change
      setAppliedProjects(prev => [...prev, project]);
      
      // Remove from projects list to prevent showing again
      setProjects(prev => prev.filter(p => p.id !== project.id));
      
      toast.success(`Applied to ${project.title}`);
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('Failed to apply to project. Please try again.');
    }
  };

  // Handle saving a project
  const handleSaveProject = async (project: Project) => {
    try {
      await saveProject(project.id);
      
      // Update state to reflect the change
      setSavedProjects(prev => [...prev, project]);
      
      // Remove from projects list to prevent showing again
      setProjects(prev => prev.filter(p => p.id !== project.id));
      
      toast.success(`Saved ${project.title}`);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    }
  };

  // Handle declining a project
  const handleDeclineProject = async (project: Project) => {
    try {
      await declineProject(project.id);
      
      // Remove from projects list to prevent showing again
      setProjects(prev => prev.filter(p => p.id !== project.id));
      
      toast.success(`Declined ${project.title}`);
    } catch (error) {
      console.error('Error declining project:', error);
      toast.error('Failed to decline project. Please try again.');
    }
  };

  // Handle removing a saved project
  const handleRemoveSavedProject = async (project: Project) => {
    try {
      // Call API to remove saved project
      await removeProject(project.id);
      
      // Update state to reflect the change
      setSavedProjects(prev => prev.filter(p => p.id !== project.id));
      
      toast.success(`Removed ${project.title} from saved projects`);
    } catch (error) {
      console.error('Error removing saved project:', error);
      toast.error('Failed to remove project. Please try again.');
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as ConnectTab);
  };

  return (
    <BaseLayout
      title="Connect - Single Project Test"
      tabs={connectTabs}
      defaultTab="discover"
    >
      {loading ? (
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
    </BaseLayout>
  );
}