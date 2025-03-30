// src/components/projects/FacultyProjectCreationForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClientProject } from '@/services/clientProjectService';

interface ProjectFormValues {
  // Project Details
  title: string;
  description: string;
  keywords: string[];
  
  // Contact Information
  mentorName: string;
  mentorEmail: string;
  isPrincipalInvestigator: boolean;
  principalInvestigatorName: string;
  principalInvestigatorEmail: string;
  mentorTitle: string;
  department: string;
}

interface FacultyProjectCreationFormProps {
  onProjectCreated?: (projectId: string) => void;
  isOnboarding?: boolean;
}

const FacultyProjectCreationForm: React.FC<FacultyProjectCreationFormProps> = ({ 
  onProjectCreated,
  isOnboarding = false
}) => {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  // Initialize form values with empty strings instead of undefined
  const [formValues, setFormValues] = useState<ProjectFormValues>({
    title: '',
    description: '',
    keywords: [],
    mentorName: userData && userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : '',
    mentorEmail: userData && userData.email ? userData.email : '',
    isPrincipalInvestigator: true,
    principalInvestigatorName: '',
    principalInvestigatorEmail: '',
    mentorTitle: '',
    department: userData?.department || '',
  });
  
  // Populate form data whenever userData changes
  useEffect(() => {
    if (userData) {
      setFormValues(prev => ({
        ...prev,
        mentorName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : prev.mentorName,
        mentorEmail: userData.email || prev.mentorEmail,
        department: userData.department || prev.department,
      }));
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({ ...formValues, [name]: checked });
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !formValues.keywords.includes(currentKeyword.trim())) {
      setFormValues({
        ...formValues,
        keywords: [...formValues.keywords, currentKeyword.trim()]
      });
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormValues({
      ...formValues,
      keywords: formValues.keywords.filter(k => k !== keyword)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Check if user is authenticated
      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }
      
      // Prepare project data with conditional fields to avoid undefined values
      const projectData: any = {
        title: formValues.title,
        description: formValues.description,
        keywords: formValues.keywords,
        
        // Faculty information
        facultyId: user.uid,
        mentorId: user.uid,
        mentorName: formValues.mentorName,
        mentorEmail: formValues.mentorEmail,
        isPrincipalInvestigator: formValues.isPrincipalInvestigator,
        mentorTitle: formValues.mentorTitle,
        
        // Department and university info
        department: formValues.department || 'General',
        university: userData?.university || 'New York University',
        
        // Status information
        status: "active" as "active",
        isActive: true,
        applicationCount: 0,
        teamMembers: [],
      };
      
      // Only add PI fields if user is not the PI and values are provided
      if (!formValues.isPrincipalInvestigator) {
        if (formValues.principalInvestigatorName) {
          projectData.principalInvestigatorName = formValues.principalInvestigatorName;
        }
        
        if (formValues.principalInvestigatorEmail) {
          projectData.principalInvestigatorEmail = formValues.principalInvestigatorEmail;
        }
      }
      
      // Create the project
      const projectId = await createClientProject(projectData);
      
      setSuccessMessage('Project created successfully! Redirecting...');
      
      // Call the callback if provided
      if (onProjectCreated) {
        onProjectCreated(projectId);
      } else {
        // Navigate to the new project page
        setTimeout(() => {
          router.push(`/development/projects/${projectId}`);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${isOnboarding ? 'mx-auto' : ''}`}>
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
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Project Details</h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formValues.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Project Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formValues.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formValues.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="e.g., Computer Science, Biology"
            />
          </div>
          
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">Project Tags</label>
            <div className="flex mt-1">
              <input
                type="text"
                id="keywords"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Add keywords and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formValues.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1.5 h-4 w-4 flex items-center justify-center rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mentorName" className="block text-sm font-medium text-gray-700">Mentor Name</label>
              <input
                type="text"
                id="mentorName"
                name="mentorName"
                required
                value={formValues.mentorName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="mentorEmail" className="block text-sm font-medium text-gray-700">Mentor Email</label>
              <input
                type="email"
                id="mentorEmail"
                name="mentorEmail"
                required
                value={formValues.mentorEmail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="mentorTitle" className="block text-sm font-medium text-gray-700">Mentor Title/Affiliation</label>
            <input
              type="text"
              id="mentorTitle"
              name="mentorTitle"
              required
              value={formValues.mentorTitle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="e.g., Associate Professor, Lab Director"
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isPrincipalInvestigator"
                name="isPrincipalInvestigator"
                type="checkbox"
                checked={formValues.isPrincipalInvestigator}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isPrincipalInvestigator" className="font-medium text-gray-700">I am the Principal Investigator</label>
            </div>
          </div>
          
          {!formValues.isPrincipalInvestigator && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="principalInvestigatorName" className="block text-sm font-medium text-gray-700">Principal Investigator Name</label>
                <input
                  type="text"
                  id="principalInvestigatorName"
                  name="principalInvestigatorName"
                  required={!formValues.isPrincipalInvestigator}
                  value={formValues.principalInvestigatorName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="principalInvestigatorEmail" className="block text-sm font-medium text-gray-700">Principal Investigator Email</label>
                <input
                  type="email"
                  id="principalInvestigatorEmail"
                  name="principalInvestigatorEmail"
                  required={!formValues.isPrincipalInvestigator}
                  value={formValues.principalInvestigatorEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          {!isOnboarding && (
            <button
              type="button"
              onClick={() => router.push('/development/dashboard')}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyProjectCreationForm;