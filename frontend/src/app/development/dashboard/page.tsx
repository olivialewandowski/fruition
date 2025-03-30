// src/app/development/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Project } from '@/types/project';
import ProjectCreationModal from '@/components/projects/ProjectCreationModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("facultyId", "==", user.uid)
        );
        
        const snapshot = await getDocs(projectsQuery);
        const projectsData: Project[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            ...data
          } as Project);
        });
        
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);
  
  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => 
    activeTab === 'active' 
      ? project.status !== 'archived' 
      : project.status === 'archived'
  );
  
  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="large" />
            <p className="ml-4 text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle case where user is not faculty or admin
  if (userData && userData.role !== 'faculty' && userData.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Fruition</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your account is not set up as a faculty account. 
                Please contact support if you believe this is an error.
              </p>
              <button
                onClick={() => router.push('/development/match')}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="p-4">
        <FacultySidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Project
            </button>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Projects
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'archived'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Archived Projects
              </button>
            </nav>
          </div>
          
          {/* Projects grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => router.push(`/development/projects/${project.id}`)}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{project.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.keywords?.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                          {keyword}
                        </span>
                      ))}
                      {project.keywords && project.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{project.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">
                          {project.teamMembers?.length || 0} team members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">
                          {project.applicationCount || 0} applications
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {activeTab === 'active' ? 'No Active Projects' : 'No Archived Projects'}
              </h2>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' 
                  ? 'You don\'t have any active projects. Create your first project to get started!' 
                  : 'You don\'t have any archived projects.'}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create New Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Project creation modal */}
      <ProjectCreationModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
    </div>
  );
}