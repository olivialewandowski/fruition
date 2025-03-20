import { ConnectProject } from '@/types/project';
import axios from 'axios';
import { auth, db } from '@/config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc, 
  serverTimestamp,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { getCurrentUser, isAuthenticated } from '@/services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/fruition-dev/us-central1/api';
const IS_DEV = process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true' || 
               process.env.NODE_ENV === 'development' || 
               (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Helper function to get auth headers for API requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Firestore helper functions
const getUserDataRef = (userId: string) => {
  return doc(db, 'userData', userId);
};

// Updated type to allow for Firestore timestamp values
type TimestampValue = string | Timestamp | FieldValue;

// Get user data from Firestore
const getUserDataFromFirestore = async <T>(userId: string, field: string, defaultValue: T): Promise<T> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return defaultValue;
    }
    
    const userDocRef = getUserDataRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data()[field] !== undefined) {
      return userDoc.data()[field] as T;
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting ${field} from Firestore:`, error);
    return defaultValue;
  }
};

// Store user data in Firestore
const storeUserDataInFirestore = async (userId: string, field: string, data: any): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    
    const userDocRef = getUserDataRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        [field]: data,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document
      await setDoc(userDocRef, {
        userId,
        [field]: data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`Error storing ${field} in Firestore:`, error);
    throw error; // Rethrow to allow handling by the caller
  }
};

// Store a user action in the action history
const storeUserAction = async (userId: string, action: 'save' | 'apply' | 'decline', projectId: string): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    
    // Get the current action history
    const userDocRef = getUserDataRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    // Create action object with timestamp
    // Use Date.now() instead of serverTimestamp() since serverTimestamp() is not supported in arrays
    const newAction = {
      action,
      projectId,
      timestamp: Date.now() // Use client-side timestamp instead of serverTimestamp()
    };
    
    if (userDoc.exists() && userDoc.data().actionHistory) {
      // Update existing action history
      const actionHistory = userDoc.data().actionHistory || [];
      await updateDoc(userDocRef, {
        actionHistory: [...actionHistory, newAction],
        updatedAt: serverTimestamp() // This is fine as it's not in an array
      });
    } else {
      // Create new action history
      await setDoc(userDocRef, {
        userId,
        actionHistory: [newAction],
        createdAt: serverTimestamp(), // This is fine as it's not in an array
        updatedAt: serverTimestamp() // This is fine as it's not in an array
      }, { merge: true });
    }
  } catch (error) {
    console.error(`Error storing user action in Firestore:`, error);
    throw error;
  }
};

// Get the user's action history
const getUserActionHistory = async (userId: string): Promise<Array<{action: 'save' | 'apply' | 'decline', projectId: string, timestamp: number}>> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return [];
    }
    
    const userDocRef = getUserDataRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().actionHistory) {
      return userDoc.data().actionHistory || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting user action history from Firestore:`, error);
    return [];
  }
};

// Remove the last action from the action history
const removeLastActionFromHistory = async (userId: string): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    
    // Get the current action history
    const userDocRef = getUserDataRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().actionHistory) {
      const actionHistory = userDoc.data().actionHistory || [];
      
      if (actionHistory.length > 0) {
        // Remove the last action
        const updatedHistory = actionHistory.slice(0, -1);
        
        await updateDoc(userDocRef, {
          actionHistory: updatedHistory,
          updatedAt: serverTimestamp() // This is fine as it's not in an array
        });
      }
    }
  } catch (error) {
    console.error(`Error removing last action from history in Firestore:`, error);
    throw error;
  }
};

