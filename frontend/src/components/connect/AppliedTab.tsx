// components/connect/AppliedTab.tsx
import { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAppliedProjects } from '@/services/projectsService';
import { convertConnectProjectsToProjects } from '@/utils/connect-helper';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface AppliedTabProps {
  projects?: Project[];
  appliedProjects?: Project[];
}

const AppliedTab = ({ projects, appliedProjects }: AppliedTabProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  
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
          return;
        }
        
        // If we have regular projects, use them (legacy)
        if (projects && projects.length > 0) {
          console.log('Using provided projects:', projects.length);
          setDisplayProjects(projects);
          setFetchAttempted(true);
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
      } catch (error) {
        console.error('Error fetching applied projects:', error);
        toast.error('Failed to load applied projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppliedProjects();
  }, [appliedProjects, projects]);
  
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="w-full mt-6">
      {displayProjects.length > 0 ? (
        <div className="space-y-4">
          {displayProjects.map((project) => {
            // Extract original ID for notification checking
            const originalId = project.id.startsWith('applied_') 
              ? project.id.substring(8) 
              : project.id;
            
            // Check if this project has notifications
            const hasNotification = notifications[originalId] || false;
            
            return (
              <div 
                key={project.id} 
                className={`bg-white rounded-xl shadow-md p-4 border ${hasNotification ? 'border-violet-300' : 'border-gray-100'} ${hasNotification ? 'ring-2 ring-violet-200' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
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
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-violet-600">Applied</span>
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