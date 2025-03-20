// src/components/dashboard/StudentAppliedProjectsTab.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { 
  getStudentApplications, 
  getStudentTopProjects, 
  addTopProject, 
  removeTopProject, 
  getMaxTopProjects,
  toggleTopProject
} from '@/services/studentService';
import { useAuth } from '@/contexts/AuthContext';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ActiveProjectsDropdown from './ActiveProjectsDropdown';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Top Choices Manager component interface
interface TopChoicesManagerProps {
  topProjects: string[];
  maxTopProjects: number;
  applications: (Application & { project: Project })[];
  onToggleTopProject: (projectId: string, isCurrentlyTop: boolean) => Promise<void>;
  isLoading: boolean;
}

// New separate component for Top Choices
export const TopChoicesManager = memo(({ 
  topProjects,
  maxTopProjects,
  applications,
  onToggleTopProject,
  isLoading
}: TopChoicesManagerProps) => {
  // Get only the projects that are marked as top choices
  const topChoiceProjects = applications.filter(app => 
    topProjects.includes(app.project.id)
  );

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-yellow-200">
        <h3 className="text-md font-bold text-gray-900 flex items-center">
          <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" />
          Your Top Choice Projects
        </h3>
        
        <p className="text-sm text-gray-600">
          You have marked <span className="font-semibold">{topProjects.length}</span> of <span className="font-semibold">{maxTopProjects}</span> allowed top choices.
          Faculty will give these applications higher priority.
        </p>
      </div>
      
      {topProjects.length === 0 ? (
        <div className="bg-white p-4 text-center">
          <p className="text-gray-500">
            You haven't marked any projects as top choices yet. 
            Click the star icon next to a project below to mark it as a top choice.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {topChoiceProjects.map(app => (
            <li key={app.id} className="bg-white p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center">
                    <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{app.project.title}</span>
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Top Choice</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1 ml-7 truncate">
                    {app.project.department || 'No department'} • {app.project.mentorName || 'No mentor'}
                  </p>
                  
                  <p className="text-xs text-gray-600 mt-1 ml-7 line-clamp-1">
                    {app.project.description?.substring(0, 100)}...
                  </p>
                </div>
                
                <button 
                  onClick={() => onToggleTopProject(app.project.id, true)}
                  className="ml-2 shrink-0 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded
                    text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  aria-label={`Remove ${app.project.title} from top choices`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

TopChoicesManager.displayName = 'TopChoicesManager';

interface StudentAppliedProjectsTabProps {
  onRefresh?: () => void;
  hideTopChoicesManager?: boolean;
}

const StudentAppliedProjectsTab: React.FC<StudentAppliedProjectsTabProps> = ({ 
  onRefresh,
  hideTopChoicesManager = false 
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
      console.log("Successfully fetched applications:", applicationsData?.length || 0);
      setApplications(applicationsData || []);
      
      // Fetch top projects - this function now filters out rejected applications
      const topProjectsData = await getStudentTopProjects();
      console.log("Successfully fetched top projects:", topProjectsData?.length || 0);
      setTopProjects(topProjectsData || []);
      
      // Fetch max allowed top projects
      const maxAllowed = await getMaxTopProjects();
      console.log("Max allowed top projects:", maxAllowed);
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
        console.log(`Cleaning up ${rejectedTopProjects.length} rejected applications from top projects`);
        
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

  // Format application status with appropriate styling
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Pending Review
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Not Selected
          </span>
        );
      case 'hired':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Hired
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      // Handle Firestore Timestamp, Date object, or string
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleRefresh} 
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-lg text-gray-600 mb-4">{"You haven't applied to any projects yet."}</p>
        <button 
          onClick={() => router.push('/development/connect')}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Browse Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideTopChoicesManager && (
        <>
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
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Applications</h3>
        <p className="text-gray-600">
          Track the status of all projects you've applied to. You'll be notified when there are updates.
        </p>
        
        {maxTopProjects > 0 && topProjects.length === 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start">
              <StarIconOutline className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Mark your top choices:</span> You can 
                  mark up to {maxTopProjects} projects as your top choices to indicate 
                  your highest interest.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Your Applications</h3>
          <p className="text-sm text-gray-500 mt-1">
            Click the star icon next to a project to mark or unmark it as a top choice.
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => {
            const isTopChoice = topProjects.includes(application.project.id);
            const isDisabled = actionInProgress === application.project.id || 
                              (!isTopChoice && topProjects.length >= maxTopProjects);
            
            return (
              <li key={application.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleTopProject(application.project.id, isTopChoice)}
                        disabled={isDisabled}
                        className={`mr-3 p-1.5 rounded-full ${isTopChoice ? 'bg-yellow-100' : 'hover:bg-gray-100'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                        title={isTopChoice 
                          ? "Remove from top choices" 
                          : topProjects.length >= maxTopProjects 
                            ? `You can only select ${maxTopProjects} top projects` 
                            : "Mark as a top choice"
                        }
                        aria-label={isTopChoice 
                          ? `Remove ${application.project.title} from top choices` 
                          : `Mark ${application.project.title} as a top choice`
                        }
                      >
                        {isTopChoice ? (
                          <StarIconSolid className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <StarIconOutline className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      <h4 className="text-lg font-medium text-gray-900">{application.project.title}</h4>
                      {isTopChoice && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Top Choice
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500 ml-11">
                      {application.project.department} • {application.project.mentorName || 'No mentor specified'}
                    </p>
                    
                    <div className="mt-2 ml-11">
                      <p className="text-sm text-gray-700 max-w-2xl line-clamp-2">{application.project.description}</p>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2 ml-11">
                      {application.project.keywords?.slice(0, 3).map((keyword, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="ml-5 flex flex-col items-end space-y-3">
                    <div>{getStatusDisplay(application.status)}</div>
                    <div className="text-sm text-gray-500">Applied: {formatDate(application.submittedAt)}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default memo(StudentAppliedProjectsTab);