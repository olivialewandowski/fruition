'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { getProjects, applyToProject, saveProject, removeProject } from '@/services/projectsService';
import Sidebar from '@/components/dashboard/Sidebar';
import ConnectNavigation from '@/components/connect/ConnectNavigation';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';

export default function ConnectPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'discover' | 'saved' | 'applied'>('discover');
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle applying to a project
  const handleApplyProject = async (project: Project) => {
    try {
      await applyToProject(project.id);
      
      // Add to applied projects if not already there
      if (!appliedProjects.some(p => p.id === project.id)) {
        setAppliedProjects(prev => [...prev, project]);
      }
      
      // Remove from saved projects if it was saved
      setSavedProjects(prev => prev.filter(p => p.id !== project.id));
      
      // Show a success message or notification
      console.log(`Applied to project: ${project.title}`);
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  // Handle saving a project
  const handleSaveProject = async (project: Project) => {
    try {
      await saveProject(project);
      
      // Add to saved projects if not already there
      if (!savedProjects.some(p => p.id === project.id)) {
        setSavedProjects(prev => [...prev, project]);
      }
      
      // Show a success message or notification
      console.log(`Saved project: ${project.title}`);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handle removing a project from saved
  const handleRemoveProject = async (project: Project) => {
    try {
      await removeProject(project.id);
      
      // Remove from saved projects
      setSavedProjects(prev => prev.filter(p => p.id !== project.id));
      
      // Show a success message or notification
      console.log(`Removed project: ${project.title}`);
    } catch (error) {
      console.error('Error removing project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-100 p-4 text-yellow-800 text-center">
        Development Environment
      </div>
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200">
        <Sidebar />
        <div className="flex flex-col grow shrink-0 self-start basis-0 w-fit max-md:max-w-full">
          <ConnectNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            savedCount={savedProjects.length}
            appliedCount={appliedProjects.length}
          />
          
          <div className="flex flex-col items-start px-5 mt-6 w-full max-md:max-w-full">
            <div className="flex flex-wrap gap-5 justify-between self-stretch mr-6 ml-3.5 w-full font-bold text-center max-w-[1050px] max-md:mr-2.5 max-md:max-w-full">
              <div className="my-auto text-3xl text-black">Connect with Research</div>
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/development/dashboard')}
                  className="px-6 py-2.5 text-3xl text-violet-800 border-2 border-violet-800 rounded-[30px] hover:bg-violet-100 transition-colors max-md:px-5"
                >
                  Dashboard
                </button>
              </div>
            </div>
            
            {/* Tab content */}
            <div className="w-full px-4 mt-6">
              {activeTab === 'discover' && (
                <DiscoverTab 
                  projects={projects} 
                  onSaveProject={handleSaveProject} 
                  onApplyProject={handleApplyProject} 
                />
              )}
              
              {activeTab === 'saved' && (
                <SavedTab 
                  savedProjects={savedProjects} 
                  onApplyProject={handleApplyProject} 
                  onRemoveProject={handleRemoveProject} 
                />
              )}
              
              {activeTab === 'applied' && (
                <AppliedTab appliedProjects={appliedProjects} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 