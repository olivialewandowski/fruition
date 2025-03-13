'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Sidebar from '@/components/layout/Sidebar';
import ConnectNavigation from '@/components/connect/ConnectNavigation';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';
import { 
  applyToProject, 
  saveProject, 
  getSavedProjects, 
  getAppliedProjects,
  declineProject,
  removeProject,
  undoLastAction
} from '@/services/projectsService';
import { convertConnectProjectsToProjects, extractOriginalId } from '@/utils/connect-helper';

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
  commitment: '5 hours/week',
  // Required fields for Project type
  mentorId: 'test-mentor',
  status: 'active',
  isActive: true,
  teamMembers: []
};

export default function SingleProjectTestPage() {
  const [activeTab, setActiveTab] = useState<ConnectTab>('discover');
  const [projects, setProjects] = useState<Project[]>([singleProject]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch saved and applied projects
        const [savedConnectProjects, appliedConnectProjects] = await Promise.all([
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert connect projects to full projects
        const savedProjectsData = convertConnectProjectsToProjects(savedConnectProjects).map(p => ({
          ...p,
          id: `saved_${p.id}`
        }));
        const appliedProjectsData = convertConnectProjectsToProjects(appliedConnectProjects).map(p => ({
          ...p,
          id: `applied_${p.id}`
        }));
        
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
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      await applyToProject(originalId);
      
      // Update state to reflect the change
      setAppliedProjects(prev => [...prev, {...project, id: `applied_${originalId}`}]);
      
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
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      await saveProject(originalId);
      
      // Update state to reflect the change
      setSavedProjects(prev => [...prev, {...project, id: `saved_${originalId}`}]);
      
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
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      await declineProject(originalId);
      
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
        
        // Reset to the single project
        setProjects([singleProject]);
        
        // Fetch saved and applied projects
        const [savedConnectProjects, appliedConnectProjects] = await Promise.all([
          getSavedProjects(),
          getAppliedProjects()
        ]);
        
        // Convert connect projects to full projects
        const savedProjectsData = convertConnectProjectsToProjects(savedConnectProjects).map(p => ({
          ...p,
          id: `saved_${p.id}`
        }));
        const appliedProjectsData = convertConnectProjectsToProjects(appliedConnectProjects).map(p => ({
          ...p,
          id: `applied_${p.id}`
        }));
        
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
      // Call API to remove saved project with original ID
      const originalId = extractOriginalId(project.id);
      await removeProject(originalId);
      
      // Update state to reflect the change
      setSavedProjects(prev => prev.filter(p => p.id !== project.id));
      
      toast.success(`Removed ${project.title} from saved projects`);
    } catch (error) {
      console.error('Error removing saved project:', error);
      toast.error('Failed to remove project. Please try again.');
    }
  };

  // Handle tab change
  const handleTabChange = (tab: ConnectTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect - Single Project Test</h1>
            
            <ConnectNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              savedCount={savedProjects.length}
              appliedCount={appliedProjects.length}
            />
            
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