'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { getProjects, applyToProject, saveProject, removeProject } from '@/services/projectsService';
import DiscoverTab from '@/components/connect/DiscoverTab';
import SavedTab from '@/components/connect/SavedTab';
import AppliedTab from '@/components/connect/AppliedTab';

export default function ConnectPage() {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect with Research</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'discover'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'saved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
          {savedProjects.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {savedProjects.length}
            </span>
          )}
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'applied'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('applied')}
        >
          Applied
          {appliedProjects.length > 0 && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {appliedProjects.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tab content */}
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
        </>
      )}
    </div>
  );
} 