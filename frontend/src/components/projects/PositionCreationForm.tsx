// src/components/projects/PositionCreationForm.tsx
import React, { useState } from 'react';
import { ProjectWithId } from '@/types/project';
import { Position } from '@/types/position';
import { createPosition } from '@/services/clientProjectService';

interface PositionFormValues {
  title: string;
  qualifications: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  positionTypes: string[];
  compensationType: string[];
  hourlyRate?: number;
  rollingApplications: boolean;
  applicationCloseDate: string;
  maxPositions: number;
  requiresResume: boolean;
  requiresStatement: boolean;
  statementPrompt?: string;
}

interface PositionCreationFormProps {
  projectId: string;
  project: ProjectWithId;
  onSuccess: () => void;
}

const PositionCreationForm: React.FC<PositionCreationFormProps> = ({
  projectId,
  project,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Define position types options
  const positionTypeOptions = ['Research Assistant', 'Teaching Assistant', 'Lab Assistant', 'Software Developer', 'Data Analyst', 'Project Manager', 'Intern', 'In-Person', 'Remote', 'Hybrid'];

  // Define compensation options
  const compensationOptions = ['Paid', 'Volunteer', 'Work-Study', 'Course Credit', 'Independent Study Credit'];
  
  // Initialize form values
  const [formValues, setFormValues] = useState<PositionFormValues>({
    title: '',
    qualifications: '',
    startDate: '', 
    endDate: '', 
    hoursPerWeek: 10,
    positionTypes: [],
    compensationType: [],
    hourlyRate: 15,
    rollingApplications: true,
    applicationCloseDate: '',
    maxPositions: 1,
    requiresResume: true,
    requiresStatement: true,
    statementPrompt: 'Please explain why you are interested in this position and what skills you would bring to the project (150-300 words).'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'positionTypes' || name === 'compensationType') {
      if (checked) {
        setFormValues({
          ...formValues,
          [name]: [...formValues[name], value]
        });
      } else {
        setFormValues({
          ...formValues,
          [name]: formValues[name].filter(item => item !== value)
        });
      }
    } else {
      setFormValues({ ...formValues, [name]: checked });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: Number(value) });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate form data
      if (formValues.compensationType.includes('Paid') && (!formValues.hourlyRate || formValues.hourlyRate <= 0)) {
        throw new Error('Please specify an hourly rate for paid positions');
      }
      
      if (formValues.positionTypes.length === 0) {
        throw new Error('Please select at least one position type');
      }
      
      if (formValues.compensationType.length === 0) {
        throw new Error('Please select at least one compensation type');
      }
      
      // Default position title if empty
      const positionTitle = formValues.title.trim() || 
        `${formValues.positionTypes[0]} Position`;
        
      // Convert dates to proper format
      const startDate = formValues.startDate ? new Date(formValues.startDate) : undefined;
      const endDate = formValues.endDate ? new Date(formValues.endDate) : undefined;
      const applicationCloseDate = formValues.applicationCloseDate ? new Date(formValues.applicationCloseDate) : undefined;
      
      // Prepare position data
      const positionData: Partial<Position> = {
        projectId,
        title: positionTitle,
        qualifications: formValues.qualifications,
        startDate,
        endDate,
        hoursPerWeek: formValues.hoursPerWeek,
        positionTypes: formValues.positionTypes,
        compensation: {
          type: formValues.compensationType,
          details: formValues.compensationType.includes('Paid') 
            ? `$${formValues.hourlyRate || 0}/hour` 
            : formValues.compensationType.join(', ')
        },
        tags: project.keywords, // Use project keywords for position tags
        maxPositions: formValues.maxPositions,
        filledPositions: 0,
        rollingApplications: formValues.rollingApplications,
        status: 'active',
        applicationSettings: {
          requiresResume: formValues.requiresResume,
          requiresStatement: formValues.requiresStatement,
          statementPrompt: formValues.requiresStatement ? formValues.statementPrompt : undefined
        },
        projectTitle: project.title || '',
        projectDescription: project.description || '',
      };
      
      // Only add applicationCloseDate if rolling applications is false AND we have a date
      if (!formValues.rollingApplications && formValues.applicationCloseDate) {
        positionData.applicationCloseDate = applicationCloseDate;
      }
      
      // Create the position
      await createPosition(projectId, positionData);
      
      setSuccessMessage('Position created successfully! Redirecting...');
      
      // Redirect after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err) {
      console.error('Error creating position:', err);
      setError(err instanceof Error ? err.message : 'Failed to create position');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        {/* Position Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Position Details</h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Position Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="e.g., Research Assistant, Software Developer"
            />
            <p className="mt-1 text-sm text-gray-500">
              If left blank, we'll use the position type as the title.
            </p>
          </div>
          
          <div>
            <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">Responsibilities & Requirements</label>
            <textarea
              id="qualifications"
              name="qualifications"
              required
              rows={5}
              value={formValues.qualifications}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="Describe what the candidate will be doing and what qualifications they should have"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formValues.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formValues.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700">Hours Per Week</label>
              <input
                type="number"
                id="hoursPerWeek"
                name="hoursPerWeek"
                required
                min="1"
                max="40"
                value={formValues.hoursPerWeek}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxPositions" className="block text-sm font-medium text-gray-700">
                Number of Spots Available
              </label>
              <input
                type="number"
                id="maxPositions"
                name="maxPositions"
                required
                min="1"
                value={formValues.maxPositions}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Position Type(s)</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-y-2">
              {positionTypeOptions.map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`positionType-${type}`}
                    name="positionTypes"
                    value={type}
                    checked={formValues.positionTypes.includes(type)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`positionType-${type}`} className="ml-2 block text-sm text-gray-700">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Compensation</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-y-2">
              {compensationOptions.map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`compensationType-${type}`}
                    name="compensationType"
                    value={type}
                    checked={formValues.compensationType.includes(type)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`compensationType-${type}`} className="ml-2 block text-sm text-gray-700">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {formValues.compensationType.includes('Paid') && (
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                required={formValues.compensationType.includes('Paid')}
                min="1"
                step="0.01"
                value={formValues.hourlyRate}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          )}
        </div>
        
        {/* Application Settings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Application Settings</h3>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="rollingApplications"
                name="rollingApplications"
                type="checkbox"
                checked={formValues.rollingApplications}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="rollingApplications" className="font-medium text-gray-700">Rolling Applications</label>
              <p className="text-gray-500">Accept applications on an ongoing basis</p>
            </div>
          </div>
          
          {!formValues.rollingApplications && (
            <div>
              <label htmlFor="applicationCloseDate" className="block text-sm font-medium text-gray-700">Application Close Date</label>
              <input
                type="date"
                id="applicationCloseDate"
                name="applicationCloseDate"
                required={!formValues.rollingApplications}
                value={formValues.applicationCloseDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">Required Application Materials</h4>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="requiresResume"
                  name="requiresResume"
                  type="checkbox"
                  checked={formValues.requiresResume}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresResume" className="ml-2 block text-sm text-gray-700">
                  Resume/CV
                </label>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5 mt-1">
                  <input
                    id="requiresStatement"
                    name="requiresStatement"
                    type="checkbox"
                    checked={formValues.requiresStatement}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="requiresStatement" className="block text-sm font-medium text-gray-700">
                    Interest Statement
                  </label>
                  
                  {formValues.requiresStatement && (
                    <div className="mt-2">
                      <label htmlFor="statementPrompt" className="block text-xs text-gray-600">
                        Statement Prompt
                      </label>
                      <textarea
                        id="statementPrompt"
                        name="statementPrompt"
                        rows={2}
                        value={formValues.statementPrompt}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Position'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PositionCreationForm;