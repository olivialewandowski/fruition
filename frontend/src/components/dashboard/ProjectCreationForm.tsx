import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Timestamp, collection, addDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Helper function to remove undefined fields from an object
const removeUndefinedFields = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, v])
  );
};

interface ProjectFormValues {
  // Project Details
  title: string;
  description: string;
  keywords: string[];
  
  // Position Details
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
  
  // Contact Information
  mentorName: string;
  mentorEmail: string;
  isPrincipalInvestigator: boolean;
  principalInvestigatorName: string;
  principalInvestigatorEmail: string;
  mentorTitle: string;
  department: string;
}

const ProjectCreationForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  // Add debug output to check userData and role
  useEffect(() => {
    console.log('User Data from Auth Context:', userData);
    console.log('User Role:', userData?.role);
    console.log('User Object:', user);
  }, [userData, user]);
  
  // Determine the user's role with a default fallback
  const userRole = userData?.role || 'faculty';
  
  // Initialize form values with empty strings instead of undefined
  const [formValues, setFormValues] = useState<ProjectFormValues>({
    title: '',
    description: '',
    keywords: [],
    qualifications: '',
    startDate: '',
    endDate: '',
    hoursPerWeek: 10,
    positionTypes: [],
    compensationType: [],
    hourlyRate: 15, // Default hourly rate if applicable
    rollingApplications: false,
    applicationCloseDate: '',
    maxPositions: 1,
    mentorName: userData && userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : '',
    mentorEmail: userData && userData.email ? userData.email : '',
    isPrincipalInvestigator: true,
    principalInvestigatorName: '',
    principalInvestigatorEmail: '',
    mentorTitle: '',
    department: '',
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
      }));
    }
  }, [userData]);

  // Define position types based on user role
  const positionTypeOptions = userRole === 'faculty' || userRole === 'admin'
    ? ['Research Assistant', 'Teaching Assistant', 'In-Person', 'Remote', 'Hybrid']
    : ['In-Person', 'Remote', 'Hybrid'];

  // Define compensation options based on user role
  const compensationOptions = userRole === 'faculty' || userRole === 'admin'
    ? ['Paid', 'Volunteer', 'Work-Study', 'Independent Study Credit']
    : ['Paid', 'Volunteer'];

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

    try {
      // Check if user is authenticated
      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }

      console.log('Creating project as user:', user.uid);
      console.log('User role:', userRole);

      // Prepare project data
      const projectData = {
        title: formValues.title,
        description: formValues.description,
        keywords: formValues.keywords,
        
        // Faculty information
        facultyId: user.uid,
        mentorId: user.uid,
        mentorName: formValues.mentorName,
        mentorEmail: formValues.mentorEmail,
        isPrincipalInvestigator: formValues.isPrincipalInvestigator,
        principalInvestigatorName: formValues.isPrincipalInvestigator ? '' : formValues.principalInvestigatorName,
        principalInvestigatorEmail: formValues.isPrincipalInvestigator ? '' : formValues.principalInvestigatorEmail,
        mentorTitle: formValues.mentorTitle,
        
        // Required department and university info (with placeholders if necessary)
        department: formValues.department || 'General',
        departmentId: 'department1',
        universityId: 'university1',
        
        // Status information
        status: "active",
        isActive: true,
        responsibilities: formValues.qualifications,
        teamMembers: [],
        
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('Project data to be created:', projectData);

      // Create the project document
      const projectRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('Project created with ID:', projectRef.id);

      // Prepare position data
      const positionData = {
        projectId: projectRef.id,
        startDate: formValues.startDate ? Timestamp.fromDate(new Date(formValues.startDate)) : Timestamp.now(),
        endDate: formValues.endDate ? Timestamp.fromDate(new Date(formValues.endDate)) : Timestamp.now(),
        hoursPerWeek: formValues.hoursPerWeek,
        positionTypes: formValues.positionTypes,
        compensation: {
          type: formValues.compensationType,
          details: formValues.compensationType.includes('Paid') && formValues.hourlyRate 
            ? `${formValues.hourlyRate}/hour` 
            : ''
        },
        qualifications: formValues.qualifications,
        tags: formValues.keywords,
        maxPositions: formValues.maxPositions,
        filledPositions: 0,
        rollingApplications: formValues.rollingApplications,
        applicationCloseDate: formValues.applicationCloseDate 
          ? Timestamp.fromDate(new Date(formValues.applicationCloseDate)) 
          : null,
        
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('Position data to be created:', positionData);

      // Create the position document
      await addDoc(collection(db, 'projects', projectRef.id, 'positions'), positionData);
      console.log('Position created successfully');

      // Update user's active projects
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const activeProjects = userData.activeProjects || [];
        
        await updateDoc(userRef, {
          activeProjects: [...activeProjects, projectRef.id],
          updatedAt: Timestamp.now()
        });
        console.log('User active projects updated');
      } else {
        console.warn('User document does not exist, creating minimal user doc');
        // Create a basic user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          role: 'faculty', // Default role
          activeProjects: [projectRef.id],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      // Reset form and close
      setIsLoading(false);
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
      
      {/* Debug information - remove in production */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p>User ID: {user?.uid || 'Not authenticated'}</p>
        <p>User Role: {userRole}</p>
      </div>
      
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
        
        {/* Position Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Position Details</h3>
          
          <div>
            <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">Position Responsibilities/Requirements</label>
            <textarea
              id="qualifications"
              name="qualifications"
              required
              rows={4}
              value={formValues.qualifications}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formValues.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
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
              <label htmlFor="maxPositions" className="block text-sm font-medium text-gray-700">Number of Positions</label>
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
            <div className="mt-1 space-y-2">
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
            <div className="mt-1 space-y-2">
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
                required
                min="1"
                step="0.01"
                value={formValues.hourlyRate}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          )}
          
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
                value={formValues.applicationCloseDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          )}
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
          
          {(userRole === 'faculty' || userRole === 'admin') && (
          <>
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
          </>
        )}
        
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
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
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

export default ProjectCreationForm;