// Updated ApplicationForm component (components/match/ApplicationForm.tsx)
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { extractOriginalId } from '@/utils/connect-helper';
import { isTopProject, getStudentTopProjects, getMaxTopProjects } from '@/services/studentService';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export interface ApplicationFormProps {
  projectId: string;
  projectTitle: string;
  positionId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface StudentDetails {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  projectId,
  projectTitle,
  positionId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>(positionId || '');
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    firstName: '',
    lastName: '',
    email: '',
    university: ''
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<StudentDetails>>({});
  const [isSavingUserInfo, setIsSavingUserInfo] = useState(false);
  const [markAsTopChoice, setMarkAsTopChoice] = useState(false);
  const [topProjectsCount, setTopProjectsCount] = useState(0);
  const [maxTopProjects, setMaxTopProjects] = useState(1);
  const [canMarkAsTop, setCanMarkAsTop] = useState(true);
  const [isExistingTopChoice, setIsExistingTopChoice] = useState(false);
  
  // Character limit for the message
  const MESSAGE_CHAR_LIMIT = 150;
  
  // Clean the project ID
  const cleanProjectId = extractOriginalId(projectId);
  
  // Fetch positions and student details on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch student details
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStudentDetails({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || user.email || '',
            university: userData.university || ''
          });
        }
        
        // Fetch positions for this project
        if (cleanProjectId) {
          const positionsQuery = query(
            collection(db, 'positions'),
            where('projectId', '==', cleanProjectId)
          );
          
          const positionsSnapshot = await getDocs(positionsQuery);
          
          const positionsData = positionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            };
          });
          
          setPositions(positionsData);
          
          // Select first position if none provided and positions exist
          if (!positionId && positionsData.length > 0) {
            setSelectedPosition(positionsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load application data');
      }
    };
    
    fetchData();
  }, [user, cleanProjectId, positionId]);
  
  // Also fetch top projects data
  useEffect(() => {
    const fetchTopProjectsData = async () => {
      if (!user) return;
      
      try {
        // Check if this project is already a top choice
        const isTop = await isTopProject(cleanProjectId);
        setIsExistingTopChoice(isTop);
        setMarkAsTopChoice(isTop);
        
        // Get current top projects count and max allowed
        const topProjects = await getStudentTopProjects();
        setTopProjectsCount(topProjects.length);
        
        const maxAllowed = await getMaxTopProjects();
        setMaxTopProjects(maxAllowed);
        
        // Determine if user can mark this as a top project
        setCanMarkAsTop(topProjects.length < maxAllowed || isTop);
      } catch (error) {
        console.error('Error fetching top projects data:', error);
      }
    };
    
    fetchTopProjectsData();
  }, [user, cleanProjectId]);
  
  // Handle message change with character limit
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MESSAGE_CHAR_LIMIT) {
      setMessage(newValue);
    }
  };

  // Handle student details changes
  const handleStudentDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name as keyof StudentDetails]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate student details
  const validateStudentDetails = (): boolean => {
    const errors: Partial<StudentDetails> = {};
    
    if (!studentDetails.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!studentDetails.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!studentDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(studentDetails.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!studentDetails.university.trim()) {
      errors.university = 'University is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save user information
  const handleSaveUserInfo = async () => {
    if (!user) return;
    
    if (!validateStudentDetails()) {
      return;
    }
    
    setIsSavingUserInfo(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        firstName: studentDetails.firstName,
        lastName: studentDetails.lastName,
        email: studentDetails.email,
        university: studentDetails.university,
        updatedAt: serverTimestamp()
      });
      
      toast.success('Information updated successfully!');
      setIsEditingInfo(false);
    } catch (error) {
      console.error('Error updating user information:', error);
      toast.error('Failed to update information');
    } finally {
      setIsSavingUserInfo(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to apply');
      return;
    }
    
    if (!selectedPosition) {
      toast.error('Please select a position');
      return;
    }
    
    // Validate student details before submission
    if (!validateStudentDetails()) {
      toast.error('Please complete your information');
      setIsEditingInfo(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find position details
      const position = positions.find(p => p.id === selectedPosition);
      const positionTitle = position?.title || 'Unknown Position';
      
      // Check if this project is in the student's top choices or if they're marking it now
      const isStudentTopChoice = isExistingTopChoice || markAsTopChoice;
      
      // Create application document in Firestore
      const applicationRef = collection(db, 'applications');
      const newApplication = {
        projectId: cleanProjectId,
        positionId: selectedPosition,
        positionTitle: positionTitle,
        studentId: user.uid,
        studentName: `${studentDetails.firstName} ${studentDetails.lastName}`.trim(),
        studentEmail: studentDetails.email,
        studentUniversity: studentDetails.university,
        message: message,
        status: 'pending',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isTopChoice: isStudentTopChoice // Set whether this is a top choice
      };
      
      // Submit the application
      const applicationDoc = await addDoc(applicationRef, newApplication);
      
      // Update user's preferences if marking as top choice and it wasn't already
      if (markAsTopChoice && !isExistingTopChoice) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Add to applied projects if not already there
          await updateDoc(userRef, {
            "projectPreferences.topProjects": arrayUnion(cleanProjectId)
          });
        }
      }
      
      toast.success('Application submitted successfully!');
      
      // Call onSuccess callback
      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {`Apply for "${projectTitle}"`}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Position selection */}
        {positions.length > 0 && (
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="position"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
              required
            >
              <option value="" disabled>Select a position</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Why are you interested in this project?
          </label>
          <div className="relative">
            <textarea
              id="message"
              value={message}
              onChange={handleMessageChange}
              rows={5}
              maxLength={MESSAGE_CHAR_LIMIT}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
              required
              placeholder="Explain why you are interested in this project and how your skills and experience make you a good fit."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {message.length}/{MESSAGE_CHAR_LIMIT}
            </div>
          </div>
        </div>
        
        {/* Top Choice Option */}
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="markAsTopChoice"
                name="markAsTopChoice"
                type="checkbox"
                checked={markAsTopChoice}
                onChange={() => setMarkAsTopChoice(!markAsTopChoice)}
                disabled={!canMarkAsTop || isSubmitting || isExistingTopChoice}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="markAsTopChoice" className="flex items-center text-sm font-medium text-gray-700">
                Mark as Top Choice
                {markAsTopChoice && <StarIconSolid className="h-5 w-5 ml-1 text-yellow-500" />}
                {!markAsTopChoice && <StarIconOutline className="h-5 w-5 ml-1 text-gray-400" />}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {isExistingTopChoice ? 
                  "This project is already in your top choices." :
                  canMarkAsTop ? 
                    `You can mark up to ${maxTopProjects} projects as top choices (${topProjectsCount}/${maxTopProjects} used). Faculty will see this project is of special interest to you.` :
                    `You've already selected ${maxTopProjects} top projects. You can manage your top choices in your dashboard.`
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Student information - editable */}
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-700">Your Information</h3>
            {!isEditingInfo ? (
              <button
                type="button"
                onClick={() => setIsEditingInfo(true)}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  disabled={isSavingUserInfo}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserInfo}
                  className="text-sm text-violet-600 hover:text-violet-800 font-medium"
                  disabled={isSavingUserInfo}
                >
                  {isSavingUserInfo ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          
          {!isEditingInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium">
                  {studentDetails.firstName} {studentDetails.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{studentDetails.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">University</p>
                <p className="text-sm font-medium">{studentDetails.university}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm text-gray-500">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={studentDetails.firstName}
                  onChange={handleStudentDetailChange}
                  className={`mt-1 block w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm`}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm text-gray-500">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={studentDetails.lastName}
                  onChange={handleStudentDetailChange}
                  className={`mt-1 block w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm`}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-gray-500">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={studentDetails.email}
                  onChange={handleStudentDetailChange}
                  className={`mt-1 block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="university" className="block text-sm text-gray-500">University</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={studentDetails.university}
                  onChange={handleStudentDetailChange}
                  className={`mt-1 block w-full px-3 py-2 border ${formErrors.university ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm`}
                />
                {formErrors.university && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.university}</p>
                )}
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3">
            This information will be included with your application and saved to your profile.
          </p>
        </div>
        
        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;