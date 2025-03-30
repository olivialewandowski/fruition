// src/app/development/projects/[projectId]/team/add/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FacultySidebar from '@/components/layout/FacultySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, addTeamMember } from '@/services/clientProjectService';
import { ProjectWithId } from '@/types/project';
import { AccessLevel } from '@/types/user'; // Import the AccessLevel type
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AddTeamMemberPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  // State for data
  const [project, setProject] = useState<ProjectWithId | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'Team Member',
    accessLevel: 'viewer' as AccessLevel // Type assertion here
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || typeof projectId !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch project details
        const projectData = await getProjectById(projectId);
        
        if (!projectData) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
      } catch (err) {
        setError('Error fetching project data');
        console.error('Error fetching project data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Check if user is authorized to view/edit this project
  const isProjectOwner = user?.uid === project?.facultyId || user?.uid === project?.mentorId;
  const isAdmin = userData?.role === 'admin';
  const canManageProject = isProjectOwner || isAdmin;
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'accessLevel') {
      // Ensure type safety for accessLevel
      setFormData(prev => ({ 
        ...prev, 
        [name]: value as AccessLevel 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate email
      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Call API to add team member
      await addTeamMember(projectId as string, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        projectRole: formData.role,
        accessLevel: formData.accessLevel // Now correctly typed as AccessLevel
      });
      
      setSuccessMessage('Team member added successfully!');
      
      // Redirect back to team page after a short delay
      setTimeout(() => {
        router.push(`/development/projects/${projectId}/team`);
      }, 1500);
      
    } catch (err) {
      console.error('Error adding team member:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding the team member');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <p className="ml-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !isSubmitting) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="p-4">
          <FacultySidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
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
        </div>
      </div>
    );
  }
  
  // If not authorized, redirect to dashboard
  if (!canManageProject) {
    router.push('/development/dashboard');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="p-4">
        <FacultySidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {project?.title ? `${project.title} - Add Team Member` : 'Add Team Member'}
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200 mb-4">
                <strong>Success:</strong> {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="team.member@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  University email address preferred.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Research Assistant">Research Assistant</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Teaching Assistant">Teaching Assistant</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  This is their role or title within the project.
                </p>
              </div>
              
              <div>
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">
                  Access Level
                </label>
                <select
                  id="accessLevel"
                  name="accessLevel"
                  value={formData.accessLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="viewer">Viewer - Can view project details only</option>
                  <option value="editor">Editor - Can manage applications</option>
                  <option value="admin">Admin - Can manage team, positions, and applications</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Determines what they can see and do within the project.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/development/projects/${projectId}/team`)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}