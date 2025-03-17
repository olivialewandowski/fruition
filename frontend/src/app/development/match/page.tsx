'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Project, ConnectProject } from '@/types/project';
import BaseLayout from '@/components/layout/BaseLayout';
import MatchProjectsList from '@/components/match/MatchProjectsList';
import AppliedTab from '@/components/connect/AppliedTab';
import SavedTab from '@/components/connect/SavedTab';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import NotificationIndicator from '@/components/ui/NotificationIndicator';
import { collection, query, where, getDocs, getDoc, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  getProjects, 
  applyToProject, 
  saveProject, 
  getSavedProjects, 
  getAppliedProjects, 
  declineProject, 
  removeProject,
  undoLastAction
} from '@/services/projectsService';
import { convertConnectProjectsToProjects, extractOriginalId } from '@/utils/connect-helper';

// Define the tabs for the match page
type MatchTab = 'discover' | 'saved' | 'applied';

// Component to handle tab parameter
function TabParameterHandler({ onTabChange }: { onTabChange: (tab: string) => void }) {
  useEffect(() => {
    // Client-side only code
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['discover', 'saved', 'applied'].includes(tabParam)) {
      onTabChange(tabParam);
    }
  }, [onTabChange]);

  return null;
}

export default function MatchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [appliedProjects, setAppliedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MatchTab>('discover');
  const { user, userData } = useAuth();
  const router = useRouter();
  
  // Define the tabs for match navigation with notification indicators
  const matchTabs = [
    { 
      id: 'discover', 
      label: 'Discover',
      indicator: user ? <NotificationIndicator tab="discover" /> : null
    },
    { 
      id: 'saved', 
      label: 'Saved', 
      count: savedProjects.length,
      indicator: user ? <NotificationIndicator tab="saved" /> : null
    },
    { 
      id: 'applied', 
      label: 'Applied', 
      count: appliedProjects.length,
      indicator: user ? <NotificationIndicator tab="applied" /> : null 
    }
  ];

  // Handle tab change with type conversion
  const handleTabChange = (tabId: string) => {
    // Convert string to MatchTab type
    setActiveTab(tabId as MatchTab);
    
    // Update URL with tab parameter without refreshing the page
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);
    }
    
    // Mark notifications as read for this tab
    if (user) {
      markNotificationsAsRead(tabId);
    }
  };
  
  // Mark notifications as read for the active tab
  const markNotificationsAsRead = async (tabId: string) => {
    if (!user) return;
    
    try {
      // Query for unread notifications for this user and tab
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("isRead", "==", false),
        where("tabContext", "==", tabId)
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
        console.log(`Marked ${snapshot.size} notifications as read for tab ${tabId}`);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Fetch projects function to be called after actions or on load
  const fetchAllProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all types of projects in parallel
      const [connectProjects, savedConnectProjects, appliedConnectProjects] = await Promise.all([
        getProjects(),
        getSavedProjects(),
        getAppliedProjects()
      ]);
      
      // Log to debug
      console.log('Raw applied projects:', appliedConnectProjects);
      
      // Convert connect projects to full projects with special IDs to avoid collisions
      const projectsData = convertConnectProjectsToProjects(connectProjects);
      const savedProjectsData = convertConnectProjectsToProjects(savedConnectProjects).map(p => ({
        ...p,
        id: `saved_${p.id}`
      }));
      const appliedProjectsData = convertConnectProjectsToProjects(appliedConnectProjects).map(p => ({
        ...p,
        id: `applied_${p.id}`
      }));
      
      setProjects(projectsData);
      setSavedProjects(savedProjectsData);
      setAppliedProjects(appliedProjectsData);
      
      console.log('Match page loaded projects:', projectsData.length);
      console.log('Match page loaded saved projects:', savedProjectsData.length);
      console.log('Match page loaded applied projects:', appliedProjectsData.length);
      
      // Check for missing applied projects
      if (appliedConnectProjects.length === 0) {
        try {
          // Check applications collection directly as a fallsafe
          const applicationsQuery = query(
            collection(db, "applications"),
            where("studentId", "==", user.uid)
          );
          
          const applicationsSnapshot = await getDocs(applicationsQuery);
          
          if (!applicationsSnapshot.empty) {
            console.log("Found applications directly in the applications collection");
            
            // Gather projectIds from applications
            const projectIdsFromApplications: string[] = [];
            applicationsSnapshot.forEach(doc => {
              const appData = doc.data();
              if (appData.projectId && !projectIdsFromApplications.includes(appData.projectId)) {
                projectIdsFromApplications.push(appData.projectId);
              }
            });
            
            if (projectIdsFromApplications.length > 0) {
              console.log("Projects from applications:", projectIdsFromApplications);
              
              // Update user documents with these application IDs
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);
              
              if (userDoc.exists()) {
                // Update projectPreferences.appliedProjects
                await updateDoc(userRef, {
                  "projectPreferences.appliedProjects": projectIdsFromApplications,
                  updatedAt: new Date()
                });
                
                // Also update at root level
                await updateDoc(userRef, {
                  appliedProjects: projectIdsFromApplications,
                  updatedAt: new Date()
                });
                
                // Update userData document as well
                const userDataRef = doc(db, "userData", user.uid);
                await updateDoc(userDataRef, {
                  appliedProjects: projectIdsFromApplications,
                  updatedAt: new Date()
                });
                
                console.log("Updated user documents with application data");
                
                // Refresh applied projects
                const refreshedAppliedProjects = await getAppliedProjects();
                const refreshedData = convertConnectProjectsToProjects(refreshedAppliedProjects).map(p => ({
                  ...p,
                  id: `applied_${p.id}`
                }));
                
                setAppliedProjects(refreshedData);
                console.log("Refreshed applied projects:", refreshedData.length);
              }
            }
          }
        } catch (err) {
          console.error("Error checking for missing applied projects:", err);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect non-student users - client-side only
  useEffect(() => {
    // Only redirect on the client side
    if (typeof window !== 'undefined' && userData && userData.role !== 'student' && !isLoading) {
      router.push('/development/dashboard');
      toast.error('The Match feature is only available for Student accounts');
    }
  }, [userData, isLoading, router]);

  // Fetch projects when user is authenticated
  useEffect(() => {
    if (!user) return;
    fetchAllProjects();
    
    // Mark notifications as read for the initial active tab
    markNotificationsAsRead(activeTab);
  }, [user, activeTab]);

  // Handle saving a project
  const handleSaveProject = async (project: Project) => {
    try {
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      const success = await saveProject(originalId);
      
      if (success) {
        toast.success('Project saved!');
        
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
        
        // Add to saved projects
        setSavedProjects(prev => [
          ...prev, 
          { ...project, id: `saved_${originalId}` }
        ]);
      } else {
        toast.error('Failed to save project. Please try again.');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('An error occurred while saving the project.');
    }
  };

  // Handle declining a project
  const handleDeclineProject = async (project: Project) => {
    try {
      // Extract original ID
      const originalId = extractOriginalId(project.id);
      const success = await declineProject(originalId);
      
      if (success) {
        // Remove the project from the current list
        setProjects(projects.filter(p => p.id !== project.id));
      } else {
        toast.error('Failed to decline project. Please try again.');
      }
    } catch (error) {
      console.error('Error declining project:', error);
      toast.error('An error occurred while declining the project.');
    }
  };

  // Handle removing a saved project
  const handleRemoveSavedProject = async (project: Project) => {
    try {
      // Ensure project.id is defined
      if (!project.id) {
        toast.error('Project ID is missing');
        return;
      }
      
      // Extract the original project ID
      const originalId = extractOriginalId(project.id);
      const success = await removeProject(originalId);
      
      if (success) {
        toast.success('Project removed from saved list');
        
        // Remove from saved projects
        setSavedProjects(savedProjects.filter(p => p.id !== project.id));
      } else {
        toast.error('Failed to remove project. Please try again.');
      }
    } catch (error) {
      console.error('Error removing saved project:', error);
      toast.error('An error occurred while removing the project.');
    }
  };

  // Handle undoing the last action
  const handleUndoAction = async () => {
    try {
      const result = await undoLastAction();
      
      if (result.success) {
        toast.success('Action undone successfully');
        
        // Refresh all projects
        await fetchAllProjects();
      } else {
        toast.error(result.message || 'Failed to undo action. Please try again.');
      }
    } catch (error) {
      console.error('Error undoing action:', error);
      toast.error('An error occurred while undoing the action.');
    }
  };

  // Handle manual refresh
  const handleManualRefresh = async () => {
    toast.success('Refreshing projects...');
    await fetchAllProjects();
    toast.success('Projects refreshed');
  };

  return (
    <BaseLayout 
      title="Match" 
      tabs={matchTabs}
      defaultTab="discover"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {/* Tab parameter handler */}
      <Suspense fallback={null}>
        <TabParameterHandler onTabChange={handleTabChange} />
      </Suspense>
      
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {activeTab === 'discover' && (
              <MatchProjectsList 
                projects={projects} 
                onSaveProject={handleSaveProject}
                onApplyProject={() => {}} // This will be handled by the route
                onDeclineProject={handleDeclineProject}
                onUndoAction={handleUndoAction}
              />
            )}
            
            {activeTab === 'saved' && (
              <SavedTab 
                savedProjects={savedProjects} 
                onApplyProject={() => {}} // This will be handled by the route
                onRemoveProject={handleRemoveSavedProject}
              />
            )}
            
            {activeTab === 'applied' && (
              <>
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={handleManualRefresh}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Applications
                  </button>
                </div>
                <AppliedTab appliedProjects={appliedProjects} />
              </>
            )}
          </>
        )}
      </div>
    </BaseLayout>
  );
}