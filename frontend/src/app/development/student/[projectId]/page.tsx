// src/app/development/student/projects/[projectId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNavigation from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectById 
} from '@/services/clientProjectService';
import { 
  getStudentProjectMaterials,
  getStudentProjectTeamMembers
} from '@/services/studentService';
import { Project } from '@/types/project';
import { User } from '@/types/user';

const StudentProjectView = () => {
  const { projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || typeof projectId !== 'string' || !user) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get project details
        const projectData = await getProjectById(projectId as string);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Get materials and team members
        try {
          const [materialsData, teamData] = await Promise.all([
            getStudentProjectMaterials(projectId as string),
            getStudentProjectTeamMembers(projectId as string)
          ]);
          
          setMaterials(materialsData || []);
          setTeamMembers(teamData || []);
        } catch (accessError) {
          console.error('Error accessing project resources:', accessError);
          // If this fails, it might be because the student doesn't have access
          setError('You do not have access to this project');
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, user]);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'Not specified';
    
    try {
      // Handle Firestore Timestamp
      if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      } 
      // Handle Date object
      else if (date instanceof Date) {
        return date.toLocaleDateString();
      } 
      // Handle string or any other type
      else {
        return new Date(date).toLocaleDateString();
      }
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xlsx')) {
      return (
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('image')) {
      return (
        <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'materials', label: 'Onboarding Materials' },
    { id: 'team', label: 'Team' }
  ];

  if (isLoading) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Project Details" 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
          />
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Project Details"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-8">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button 
                onClick={() => router.push('/development/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
        <div className="h-full">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-grow overflow-auto">
          <TopNavigation 
            title="Project Not Found"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-8">
              <div className="text-gray-600 text-lg mb-4">Project not found</div>
              <button 
                onClick={() => router.push('/development/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden bg-white border border-solid border-neutral-200 h-screen">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow overflow-auto">
        <TopNavigation 
          title={project.title || 'Project Details'}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <div className="px-6 py-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
              
              {/* Project details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                  <p className="mt-2 text-gray-700">{project.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Keywords</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.keywords?.map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {keyword}
                      </span>
                    ))}
                    {(!project.keywords || project.keywords.length === 0) && (
                      <span className="text-gray-500">No keywords specified</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Department</h3>
                    <p className="mt-2 text-gray-700">{project.department || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">University</h3>
                    <p className="mt-2 text-gray-700">{project.university || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Mentor</h3>
                    <p className="mt-2 text-gray-700">{project.mentorName || 'Not specified'}</p>
                    <p className="mt-1 text-gray-500">{project.mentorEmail || ''}</p>
                    <p className="mt-1 text-gray-500">{project.mentorTitle || ''}</p>
                  </div>
                  
                  {project.isPrincipalInvestigator === false && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Principal Investigator</h3>
                      <p className="mt-2 text-gray-700">{project.principalInvestigatorName || 'Not specified'}</p>
                      <p className="mt-1 text-gray-500">{project.principalInvestigatorEmail || ''}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Onboarding Materials</h2>
              
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div 
                      key={material.id} 
                      className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(material.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{material.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">{material.description}</p>
                          </div>
                          <div>
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span>
                            {formatFileSize(material.fileSize)} • 
                            Uploaded by {material.uploadedBy} • 
                            {formatDate(material.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg text-gray-600">No materials have been uploaded yet.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Team</h2>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-medium text-lg">
                            {member.firstName?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {member.role || 'Team Member'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Department:</span>
                          <span className="ml-2 text-gray-700">{member.department || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">University:</span>
                          <span className="ml-2 text-gray-700">{member.university || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Joined:</span>
                          <span className="ml-2 text-gray-700">{formatDate(member.joinedDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg text-gray-600">No team members have been added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProjectView;