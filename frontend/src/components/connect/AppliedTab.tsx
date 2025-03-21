// components/connect/AppliedTab.tsx
import { useEffect, useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAppliedProjects } from '@/services/projectsService';
import { convertConnectProjectsToProjects, extractOriginalId } from '@/utils/connect-helper';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  getStudentApplications, 
  getStudentTopProjects, 
  getMaxTopProjects,
  toggleTopProject
} from '@/services/studentService';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { TopChoicesManager } from '@/components/dashboard/StudentAppliedProjectsTab';

interface AppliedTabProps {
  projects?: Project[];
  appliedProjects?: Project[];
}

const AppliedTab = ({ projects, appliedProjects }: AppliedTabProps) => {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  
  // For top choices functionality
  const [applications, setApplications] = useState<(Application & { project: Project })[]>([]);
  const [topProjects, setTopProjects] = useState<string[]>([]);
  const [maxTopProjects, setMaxTopProjects] = useState(1);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showTopChoices, setShowTopChoices] = useState(true);
  
  // Fetch notifications for applied projects
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        // Query for unread notifications for this user in the applied tab
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          where("isRead", "==", false),
          where("tabContext", "==", 'applied')
        );
        
        const snapshot = await getDocs(notificationsQuery);
        
        const notificationsByProject: Record<string, boolean> = {};
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.projectId) {
            notificationsByProject[data.projectId] = true;
          }
        });
        
        setNotifications(notificationsByProject);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  // Mark notifications as read when a project is opened
  const markNotificationsAsRead = async (projectId: string) => {
    if (!user) return;
    
    try {
      // Query for unread notifications for this user and project
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("isRead", "==", false),
        where("projectId", "==", projectId)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      
      if (!snapshot.empty) {
        // Create a batch to update all notifications at once
        const batch = writeBatch(db);
        
        snapshot.docs.forEach(document => {
          const notificationRef = doc(db, "notifications", document.id);
          batch.update(notificationRef, { isRead: true });
        });
        
        await batch.commit();
        console.log(`Marked ${snapshot.size} notifications as read for project ${projectId}`);
        
        // Update local state to remove notification indicator
        setNotifications(prev => {
          const updated = {...prev};
          delete updated[projectId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  
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
      toast.error('Failed to update top choice status. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  }, [actionInProgress, applications, maxTopProjects, refreshUserData, topProjects]);
  
  // Fetch student applications and top projects
  const fetchApplicationsData = useCallback(async () => {
    if (!user?.uid) return;
    
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
      
      toast.error(errorMessage);
      
      // Fallback to empty data to prevent UI from breaking
      setApplications([]);
      setTopProjects([]);
      setMaxTopProjects(1);
    }
  }, [user?.uid]);
  
  // Fetch applied projects directly if not provided
  useEffect(() => {
    const fetchAppliedProjects = async () => {
      try {
        setIsLoading(true);
        
        // If we already have appliedProjects, use them
        if (appliedProjects && appliedProjects.length > 0) {
          console.log('Using provided appliedProjects:', appliedProjects.length);
          setDisplayProjects(appliedProjects);
          setFetchAttempted(true);
          
          // Also fetch applications and top choices data
          await fetchApplicationsData();
          
          return;
        }
        
        // If we have regular projects, use them (legacy)
        if (projects && projects.length > 0) {
          console.log('Using provided projects:', projects.length);
          setDisplayProjects(projects);
          setFetchAttempted(true);
          
          // Also fetch applications and top choices data
          await fetchApplicationsData();
          
          return;
        }
        
        // Fetch directly from service as a fallback
        console.log('Fetching applied projects directly');
        const fetchedProjects = await getAppliedProjects();
        console.log('Fetched applied projects:', fetchedProjects.length);
        
        // Convert connect projects to full projects
        const convertedProjects = convertConnectProjectsToProjects(fetchedProjects).map(p => ({
          ...p,
          id: `applied_${p.id}`
        }));
        
        console.log('Converted applied projects:', convertedProjects.length);
        setDisplayProjects(convertedProjects);
        setFetchAttempted(true);
        
        // Also fetch applications and top choices data
        await fetchApplicationsData();
      } catch (error) {
        console.error('Error fetching applied projects:', error);
        toast.error('Failed to load applied projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppliedProjects();
  }, [appliedProjects, projects, fetchApplicationsData]);
  
  // Handle click to view project details
  const handleViewDetails = (projectId: string) => {
    // Extract original project ID (without prefixes)
    const cleanId = projectId.startsWith('applied_') 
      ? projectId.substring(8) 
      : projectId;
      
    // Mark notifications as read for this project
    markNotificationsAsRead(cleanId);
      
    // Navigate to project details
    router.push(`/development/student/projects/${cleanId}`);
  };
  
  // Toggle showing top choices section
  const toggleTopChoicesVisibility = () => {
    setShowTopChoices(!showTopChoices);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="w-full mt-6">
      {/* Top choices section */}
      {applications.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Top Choices</h2>
            <button
              onClick={toggleTopChoicesVisibility}
              className="text-sm text-violet-600 hover:text-violet-800"
            >
              {showTopChoices ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showTopChoices && (
            <TopChoicesManager 
              topProjects={topProjects}
              maxTopProjects={maxTopProjects}
              applications={applications}
              onToggleTopProject={handleToggleTopProject}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
      
      <h2 className="text-lg font-semibold text-gray-800 mb-4">All Applications</h2>
      
      {displayProjects.length > 0 ? (
        <div className="space-y-4">
          {displayProjects.map((project) => {
            // Extract original ID for notification checking
            const originalId = project.id.startsWith('applied_') 
              ? project.id.substring(8) 
              : project.id;
            
            // Check if this project has notifications
            const hasNotification = notifications[originalId] || false;
            
            // Check if project is a top choice
            const isTopChoice = topProjects.includes(originalId);
            
            return (
              <div 
                key={project.id} 
                className={`bg-white rounded-xl shadow-md p-4 border ${hasNotification ? 'border-violet-300' : 'border-gray-100'} ${hasNotification ? 'ring-2 ring-violet-200' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                    {isTopChoice && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <StarIconSolid className="h-3 w-3 text-yellow-500 mr-1" />
                        Top Choice
                      </span>
                    )}
                  </div>
                  {hasNotification && (
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                      New update
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  {project.faculty} • {project.department}
                </p>
                <div className="mt-3">
                  <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.skills?.slice(0, 3).map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.skills && project.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{project.skills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">
                      <span className="font-medium text-violet-600">Applied</span>
                    </div>
                    
                    {/* Star button for toggling top choice */}
                    <button
                      onClick={() => handleToggleTopProject(originalId, isTopChoice)}
                      disabled={actionInProgress === originalId}
                      className="text-yellow-500 hover:text-yellow-600 focus:outline-none"
                      aria-label={isTopChoice ? "Remove from top choices" : "Add to top choices"}
                    >
                      {isTopChoice ? (
                        <StarIconSolid className="h-5 w-5" />
                      ) : (
                        <StarIconOutline className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <button 
                    className="text-sm text-violet-600 hover:text-violet-800"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No applications yet.</p>
          <p className="text-gray-500 mt-2">
            Apply to projects in the Browse tab to see them here!
          </p>
          {fetchAttempted && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                If you recently applied to a project, it may take a moment to appear here.
                Try refreshing the page.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppliedTab;