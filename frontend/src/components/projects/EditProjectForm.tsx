// src/components/projects/EditProjectForm.tsx
import React, { useState, useEffect } from 'react';
import { ProjectWithId, Project } from '@/types/project';
import { updateProject } from '@/services/clientProjectService';

interface EditProjectFormProps {
  project: ProjectWithId;
  onProjectUpdated: (updatedProject: ProjectWithId) => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project, onProjectUpdated }) => {
  const [formValues, setFormValues] = useState({
    title: project.title || '',
    description: project.description || '',
    keywords: project.keywords || [],
    department: project.department || '',
    mentorName: project.mentorName || '',
    mentorEmail: project.mentorEmail || '',
    mentorTitle: project.mentorTitle || '',
    isPrincipalInvestigator: project.isPrincipalInvestigator !== false,
    principalInvestigatorName: project.principalInvestigatorName || '',
    principalInvestigatorEmail: project.principalInvestigatorEmail || '',
    status: project.status || 'active',
  });

  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Update form when project changes
  useEffect(() => {
    setFormValues({
      title: project.title || '',
      description: project.description || '',
      keywords: project.keywords || [],
      department: project.department || '',
      mentorName: project.mentorName || '',
      mentorEmail: project.mentorEmail || '',
      mentorTitle: project.mentorTitle || '',
      isPrincipalInvestigator: project.isPrincipalInvestigator !== false,
      principalInvestigatorName: project.principalInvestigatorName || '',
      principalInvestigatorEmail: project.principalInvestigatorEmail || '',
      status: project.status || 'active',
    });
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Prepare the update data
      const updateData: Partial<Project> = {
        ...formValues,
        // Handle PI fields to use undefined instead of null
        principalInvestigatorName: formValues.isPrincipalInvestigator ? undefined : formValues.principalInvestigatorName,
        principalInvestigatorEmail: formValues.isPrincipalInvestigator ? undefined : formValues.principalInvestigatorEmail,
      };
      
      // Update project in database
      const updatedProject = await updateProject(project.id, updateData);
      
      // Update parent component state
      onProjectUpdated({ ...project, ...updatedProject });
      
      setSuccessMessage('Project updated successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Project Details</h2>
      
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
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProjectForm;