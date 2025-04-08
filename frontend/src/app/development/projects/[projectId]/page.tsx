// src/app/development/projects/[projectId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import Sidebar from '@/components/layout/Sidebar';
import BaseLayout from '@/components/layout/BaseLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectById, 
  updateProject, 
  archiveProject, 
  deleteProject,
  getProjectMaterials,
  getProjectTeamMembers,
  getProjectPositions,
  getProjectApplications
} from '@/services/clientProjectService';
import {
  getStudentProjectMaterials,
  getStudentProjectTeamMembers,
  getStudentProjectPositions,
  getStudentApplications,
  isTopProject,
  toggleTopProject
} from '@/services/studentService';
import { Project, ProjectWithId } from '@/types/project';
import { User } from '@/types/user';
import { Position } from '@/types/position';
import { Application } from '@/types/application';
import EditProjectForm from '@/components/projects/EditProjectForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PencilIcon, ArchiveBoxIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ProjectArchiveModal from '@/components/projects/ProjectArchiveModal';
import ProjectDeleteModal from '@/components/projects/ProjectDeleteModal';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isTopChoice, setIsTopChoice] = useState(false);
  const [topChoiceLoading, setTopChoiceLoading] = useState(false);

  // Determine user role and permissions
  const userRole = userData?.role || '';
  const isStudent = userRole === 'student';
  const isAdmin = userRole === 'admin';
  const isFaculty = userRole === 'faculty';
  
  // Use student-style layout for both students and admins
  const useStudentLayout = isStudent || isAdmin;
  
  // For faculty, check if user is authorized to manage this project
  const isProjectOwner = user?.uid === project?.facultyId || user?.uid === project?.mentorId;
  const canManageProject = isProjectOwner || isAdmin;

  // Determine if project can be deleted (no hired/accepted team members)
  const canDelete = project && (!project.teamMembers || project.teamMembers.length === 0);

  // Check if student is a team member of this project
  const isTeamMember = project?.teamMembers?.some(member => member.id === user?.uid) || false;

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || typeof projectId !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get project details - same for all roles
        const projectData = await getProjectById(projectId);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Get data based on user role
        if (isStudent) {
          try {
            // Get all data for students - no need to check membership first
            const [
              materialsData, 
              teamData, 
              positionsData
            ] = await Promise.all([
              getStudentProjectMaterials(projectId),
              getStudentProjectTeamMembers(projectId),
              getStudentProjectPositions(projectId)
            ]);
            
            setMaterials(materialsData || []);
            setTeamMembers(teamData || []);
            setPositions(positionsData || []);
            
            // Check if project is a top choice
            const isTop = await isTopProject(projectId);
            setIsTopChoice(isTop);
          } catch (accessError) {
            console.error('Error accessing project resources:', accessError);
            // Don't set error - allow partial data loading
          }
        } else if (isAdmin) {
          // For admin, get all data with admin privileges
          const [materialsData, teamData, positionsData, applicationsData] = await Promise.all([
            getProjectMaterials(projectId),
            getProjectTeamMembers(projectId),
            getProjectPositions(projectId),
            getProjectApplications(projectId)
          ]);
          
          setMaterials(materialsData || []);
          setTeamMembers(teamData || []);
          setPositions(positionsData || []);
          setApplications(applicationsData || []);
        } else if (isFaculty && isProjectOwner) {
          // For faculty project owner, get all data
          const [materialsData, teamData, positionsData, applicationsData] = await Promise.all([
            getProjectMaterials(projectId),
            getProjectTeamMembers(projectId),
            getProjectPositions(projectId),
            getProjectApplications(projectId)
          ]);
          
          setMaterials(materialsData || []);
          setTeamMembers(teamData || []);
          setPositions(positionsData || []);
          setApplications(applicationsData || []);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Error fetching project data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user, isStudent, isAdmin, isFaculty, isProjectOwner]);

  // Handle tab change for all users
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle project update for faculty view
  const handleProjectUpdate = (updatedProject: ProjectWithId) => {
    setProject(updatedProject);
    setIsEditing(false);
    setSuccessMessage('Project details updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle project archive for faculty view
  const handleArchiveProject = async () => {
    if (!projectId || !project) return;
    
    setActionLoading(true);
    try {
      await archiveProject(projectId as string);
      
      // Update local state
      setProject({
        ...project,
        status: project.status === 'archived' ? 'active' : 'archived',
        isActive: project.status === 'archived'
      });
      
      setSuccessMessage(`Project ${project.status === 'archived' ? 'unarchived' : 'archived'} successfully!`);
      setShowArchiveConfirm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error archiving project:', err);
      setError('Error archiving project. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle project delete for faculty view
  const handleDeleteProject = async () => {
    if (!projectId || !canDelete) return;
    
    setActionLoading(true);
    try {
      await deleteProject(projectId as string);
      
      // Show success message
      setSuccessMessage('Project deleted successfully! Redirecting...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/development/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error deleting project. Please try again.');
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle toggling top project status (for student view)
  const handleToggleTopProject = async () => {
    if (!projectId) return;
    
    setTopChoiceLoading(true);
    try {
      const result = await toggleTopProject(projectId as string);
      setIsTopChoice(result);
      
      // Show success message
      setSuccessMessage(`Project ${result ? 'added to' : 'removed from'} your top choices!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error toggling top project:', err);
      setError(err.message || 'Error updating top project status. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setTopChoiceLoading(false);
    }
  };
  
  // Format date safely
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Not available';
    
    try {
      // Handle Firestore Timestamp
      if (typeof dateValue === 'object' && dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      } 
      // Handle Date object
      else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      } 
      // Handle string or number
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleDateString();
      }
      return 'Not available';
    } catch (e) {
      return 'Not available';
    }
  };
  
  // Format file size for materials
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

  // Define tabs for project details in student/admin view
  const projectTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'materials', label: 'Materials' },
    { id: 'team', label: 'Team' },
    { id: 'positions', label: 'Positions' }
  ];

  // STUDENT/ADMIN VIEW - Uses BaseLayout with standard sidebar
  if (useStudentLayout) {
    return (
      <BaseLayout
        title={project?.title || 'Project Details'}
        tabs={projectTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {/* Show top project toggle button for students */}
        {isStudent && project && (
          <div className="absolute top-4 right-8 z-10">
            <button
              onClick={handleToggleTopProject}
              disabled={topChoiceLoading}
              className={`flex items-center justify-center rounded-full p-2 focus:outline-none ${
                isTopChoice 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isTopChoice ? "Remove from top choices" : "Add to top choices"}
            >
              {isTopChoice 
                ? <StarIconSolid className="h-6 w-6" /> 
                : <StarIcon className="h-6 w-6" />
              }
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="large" />
            <p className="ml-4 text-gray-600">Loading project data...</p>
          </div>
        ) : error ? (
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
        ) : !project ? (
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
        ) : (
          <>
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
                {successMessage}
              </div>
            )}
            
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Materials</h2>
                
                {materials.length > 0 ? (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div 
                        key={material.id} 
                        className={`flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 ${
                          material.isAccessRestricted ? 'bg-gray-50' : ''
                        }`}
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
                              {material.isAccessRestricted ? (
                                <span className="text-amber-600 text-sm px-2 py-1 bg-amber-50 rounded-md">
                                  Join team to access
                                </span>
                              ) : (
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
                              )}
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
                        className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${
                          member.isAccessRestricted ? 'bg-gray-50' : ''
                        }`}
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
                              {member.projectRole || member.role || 'Team Member'}
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
            
            {/* Positions Tab */}
            {activeTab === 'positions' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Positions</h2>
                
                {positions.length > 0 ? (
                  <div className="space-y-6">
                    {positions.map((position) => (
                      <div 
                        key={position.id} 
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            position.applicationStatus ? (
                              position.applicationStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                              position.applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              position.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            ) : 'bg-purple-100 text-purple-800'
                          }`}>
                            {position.applicationStatus ? 
                              `Application: ${position.applicationStatus.charAt(0).toUpperCase() + position.applicationStatus.slice(1)}` : 
                              'Open Position'}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-700">Description</h4>
                          <p className="mt-1 text-gray-600">{position.description}</p>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Requirements</h4>
                            <p className="mt-1 text-gray-600">{position.requirements || 'None specified'}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Time Commitment</h4>
                            <p className="mt-1 text-gray-600">{position.timeCommitment || 'Not specified'}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                            <p className="mt-1 text-gray-600">{position.duration || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          {!position.applicationStatus && isStudent && (
                            <button
                              onClick={() => router.push(`/development/applications/new?positionId=${position.id}`)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                              Apply Now
                            </button>
                          )}
                          
                          {position.applicationStatus === 'pending' && (
                            <button
                            onClick={() => router.push(`/development/applications/${position.applicationId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View Application
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg text-gray-600">No positions are currently available for this project.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </BaseLayout>
  );
}

// FACULTY VIEW - Uses FacultySidebar and project-specific sidebar
return (
  <div className="flex h-screen bg-gray-50">
    <div className="p-4">
      <FacultySidebar />
    </div>
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
      {/* Loading state */}
      {(loading || isLoading) && (
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="large" />
          <p className="ml-4 text-gray-600">Loading project data...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && !actionLoading && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <button
              onClick={() => router.push('/development/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {/* If not authorized, redirect to dashboard */}
      {!loading && !isLoading && !error && !canManageProject && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-700 mb-6">You don't have permission to view this project.</p>
            <button
              onClick={() => router.push('/development/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {/* Project content */}
      {!loading && !isLoading && !error && project && canManageProject && (
        <>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Project Overview</h1>
            <p className="text-sm text-gray-500">development/projects/{projectId}</p>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                {successMessage}
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            
            {/* Show either the edit form or the project overview */}
            {isEditing ? (
              <EditProjectForm 
                project={project} 
                onProjectUpdated={handleProjectUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-6">
                {/* Project Metadata Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Department</h3>
                      <p className="mt-1 text-gray-900">{project?.department || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">University</h3>
                      <p className="mt-1 text-gray-900">{project?.university || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project?.status === 'active' ? 'Active' : 'Archived'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                      <p className="mt-1 text-gray-900">
                        {project?.updatedAt ? formatDate(project.updatedAt) : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Project Details Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Project Title</h3>
                      <p className="mt-1 text-gray-900 text-lg font-medium">{project?.title}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900 whitespace-pre-line">{project?.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Keywords</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {project?.keywords && project.keywords.length > 0 ? (
                          project.keywords.map((keyword, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No keywords specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Mentor Name</h3>
                      <p className="mt-1 text-gray-900">{project?.mentorName || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Mentor Email</h3>
                      <p className="mt-1 text-gray-900">{project?.mentorEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Mentor Title/Affiliation</h3>
                      <p className="mt-1 text-gray-900">{project?.mentorTitle || 'Not specified'}</p>
                    </div>
                    
                    {project?.isPrincipalInvestigator === false && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Principal Investigator</h3>
                          <p className="mt-1 text-gray-900">{project?.principalInvestigatorName || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Principal Investigator Email</h3>
                          <p className="mt-1 text-gray-900">{project?.principalInvestigatorEmail || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  {/* Archive Button */}
                  <button
                    onClick={() => setShowArchiveConfirm(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <ArchiveBoxIcon className="h-5 w-5 mr-2 text-gray-500" />
                    {project?.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                  
                  {/* Delete Button - only show if project can be deleted */}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
                      Delete Project
                    </button>
                  )}
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    
    {/* Modals */}
    {project && (
      <>
        <ProjectArchiveModal
          isOpen={showArchiveConfirm}
          onClose={() => setShowArchiveConfirm(false)}
          onArchive={handleArchiveProject}
          projectTitle={project.title || 'Untitled Project'}
          isArchiving={actionLoading}
          isArchived={project.status === 'archived'}
        />
        
        <ProjectDeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onDelete={handleDeleteProject}
          projectTitle={project.title || 'Untitled Project'}
          isDeleting={actionLoading}
        />
      </>
    )}
  </div>
);
}