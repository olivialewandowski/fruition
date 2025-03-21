import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { 
  getStudentApplications, 
  getStudentTopProjects, 
  getMaxTopProjects,
  toggleTopProject
} from '@/services/studentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { TopChoicesManager } from './StudentAppliedProjectsTab';
import ActiveProjectsDropdown from './ActiveProjectsDropdown';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface StudentActiveTabApplicationsProps {
  onRefresh?: () => void;
}

const StudentActiveTabApplications: React.FC<StudentActiveTabApplicationsProps> = ({ 
  onRefresh 
}) => {
  const { user, refreshUserData } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<(Application & { project: Project })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topProjects, setTopProjects] = useState<string[]>([]);
  const [maxTopProjects, setMaxTopProjects] = useState(1);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Fetch student applications and top projects
  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch applications
      const applicationsData = await getStudentApplications();
      console.log("Active tab - Successfully fetched applications:", applicationsData?.length || 0);
      setApplications(applicationsData || []);
      
      // Fetch top projects - this function now filters out rejected applications
      const topProjectsData = await getStudentTopProjects();
      console.log("Active tab - Successfully fetched top projects:", topProjectsData?.length || 0);
      setTopProjects(topProjectsData || []);
      
      // Fetch max allowed top projects
      const maxAllowed = await getMaxTopProjects();
      console.log("Active tab - Max allowed top projects:", maxAllowed);
      setMaxTopProjects(maxAllowed);
      
      // Cleanup: Find any rejected applications that are still in top projects
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
    } catch (err) {
      console.error('Error fetching student data:', err);
      const errorMessage = err instanceof Error ? 
        `Failed to load your applications: ${err.message}` : 
        'Failed to load your applications';
      
      setError(errorMessage);
      
      // Fallback to empty data to prevent UI from breaking
      setApplications([]);
      setTopProjects([]);
      setMaxTopProjects(1);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
  
  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      
      // Use the toggleTopProject function which handles both adding and removing
      const isNowTopProject = await toggleTopProject(projectId);
      
      // Update local state based on the result
      if (isNowTopProject) {
        toast.success('Project added to top choices');
        setTopProjects(prev => [...prev, projectId]);
      } else {
        toast.success('Project removed from top choices');
        setTopProjects(prev => prev.filter(id => id !== projectId));
      }
      
      // Refresh applications to update UI
      const applicationsData = await getStudentApplications();
      setApplications(applicationsData || []);
      
      // Refresh user data in context
      await refreshUserData();
    } catch (err) {
      console.error('Error updating top project status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update top project status';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  }, [actionInProgress, applications, maxTopProjects, refreshUserData, topProjects.length]);

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
    onRefresh?.();
  };

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
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
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
    </div>
  );
};

export default StudentActiveTabApplications; 