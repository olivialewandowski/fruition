'use client';

import React, { useState, useEffect, Suspense } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import ApplicationForm from '@/components/match/ApplicationForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { extractOriginalId } from '@/utils/connect-helper';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Function to safely get URL parameters without useSearchParams
function useURLParams() {
  const [params, setParams] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get search params from URL on client side
    const searchParams = new URLSearchParams(window.location.search);
    const paramObj: Record<string, string> = {};
    
    // Convert URLSearchParams to a plain object
    searchParams.forEach((value, key) => {
      paramObj[key] = value;
    });
    
    setParams(paramObj);
  }, []);
  
  return params;
}

// Create a client component that uses URL parameters
function ApplicationContent() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useURLParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('Project Application');
  const [error, setError] = useState<string | null>(null);
  
  // Get projectId and positionId from params
  const projectId = params.projectId || '';
  const positionId = params.positionId;
  
  // Clean the project ID (remove any prefixes)
  const cleanProjectId = extractOriginalId(projectId);

  useEffect(() => {
    if (!projectId) {
      // Wait for params to be populated
      return;
    }
    
    // Debug logging
    console.log("URL params:", params);
    console.log("Project ID:", projectId);
    console.log("Clean Project ID:", cleanProjectId);
    
    // Check if we have a valid project ID
    if (!cleanProjectId) {
      console.error("Invalid project ID:", projectId);
      setError('Invalid project ID');
      setIsLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        console.log(`Fetching project with ID: ${cleanProjectId}`);
        const projectRef = doc(db, 'projects', cleanProjectId);
        const projectDoc = await getDoc(projectRef);
        
        if (!projectDoc.exists()) {
          console.error(`Project not found: ${cleanProjectId}`);
          setError('Project not found');
          return;
        }
        
        const projectData = projectDoc.data();
        console.log("Project data retrieved:", projectData.title);
        setProjectTitle(projectData.title || 'Project Application');
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [cleanProjectId, projectId, params]);

  const handleSuccess = () => {
    // Navigate to the match page with applied tab selected
    window.location.href = '/development/match?tab=applied';
  };

  const handleCancel = () => {
    // Go back to wherever the user came from
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-600 text-xl font-medium mb-4">{error}</div>
        <div className="text-gray-600 mb-6">
          Project ID: {projectId || 'None'}
        </div>
        <button 
          onClick={() => router.push('/development/match')}
          className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ApplicationForm 
        projectId={projectId}
        projectTitle={projectTitle}
        positionId={positionId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

// Main page component with Suspense boundary
const ApplicationPage: React.FC = () => {
  return (
    <BaseLayout title="Apply to Project">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" />
          <span className="ml-4 text-gray-600">Loading application...</span>
        </div>
      }>
        <ApplicationContent />
      </Suspense>
    </BaseLayout>
  );
};

export default ApplicationPage;