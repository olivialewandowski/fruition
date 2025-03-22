'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { TopChoicesManager } from './StudentAppliedProjectsTab';
import ActiveProjectsDropdown from './ActiveProjectsDropdown';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ApplicationsWidget from './widgets/applications/ApplicationsWidget';
import RecommendedProjectWidget from './widgets/recommendations/RecommendedProjectWidget';
import { 
  useStudentApplications, 
  useStudentTopProjects, 
  useMaxTopProjects,
  useToggleTopProject,
  useCurrentUser
} from '@/hooks/useStandardizedQueries';

interface StudentActiveTabApplicationsProps {
  onRefresh?: () => void;
}

// ClientOnly wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient ? <>{children}</> : null;
}

const StudentActiveTabApplications: React.FC<StudentActiveTabApplicationsProps> = ({ 
  onRefresh 
}) => {
  const { user, refreshUserData } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<(Application & { project: Project })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [topProjects, setTopProjects] = useState<string[]>([]);
  const [maxTopProjects, setMaxTopProjects] = useState(1);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Use standardized query hooks
  const { data: applicationsData, isLoading: isLoadingApplications, error: applicationsError } = useStudentApplications();
  const { data: topProjectsData, isLoading: isLoadingTopProjects } = useStudentTopProjects();
  const { data: maxAllowed, isLoading: isLoadingMaxProjects } = useMaxTopProjects();
  const toggleTopProjectMutation = useToggleTopProject();
  
  // Loading state is true if any of the queries is loading
  const isLoading = isLoadingApplications || isLoadingTopProjects || isLoadingMaxProjects;
  
  // Mark component as mounted to prevent hydration mismatches
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Update local state when query data changes
  useEffect(() => {
    if (applicationsData) {
      console.log("Active tab - Successfully fetched applications:", applicationsData.length || 0);
      setApplications(applicationsData);
    }
  }, [applicationsData]);
  
  useEffect(() => {
    if (topProjectsData) {
      console.log("Active tab - Successfully fetched top projects:", topProjectsData.length || 0);
      setTopProjects(topProjectsData);
    }
  }, [topProjectsData]);
  
  useEffect(() => {
    if (maxAllowed) {
      console.log("Active tab - Max allowed top projects:", maxAllowed);
      setMaxTopProjects(maxAllowed);
    }
  }, [maxAllowed]);
  
  // Handle errors
  useEffect(() => {
    if (applicationsError) {
      const errorMessage = applicationsError instanceof Error ? 
        `Failed to load your applications: ${applicationsError.message}` : 
        'Failed to load your applications';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [applicationsError]);
  
  // Cleanup logic for rejected applications in top projects
  useEffect(() => {
    const cleanupRejectedTopProjects = async () => {
      if (!user?.uid || !applicationsData || !topProjectsData) return;
      
      // Find rejected applications that are still in top projects
      const rejectedTopProjects = (applicationsData || [])
        .filter(app => 
          topProjectsData.includes(app.project.id) && 
          ['rejected', 'closed', 'cancelled', 'declined', 'deleted'].includes(app.status)
        )
        .map(app => app.project.id);
      
      // If any rejected applications are still in top projects, clean them up
      if (rejectedTopProjects.length > 0) {
        console.log(`Active tab - Cleaning up ${rejectedTopProjects.length} rejected applications from top projects`);
        
        // Update local state
        setTopProjects(prev => prev.filter(id => !rejectedTopProjects.includes(id)));
        
        // Update in Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentTopProjects = userData.projectPreferences?.topProjects || [];
          const updatedTopProjects = currentTopProjects.filter(
            (id: string) => !rejectedTopProjects.includes(id)
          );
          
          await updateDoc(userRef, {
            "projectPreferences.topProjects": updatedTopProjects
          });
        }
      }
    };
    
    cleanupRejectedTopProjects();
  }, [user?.uid, applicationsData, topProjectsData]);

  // Handle toggling top project status
  const handleToggleTopProject = useCallback(async (projectId: string, isCurrentlyTop: boolean) => {
    if (actionInProgress) return; // Prevent multiple simultaneous actions
    
    setActionInProgress(projectId);
    
    try {
      if (!isCurrentlyTop && topProjects.length >= maxTopProjects) {
        toast.error(`You can only mark ${maxTopProjects} projects as top choices (5% of your applications)`);
        return;
      }
      
      // Find application to check status
      const application = applications.find(app => app.project.id === projectId);
      
      // Validate application status
      if (application && !isCurrentlyTop && 
          ['rejected', 'closed', 'cancelled', 'declined', 'deleted'].includes(application.status)) {
        toast.error(`Cannot mark a ${application.status} application as a top choice`);
        return;
      }
      
      // Use the toggleTopProject mutation
      await toggleTopProjectMutation.mutateAsync(projectId);
      
      // Success is handled by the mutation's onSuccess callback
      // Local state updates are handled by React Query's cache invalidation
      
      // Refresh user data in context
      await refreshUserData();
    } catch (err) {
      console.error('Error updating top project status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update top project status';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  }, [actionInProgress, applications, maxTopProjects, refreshUserData, topProjects.length, toggleTopProjectMutation]);

  // Handle refresh
  const handleRefresh = () => {
    // The invalidateQueries call in the QueryClient would handle this
    // But we'll still call onRefresh for any parent components
    onRefresh?.();
  };

  // Prevent any rendering during SSR to avoid hydration mismatches
  if (!hasMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleRefresh} 
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If there are no applications, don't render anything
  if (applications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="mb-8">
        {user?.uid && (
          <ClientOnly>
            <ApplicationsWidget userId={user.uid} />
          </ClientOnly>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Applications Section - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Applications</h3>
            <p className="text-gray-600">
              You have applied to <span className="font-semibold">{applications.length}</span> projects. 
              You'll be notified when there are updates to your applications.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => router.push('/development/match?tab=applied')}
                className="px-4 py-2 text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center transition-colors"
              >
                View All Applications
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Recommended Project Widget - Takes 1/3 of the width */}
        <div className="lg:col-span-1">
          {user?.uid && (
            <ClientOnly>
              <RecommendedProjectWidget userId={user.uid} className="h-full" />
            </ClientOnly>
          )}
        </div>
      </div>

      <ClientOnly>
        {topProjects.length < maxTopProjects && (
          <div className="mb-6">
            <ActiveProjectsDropdown
              applications={applications}
              topProjects={topProjects}
              maxTopProjects={maxTopProjects}
              onTopProjectToggled={handleToggleTopProject}
              initialVisibleCount={3}
            />
          </div>
        )}
        
        {topProjects.length > 0 && (
          <div className="mb-6">
            <TopChoicesManager 
              topProjects={topProjects}
              maxTopProjects={maxTopProjects}
              applications={applications}
              onToggleTopProject={handleToggleTopProject}
              isLoading={false}
            />
          </div>
        )}
      </ClientOnly>
    </div>
  );
};

export default StudentActiveTabApplications; 