// NEW: Fetch active projects from Firestore for the match feature
const getActiveProjectsFromFirestore = async (): Promise<ConnectProject[]> => {
  try {
    // Check if Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      return [];
    }
    
    console.log('Fetching active projects from Firestore for match feature');
    
    // Only fetch projects with active status
    const projectsQuery = query(
      collection(db, "projects"), 
      where("status", "==", "active"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const projectsSnapshot = await getDocs(projectsQuery);
    
    const projects: ConnectProject[] = [];
    
    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Map Firestore project to ConnectProject format
      const connectProject: ConnectProject = {
        id: doc.id,
        title: data.title || 'Untitled Project',
        description: data.description || 'No description provided',
        faculty: data.faculty || data.university || 'Research Organization',
        department: data.department || '',
        skills: data.keywords || [],
        duration: data.duration || '',
        commitment: data.commitment || ''
      };
      
      projects.push(connectProject);
    });
    
    console.log(`Fetched ${projects.length} active projects from Firestore`);
    return projects;
  } catch (error) {
    console.error('Error fetching active projects from Firestore:', error);
    return [];
  }
};

// Get projects from the API - MODIFIED to use Firestore directly in dev mode instead of just returning sample data
export const getProjects = async (): Promise<ConnectProject[]> => {
  // In development, use Firestore to get real projects
  if (IS_DEV) {
    console.log('Development mode: Fetching projects from Firestore');
    
    try {
      // Wait for auth to be initialized
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('No authenticated user, returning sample projects');
        return getSampleProjects();
      }
      
      const user = await getCurrentUser();
      if (!user) {
        console.log('No authenticated user after check, returning sample projects');
        return getSampleProjects();
      }
      
      // Get all active projects
      const allProjects = await getActiveProjectsFromFirestore();
      
      // Get the user's applied project IDs from various possible locations
      const appliedProjectIds = await getUserAppliedProjectIds(user.uid);
      
      // Get the user's declined project IDs
      const declinedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'declinedProjects', []);
      
      // Filter out projects that the user has already applied to or declined
      const filteredProjects = allProjects.filter(project => {
        // Don't show projects the user has already applied to
        if (appliedProjectIds.includes(project.id)) {
          return false;
        }
        
        // Don't show projects the user has declined
        if (declinedProjectIds.includes(project.id)) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Returning ${filteredProjects.length} projects after filtering out ${allProjects.length - filteredProjects.length} applied/declined projects`);
      
      // If no projects after filtering, return sample projects
      if (filteredProjects.length === 0) {
        console.log('No active projects after filtering, returning sample projects');
        // Filter sample projects the same way
        const sampleProjects = getSampleProjects();
        return sampleProjects.filter(project => 
          !appliedProjectIds.includes(project.id) && 
          !declinedProjectIds.includes(project.id)
        );
      }
      
      return filteredProjects;
    } catch (error) {
      console.error('Error fetching projects from Firestore:', error);
      return getSampleProjects();
    }
  }

  // Production API call logic
  try {
    const response = await axios.get(`${API_URL}/connect/projects`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Helper function to get all applied project IDs for a user from various locations
// This centralizes the logic for finding applied projects to avoid duplication
const getUserAppliedProjectIds = async (userId: string): Promise<string[]> => {
  try {
    // 1. First try user document projectPreferences.appliedProjects
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    let appliedProjectIds: string[] = [];
    
    if (userDoc.exists()) {
      // Check projectPreferences first
      const prefs = userDoc.data().projectPreferences;
      if (prefs && Array.isArray(prefs.appliedProjects)) {
        appliedProjectIds = prefs.appliedProjects;
        console.log('Found applied project IDs in projectPreferences:', appliedProjectIds);
      } 
      // Then fall back to appliedProjects at root level
      else if (Array.isArray(userDoc.data().appliedProjects)) {
        appliedProjectIds = userDoc.data().appliedProjects;
        console.log('Found applied project IDs at root level:', appliedProjectIds);
      }
    }
    
    // 2. If no projects found, try userData collection as a fallback
    if (appliedProjectIds.length === 0) {
      const userDataRef = doc(db, "userData", userId);
      const userDataDoc = await getDoc(userDataRef);
      
      if (userDataDoc.exists() && Array.isArray(userDataDoc.data().appliedProjects)) {
        appliedProjectIds = userDataDoc.data().appliedProjects;
        console.log('Found applied project IDs in userData collection:', appliedProjectIds);
      }
    }
    
    // 3. If still no projects, check direct applications
    if (appliedProjectIds.length === 0) {
      console.log('No applied project IDs found in user document, checking applications collection');
      const applicationsQuery = query(
        collection(db, "applications"),
        where("studentId", "==", userId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      if (!applicationsSnapshot.empty) {
        const projectIds: string[] = [];
        
        applicationsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.projectId && !projectIds.includes(data.projectId)) {
            projectIds.push(data.projectId);
          }
        });
        
        if (projectIds.length > 0) {
          appliedProjectIds = projectIds;
          console.log('Found project IDs from applications collection:', appliedProjectIds);
          
          // Since we found IDs in applications but not in user document, update the user document
          try {
            await updateDoc(userRef, {
              'projectPreferences.appliedProjects': projectIds,
              updatedAt: serverTimestamp()
            });
            console.log('Updated user document with applied projects from applications');
          } catch (updateErr) {
            console.error('Error updating user document with applied projects:', updateErr);
          }
        }
      }
    }
    
    return appliedProjectIds;
  } catch (error) {
    console.error('Error getting applied project IDs:', error);
    return [];
  }
};

// Get projects for the saved tab
export const getSavedProjects = async (): Promise<ConnectProject[]> => {
  // In development, immediately return sample data
  if (IS_DEV) {
    console.log('Development mode: Using sample saved projects data');
    
    // Use try-catch to handle potential auth state issues
    try {
      // Wait for auth to be initialized
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('No authenticated user, returning empty saved projects');
        return [];
      }
      
      const user = await getCurrentUser();
      if (!user) {
        console.log('No authenticated user after check, returning empty saved projects');
        return [];
      }
      
      // Get saved project IDs from Firestore
      const savedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'savedProjects', []);
      console.log('Saved project IDs:', savedProjectIds);
      
      // First try to get projects from Firestore
      let allProjects = await getActiveProjectsFromFirestore();
      if (allProjects.length === 0) {
        // Fallback to sample projects if no real projects exist
        allProjects = getSampleProjects();
      }
      
      // Return projects with these IDs
      return allProjects
        .filter(project => savedProjectIds.includes(project.id))
        .map(project => ({
          ...project,
          id: `saved_${project.id}` // Ensure unique IDs for React keys
        }));
    } catch (error) {
      console.error('Error fetching saved projects from Firestore:', error);
      return [];
    }
  }

  // Production API call logic
  try {
    const response = await axios.get(`${API_URL}/connect/saved`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    return [];
  }
};

// Get applied projects from the API
export const getAppliedProjects = async (): Promise<ConnectProject[]> => {
  // In development, use real Firestore data
  if (IS_DEV) {
    console.log('Development mode: Fetching applied projects from Firestore');
    
    // Use try-catch to handle potential auth state issues
    try {
      // Wait for auth to be initialized
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('No authenticated user, returning empty applied projects');
        return [];
      }
      
      const user = await getCurrentUser();
      if (!user) {
        console.log('No authenticated user after check, returning empty applied projects');
        return [];
      }
      
      // FIX: Check multiple locations for applied projects
      // 1. First try user document projectPreferences.appliedProjects
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      let appliedProjectIds: string[] = [];
      
      if (userDoc.exists()) {
        // Check projectPreferences first
        const prefs = userDoc.data().projectPreferences;
        if (prefs && Array.isArray(prefs.appliedProjects)) {
          appliedProjectIds = prefs.appliedProjects;
          console.log('Found applied project IDs in projectPreferences:', appliedProjectIds);
        } 
        // Then fall back to appliedProjects at root level
        else if (Array.isArray(userDoc.data().appliedProjects)) {
          appliedProjectIds = userDoc.data().appliedProjects;
          console.log('Found applied project IDs at root level:', appliedProjectIds);
        }
      }
      
      // 2. If no projects found, try userData collection as a fallback
      if (appliedProjectIds.length === 0) {
        const userDataRef = doc(db, "userData", user.uid);
        const userDataDoc = await getDoc(userDataRef);
        
        if (userDataDoc.exists() && Array.isArray(userDataDoc.data().appliedProjects)) {
          appliedProjectIds = userDataDoc.data().appliedProjects;
          console.log('Found applied project IDs in userData collection:', appliedProjectIds);
        }
      }
      
      // 3. If still no projects, check direct applications
      if (appliedProjectIds.length === 0) {
        console.log('No applied project IDs found in user document, checking applications collection');
        const applicationsQuery = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        
        if (!applicationsSnapshot.empty) {
          const projectIds: string[] = [];
          
          applicationsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.projectId && !projectIds.includes(data.projectId)) {
              projectIds.push(data.projectId);
            }
          });
          
          if (projectIds.length > 0) {
            appliedProjectIds = projectIds;
            console.log('Found project IDs from applications collection:', appliedProjectIds);
            
            // Since we found IDs in applications but not in user document, update the user document
            try {
              await updateDoc(userRef, {
                'projectPreferences.appliedProjects': projectIds,
                updatedAt: serverTimestamp()
              });
              console.log('Updated user document with applied projects from applications');
            } catch (updateErr) {
              console.error('Error updating user document with applied projects:', updateErr);
            }
          }
        }
      }
      
      console.log('Final applied project IDs:', appliedProjectIds);
      
      if (appliedProjectIds.length === 0) {
        return [];
      }
      
      // First try to get projects from Firestore
      let allProjects = await getActiveProjectsFromFirestore();
      if (allProjects.length === 0) {
        // Fallback to sample projects if no real projects exist
        allProjects = getSampleProjects();
      }
      
      // Return projects with these IDs
      const appliedProjects = allProjects
        .filter(project => appliedProjectIds.includes(project.id))
        .map(project => ({
          ...project,
          id: project.id // Don't add prefix here, it's handled by the page component
        }));
      
      console.log(`Returning ${appliedProjects.length} applied projects`);
      return appliedProjects;
    } catch (error) {
      console.error('Error fetching applied projects from Firestore:', error);
      return [];
    }
  }

  // Production API call logic
  try {
    const response = await axios.get(`${API_URL}/connect/applied`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching applied projects:', error);
    return [];
  }
};

// Save a project
export const saveProject = async (projectId: string): Promise<boolean> => {
  // In development, immediately return success
  if (IS_DEV) {
    console.log(`Development mode: Simulating save project ${projectId}`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot save project: No authenticated user');
      return false;
    }
    
    try {
      // Get current saved projects
      const savedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'savedProjects', []);
      
      // Only add if not already in the list
      if (!savedProjectIds.includes(projectId)) {
        const updatedSavedProjects = [...savedProjectIds, projectId];
        
        // Store in Firestore
        await storeUserDataInFirestore(currentUser.uid, 'savedProjects', updatedSavedProjects);
        
        // Store timestamp for this action
        const timestamp = serverTimestamp();
        const savedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
          currentUser.uid, 
          'savedProjectsTimestamps', 
          {}
        );
        savedTimestamps[projectId] = timestamp;
        await storeUserDataInFirestore(currentUser.uid, 'savedProjectsTimestamps', savedTimestamps);
        
        // Add to action history
        await storeUserAction(currentUser.uid, 'save', projectId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving project ${projectId}:`, error);
      return false;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/save/${projectId}`, {}, {
      headers: getAuthHeaders()
    });
    
    return response.data.success || false;
  } catch (error) {
    console.error(`Error saving project ${projectId}:`, error);
    return false;
  }
};

// Apply to a project
export const applyToProject = async (projectId: string): Promise<boolean> => {
  // In development, immediately return success
  if (IS_DEV) {
    console.log(`Development mode: Simulating apply to project ${projectId}`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot apply to project: No authenticated user');
      return false;
    }
    
    try {
      // Get current applied projects
      const appliedProjectIds = await getUserAppliedProjectIds(currentUser.uid);
      
      // Check if user has already applied to this project
      if (appliedProjectIds.includes(projectId)) {
        console.error(`User has already applied to project ${projectId}`);
        throw new Error("You have already applied to this project.");
      }
      
      // Only add if not already in the list (extra safeguard)
      if (!appliedProjectIds.includes(projectId)) {
        const updatedAppliedProjects = [...appliedProjectIds, projectId];
        
        // Store in Firestore
        await storeUserDataInFirestore(currentUser.uid, 'appliedProjects', updatedAppliedProjects);
        
        // Store timestamp for this action
        const timestamp = serverTimestamp();
        const appliedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
          currentUser.uid, 
          'appliedProjectsTimestamps', 
          {}
        );
        appliedTimestamps[projectId] = timestamp;
        await storeUserDataInFirestore(currentUser.uid, 'appliedProjectsTimestamps', appliedTimestamps);
        
        // Add to action history
        await storeUserAction(currentUser.uid, 'apply', projectId);
        
        // Also update the projectPreferences.appliedProjects path for consistency
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          try {
            await updateDoc(userRef, {
              "projectPreferences.appliedProjects": updatedAppliedProjects,
              updatedAt: serverTimestamp()
            });
            console.log('Updated user document projectPreferences.appliedProjects');
          } catch (error) {
            console.error('Error updating projectPreferences.appliedProjects:', error);
          }
        }
        
        // Add to applications collection for consistency
        try {
          const applicationData = {
            studentId: currentUser.uid,
            projectId: projectId,
            status: "pending",
            submittedAt: timestamp,
            updatedAt: timestamp
          };
          
          await addDoc(collection(db, "applications"), applicationData);
          console.log('Added application to applications collection');
        } catch (error) {
          console.error('Error adding to applications collection:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error applying to project ${projectId}:`, error);
      throw error;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/apply/${projectId}`, {}, {
      headers: getAuthHeaders()
    });
    
    return response.data.success || false;
  } catch (error: any) {
    console.error(`Error applying to project ${projectId}:`, error);
    // If the error comes from our backend with a message, throw it
    if (error.response?.data?.details) {
      throw new Error(error.response.data.details);
    }
    return false;
  }
};

// Decline a project
export const declineProject = async (projectId: string): Promise<boolean> => {
  // In development, immediately return success
  if (IS_DEV) {
    console.log(`Development mode: Simulating decline project ${projectId}`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot decline project: No authenticated user');
      return false;
    }
    
    try {
      // Get current declined projects
      const declinedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'declinedProjects', []);
      
      // Only add if not already in the list
      if (!declinedProjectIds.includes(projectId)) {
        const updatedDeclinedProjects = [...declinedProjectIds, projectId];
        
        // Store in Firestore
        await storeUserDataInFirestore(currentUser.uid, 'declinedProjects', updatedDeclinedProjects);
        
        // Store timestamp for this action
        const timestamp = serverTimestamp();
        const declinedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
          currentUser.uid, 
          'declinedProjectsTimestamps', 
          {}
        );
        declinedTimestamps[projectId] = timestamp;
        await storeUserDataInFirestore(currentUser.uid, 'declinedProjectsTimestamps', declinedTimestamps);
        
        // Add to action history
        await storeUserAction(currentUser.uid, 'decline', projectId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error declining project ${projectId}:`, error);
      return false;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/decline/${projectId}`, {}, {
      headers: getAuthHeaders()
    });
    
    return response.data.success || false;
  } catch (error) {
    console.error(`Error declining project ${projectId}:`, error);
    return false;
  }
};

// Remove a saved project
export const removeProject = async (projectId: string): Promise<boolean> => {
  // In development, immediately return success
  if (IS_DEV) {
    console.log(`Development mode: Simulating remove project ${projectId}`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot remove project: No authenticated user');
      return false;
    }
    
    try {
      // Get current saved projects
      const savedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'savedProjects', []);
      
      // Only remove if in the list
      if (savedProjectIds.includes(projectId)) {
        const updatedSavedProjects = savedProjectIds.filter(id => id !== projectId);
        
        // Store in Firestore
        await storeUserDataInFirestore(currentUser.uid, 'savedProjects', updatedSavedProjects);
        
        // Remove from timestamps
        const savedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
          currentUser.uid, 
          'savedProjectsTimestamps', 
          {}
        );
        delete savedTimestamps[projectId];
        await storeUserDataInFirestore(currentUser.uid, 'savedProjectsTimestamps', savedTimestamps);
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing project ${projectId}:`, error);
      return false;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/remove/${projectId}`, {}, {
      headers: getAuthHeaders()
    });
    
    return response.data.success || false;
  } catch (error) {
    console.error(`Error removing project ${projectId}:`, error);
    return false;
  }
};

// For testing: Return empty projects
export const getEmptyProjects = async (): Promise<ConnectProject[]> => {
  console.log('Development mode: Testing with empty projects');
  return [];
};

// Sample projects data for fallback
export const getSampleProjects = (): ConnectProject[] => {
  return [
    {
      id: "1",
      title: "AI-Powered Healthcare Diagnostics",
      description: "Develop machine learning algorithms to assist in early disease detection using medical imaging data. This project aims to improve diagnostic accuracy and reduce the workload of healthcare professionals.",
      faculty: "School of Medicine",
      department: "Biomedical Engineering",
      skills: ["Machine Learning", "Python", "Medical Imaging", "Data Analysis"],
      duration: "6-12 months",
      commitment: "10-15 hours per week"
    },
    {
      id: "2",
      title: "Sustainable Urban Planning Simulation",
      description: "Create an interactive simulation tool that helps urban planners visualize the impact of different development strategies on sustainability metrics like energy usage, transportation efficiency, and quality of life.",
      faculty: "College of Environmental Design",
      department: "Urban Studies",
      skills: ["3D Modeling", "Data Visualization", "Sustainability", "JavaScript"],
      duration: "3-6 months",
      commitment: "8-12 hours per week"
    },
    {
      id: "3",
      title: "Quantum Computing Algorithm Development",
      description: "Research and implement novel quantum algorithms for solving complex optimization problems that are intractable with classical computing approaches.",
      faculty: "College of Engineering",
      department: "Computer Science",
      skills: ["Quantum Computing", "Algorithm Design", "Linear Algebra", "Programming"],
      duration: "12+ months",
      commitment: "15-20 hours per week"
    },
    {
      id: "4",
      title: "Behavioral Economics Research Study",
      description: "Design and conduct experiments to investigate how psychological factors influence economic decision-making, with applications in public policy and market design.",
      faculty: "School of Business",
      department: "Economics",
      skills: ["Experimental Design", "Statistical Analysis", "Psychology", "Economics"],
      duration: "3-9 months",
      commitment: "5-10 hours per week"
    },
    {
      id: "5",
      title: "Renewable Energy Storage Solutions",
      description: "Develop and test innovative materials for next-generation batteries that can efficiently store renewable energy from intermittent sources like solar and wind power.",
      faculty: "College of Chemistry",
      department: "Materials Science",
      skills: ["Chemistry", "Lab Work", "Data Analysis", "Renewable Energy"],
      duration: "6-12 months",
      commitment: "10-15 hours per week"
    }
  ];
};

// Completely clear all data for a specific user (for account deletion or testing)
export const purgeUserData = async (userId: string): Promise<void> => {
  try {
    // Delete the user document from Firestore
    const userDocRef = getUserDataRef(userId);
    await setDoc(userDocRef, {
      userId,
      savedProjects: [],
      appliedProjects: [],
      declinedProjects: [],
      updatedAt: serverTimestamp()
    });
    
    console.log(`Purged all data for user: ${userId} in Firestore`);
  } catch (error) {
    console.error(`Error purging data for user ${userId}:`, error);
  }
};

// Undo last action
export const undoLastAction = async (): Promise<{ success: boolean; message: string; undoneProjectId?: string }> => {
  // In development, immediately return success
  if (IS_DEV) {
    console.log(`Development mode: Simulating undo last action`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot undo last action: No authenticated user');
      return { success: false, message: 'No authenticated user' };
    }
    
    try {
      // Get the user's action history
      const actionHistory = await getUserActionHistory(currentUser.uid);
      
      // If no actions to undo
      if (actionHistory.length === 0) {
        return { success: false, message: 'No actions to undo' };
      }
      
      // Get the most recent action
      const mostRecentAction = actionHistory[actionHistory.length - 1];
      
      // Undo the most recent action based on its type
      switch (mostRecentAction.action) {
        case 'save':
          // Get current saved projects
          const savedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'savedProjects', []);
          
          // Remove from saved projects
          const updatedSavedProjects = savedProjectIds.filter(id => id !== mostRecentAction.projectId);
          await storeUserDataInFirestore(currentUser.uid, 'savedProjects', updatedSavedProjects);
          
          // Remove from timestamps
          const savedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
            currentUser.uid, 
            'savedProjectsTimestamps', 
            {}
          );
          const updatedSavedTimestamps = { ...savedTimestamps };
          delete updatedSavedTimestamps[mostRecentAction.projectId];
          await storeUserDataInFirestore(currentUser.uid, 'savedProjectsTimestamps', updatedSavedTimestamps);
          
          // Remove from action history
          await removeLastActionFromHistory(currentUser.uid);
          
          console.log(`Undid save action for project ${mostRecentAction.projectId}`);
          return { 
            success: true, 
            message: `Successfully undid save action for project ${mostRecentAction.projectId}`,
            undoneProjectId: mostRecentAction.projectId
          };
          
        case 'apply':
          // Get current applied projects
          const appliedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'appliedProjects', []);
          
          // Remove from applied projects
          const updatedAppliedProjects = appliedProjectIds.filter(id => id !== mostRecentAction.projectId);
          await storeUserDataInFirestore(currentUser.uid, 'appliedProjects', updatedAppliedProjects);
          
          // Remove from timestamps
          const appliedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
            currentUser.uid, 
            'appliedProjectsTimestamps', 
            {}
          );
          const updatedAppliedTimestamps = { ...appliedTimestamps };
          delete updatedAppliedTimestamps[mostRecentAction.projectId];
          await storeUserDataInFirestore(currentUser.uid, 'appliedProjectsTimestamps', updatedAppliedTimestamps);
          
          // Remove from action history
          await removeLastActionFromHistory(currentUser.uid);
          
          console.log(`Undid apply action for project ${mostRecentAction.projectId}`);
          return { 
            success: true, 
            message: `Successfully undid apply action for project ${mostRecentAction.projectId}`,
            undoneProjectId: mostRecentAction.projectId
          };
          
        case 'decline':
          // Get current declined projects
          const declinedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'declinedProjects', []);
          
          // Remove from declined projects
          const updatedDeclinedProjects = declinedProjectIds.filter(id => id !== mostRecentAction.projectId);
          await storeUserDataInFirestore(currentUser.uid, 'declinedProjects', updatedDeclinedProjects);
          
          // Remove from timestamps
          const declinedTimestamps = await getUserDataFromFirestore<Record<string, TimestampValue>>(
            currentUser.uid, 
            'declinedProjectsTimestamps', 
            {}
          );
          const updatedDeclinedTimestamps = { ...declinedTimestamps };
          delete updatedDeclinedTimestamps[mostRecentAction.projectId];
          await storeUserDataInFirestore(currentUser.uid, 'declinedProjectsTimestamps', updatedDeclinedTimestamps);
          
          // Remove from action history
          await removeLastActionFromHistory(currentUser.uid);
          
          console.log(`Undid decline action for project ${mostRecentAction.projectId}`);
          return { 
            success: true, 
            message: `Successfully undid decline action for project ${mostRecentAction.projectId}`,
            undoneProjectId: mostRecentAction.projectId
          };
          
        default:
          return { success: false, message: 'Unknown action type' };
      }
    } catch (error) {
      console.error(`Error undoing last action:`, error);
      return { success: false, message: 'Error undoing last action' };
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/undo`, {}, {
      headers: getAuthHeaders()
    });
    
    return {
      ...response.data,
      undoneProjectId: response.data.undoneProjectId || undefined
    };
  } catch (error) {
    console.error(`Error undoing last action:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};