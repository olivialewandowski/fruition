'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import Sidebar from '@/components/dashboard/Sidebar';
import ConnectNavigation from '@/components/connect/ConnectNavigation';
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
  removeProject
} from '@/services/projectsService';
import { toast } from 'react-hot-toast';

// Define the tabs for the connect page
type ConnectTab = 'discover' | 'saved' | 'applied';

export default function EmptyConnectTestPage() {
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect - Empty Test</h1>
            
            <ConnectNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
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