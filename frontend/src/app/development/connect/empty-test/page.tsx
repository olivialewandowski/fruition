'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import BaseLayout from '@/components/layout/BaseLayout';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';
import { 
  getEmptyProjects, 
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Sidebar from '@/components/layout/Sidebar';
import ConnectNavigation from '@/components/connect/ConnectNavigation';

// Define the tabs for the connect page
type ConnectTab = 'discover' | 'saved' | 'applied';

export default function EmptyConnectTestPage() {
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const [projects, setProjects] = useState<Project[]>([]);
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
        // Fetch all types of projects in parallel, but use empty projects for discover
        const [projectsData, savedProjectsData, appliedProjectsData] = await Promise.all([
          getEmptyProjects(), // This will return an empty array
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

  // Handle undoing the last action
  const handleUndoAction = async () => {
    try {
      const result = await undoLastAction();
      
      if (result.success) {
        toast.success('Action undone successfully');
        
        // If we have an undone project ID, find that project in the sample data
        // and add it to the projects list
        if (result.undoneProjectId) {
          // Get the sample projects to find the undone project
          const sampleProjects = getSampleProjects();
          const undoneProject = sampleProjects.find(p => p.id === result.undoneProjectId);
          
          if (undoneProject) {
            // Add the undone project to the list
            setProjects([undoneProject]);
          } else {
            // If we can't find the undone project, keep the empty list
            setProjects([]);
          }
        } else {
          // If no undone project ID, keep the empty list
          setProjects([]);
        }
        
        // Fetch saved and applied projects
        const [savedProjectsData, appliedProjectsData] = await Promise.all([
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
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

  // Handle tab change with the correct function signature
  const handleTabChange = (tab: ConnectTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect - Empty Test</h1>
            
            <ConnectNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              savedCount={savedProjects.length}
              appliedCount={appliedProjects.length}
            />
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
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
                  <AppliedTab 
                    appliedProjects={appliedProjects} 
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}