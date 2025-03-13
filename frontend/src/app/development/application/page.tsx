'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import ApplicationForm from '@/components/match/ApplicationForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { extractOriginalId } from '@/utils/connect-helper';

const ApplicationPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('Project Application');
  const [error, setError] = useState<string | null>(null);
  
  // Get projectId from search params
  const projectId = searchParams.get('projectId') || '';
  // Get positionId from search params if available
  const positionId = searchParams.get('positionId') || undefined;
  
  // Clean the project ID (remove any prefixes)
  const cleanProjectId = extractOriginalId(projectId);

  useEffect(() => {
    // Check if we have a valid project ID
    if (!cleanProjectId) {
      setError('Invalid project ID');
      setIsLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        const projectRef = doc(db, 'projects', cleanProjectId);
        const projectDoc = await getDoc(projectRef);
        
        if (!projectDoc.exists()) {
          setError('Project not found');
          return;
        }
        
        const projectData = projectDoc.data();
        setProjectTitle(projectData.title || 'Project Application');
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [cleanProjectId]);

  const handleSuccess = () => {
    // Navigate to the dashboard or applied projects page
    router.push('/development/dashboard?tab=applied');
  };

  const handleCancel = () => {
    // Go back to wherever the user came from
    router.back();
  };

  if (isLoading) {
    return (
      <BaseLayout title="Application">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title="Application">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-600 text-xl font-medium mb-4">{error}</div>
          <button 
            onClick={() => router.push('/development/match')}
            className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
          >
            Back to Projects
          </button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Apply to Project">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ApplicationForm 
          projectId={projectId}
          projectTitle={projectTitle}
          positionId={positionId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </BaseLayout>
  );
};

export default ApplicationPage;