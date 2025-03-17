// Updated ApplicationForm component (components/match/ApplicationForm.tsx)
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { extractOriginalId } from '@/utils/connect-helper';

export interface ApplicationFormProps {
  projectId: string;
  projectTitle: string;
  positionId?: string;
  onSuccess: () => void;
  onCancel: () => void;
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
  const [studentDetails, setStudentDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: ''
  });
  
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
    
    setIsSubmitting(true);
    
    try {
      // Find position details
      const position = positions.find(p => p.id === selectedPosition);
      const positionTitle = position?.title || 'Unknown Position';
      
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
        lastUpdated: serverTimestamp()
      };
      
      await addDoc(applicationRef, newApplication);
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
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="Explain why you are interested in this project and how your skills and experience make you a good fit."
          />
        </div>
        
        {/* Student information - readonly summary */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-md font-medium text-gray-700 mb-2">Your Information</h3>
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
          <p className="text-xs text-gray-500 mt-2">
            This information will be included with your application.
            To update your profile, visit your account settings.
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