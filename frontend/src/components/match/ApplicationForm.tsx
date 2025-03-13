'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { extractOriginalId } from '@/utils/connect-helper';

interface ApplicationFormProps {
  projectId: string;
  projectTitle: string;
  positionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Add a type for the user data
interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  skills?: string[];
  interests?: string[];
  resumeURL?: string;
  resumeName?: string;
  [key: string]: any; // Allow any other properties
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  projectId,
  projectTitle,
  positionId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [interestStatement, setInterestStatement] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [projectData, setProjectData] = useState<any>(null);
  const MAX_CHARS = 600; // About 150 words

  // Cast userData to our defined type
  const typedUserData = userData as unknown as UserData;

  // Clean the project ID (remove any prefixes)
  const cleanProjectId = extractOriginalId(projectId);

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!cleanProjectId) return;
      
      setIsLoading(true);
      try {
        // Get project details
        const projectRef = doc(db, "projects", cleanProjectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          setProjectData(projectDoc.data());
        }
        
        // If no positionId provided, try to get the main position
        if (!positionId && projectDoc.exists()) {
          const projectData = projectDoc.data();
          if (projectData.mainPositionId) {
            const positionRef = doc(db, "positions", projectData.mainPositionId);
            const positionDoc = await getDoc(positionRef);
            if (positionDoc.exists()) {
              // Could set position data here if needed
            }
          }
        }
      } catch (err) {
        console.error("Error loading project details:", err);
        setError("Failed to load project details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectDetails();
  }, [cleanProjectId, positionId]);

  // Update character count when interest statement changes
  useEffect(() => {
    setCharCount(interestStatement.length);
  }, [interestStatement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to apply");
      return;
    }
    
    if (!userData) {
      toast.error("Your profile information is missing");
      return;
    }
    
    if (interestStatement.trim().length < 50) {
      setError("Please provide a more detailed interest statement (at least 50 characters)");
      return;
    }
    
    if (interestStatement.length > MAX_CHARS) {
      setError(`Your statement exceeds the maximum character limit of ${MAX_CHARS}`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const applicationData = {
        projectId: cleanProjectId,
        positionId: positionId || (projectData?.mainPositionId || ''),
        studentId: user.uid,
        studentName: `${typedUserData.firstName || ''} ${typedUserData.lastName || ''}`.trim(),
        studentEmail: typedUserData.email || user.email,
        status: 'pending',
        interestStatement: interestStatement,
        submittedAt: serverTimestamp(),
        // Add student profile information
        studentInfo: {
          major: typedUserData.major || '',
          year: typedUserData.graduationYear || '',
          university: typedUserData.university || '',
          skills: typedUserData.skills || [],
          interests: typedUserData.interests || [],
          resumeURL: typedUserData.resumeURL || '',
          resumeName: typedUserData.resumeName || ''
        }
      };
      
      // Add to Firestore
      await addDoc(collection(db, "applications"), applicationData);
      
      toast.success("Application submitted successfully!");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to dashboard or applied projects page
        router.push('/development/dashboard');
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply to Project</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">{projectTitle}</h3>
        {projectData && (
          <p className="text-sm text-gray-500 mt-1">
            {projectData.department || projectData.faculty || "Research Project"}
          </p>
        )}
      </div>
      
      {/* Applicant Information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">Your Profile Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-500">Name</span>
            <span className="font-medium">{typedUserData?.firstName} {typedUserData?.lastName}</span>
          </div>
          <div>
            <span className="block text-gray-500">Email</span>
            <span>{typedUserData?.email || user?.email}</span>
          </div>
          <div>
            <span className="block text-gray-500">University</span>
            <span>{typedUserData?.university || "Not specified"}</span>
          </div>
          <div>
            <span className="block text-gray-500">Major</span>
            <span>{typedUserData?.major || "Not specified"}</span>
          </div>
          <div>
            <span className="block text-gray-500">Graduation Year</span>
            <span>{typedUserData?.graduationYear || "Not specified"}</span>
          </div>
          <div>
            <span className="block text-gray-500">Resume</span>
            <span>{typedUserData?.resumeName ? typedUserData.resumeName : "No resume uploaded"}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-violet-600">
          <a href="/development/profile" target="_blank" rel="noopener noreferrer">
            Review or update your profile
          </a>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Why are you interested in this project, and how will you apply your skills to the project?
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={6}
            value={interestStatement}
            onChange={(e) => setInterestStatement(e.target.value)}
            placeholder="Describe your interest in this project and the specific skills you will contribute..."
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className={charCount > MAX_CHARS ? "text-red-500" : "text-gray-500"}>
              {charCount}/{MAX_CHARS} characters (approximately {Math.round(charCount / 4)} words)
            </span>
            <span className="text-gray-500">
              Aim for around 150 words
            </span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;