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

// Get projects from the API
export const getProjects = async (): Promise<ConnectProject[]> => {
  // In development, immediately return sample data
  if (IS_DEV) {
    console.log('Development mode: Using sample projects data');
    
    // Use try-catch to handle potential auth state issues
    try {
      // Wait for auth to be initialized
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('No authenticated user, returning all sample projects');
        return getSampleProjects();
      }
      
      const user = await getCurrentUser();
      if (!user) {
        console.log('No authenticated user after check, returning all sample projects');
        return getSampleProjects();
      }
      
      // Get saved, applied, and declined project IDs from Firestore
      const savedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'savedProjects', []);
      const appliedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'appliedProjects', []);
      const declinedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'declinedProjects', []);
      
      const excludedIds = [...savedProjectIds, ...appliedProjectIds, ...declinedProjectIds];
      
      // Filter out projects that are already saved, applied, or declined
      return getSampleProjects().filter(project => !excludedIds.includes(project.id));
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      
      // Fallback to all sample projects if Firestore fails
      return getSampleProjects();
    }
  }

  // Production API call logic
  try {
    const response = await axios.get(`${API_URL}/connect/recommended`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    // Fallback to sample data if the API doesn't return any projects
    return getSampleProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Fallback to sample data if the API call fails
    return getSampleProjects();
  }
};

// Add this function to the frontend projectsService.ts
export const getUserProjects = async (status: 'active' | 'archived' | 'applied' = 'active'): Promise<ConnectProject[]> => {
  // In development, immediately return sample data based on status
  if (IS_DEV) {
    console.log(`Development mode: Getting ${status} projects`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot get projects: No authenticated user');
      return [];
    }
    
    try {
      // Get project IDs based on status
      let projectIds: string[] = [];
      
      if (status === 'active') {
        projectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'activeProjects', []);
      } else if (status === 'archived') {
        projectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'archivedProjects', []);
      } else if (status === 'applied') {
        projectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'appliedProjects', []);
      }
      
      if (projectIds.length === 0) {
        return [];
      }
      
      // Return projects matching the IDs
      return getSampleProjects()
        .filter(project => projectIds.includes(project.id))
        .map(project => ({
          ...project
        }));
    } catch (error) {
      console.error(`Error fetching ${status} projects from Firestore:`, error);
      return [];
    }
  }

  // Production API call logic
  try {
    const response = await axios.get(`${API_URL}/projects?status=${status}`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success || response.data.data) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${status} projects:`, error);
    return [];
  }
};

// Get saved projects from the API
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
      
      // Return projects with these IDs
      return getSampleProjects()
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
  // In development, immediately return sample data
  if (IS_DEV) {
    console.log('Development mode: Using sample applied projects data');
    
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
      
      // Get applied project IDs from Firestore
      const appliedProjectIds = await getUserDataFromFirestore<string[]>(user.uid, 'appliedProjects', []);
      console.log('Applied project IDs:', appliedProjectIds);
      
      // Return projects with these IDs
      return getSampleProjects()
        .filter(project => appliedProjectIds.includes(project.id))
        .map(project => ({
          ...project,
          id: `applied_${project.id}` // Ensure unique IDs for React keys
        }));
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
      const appliedProjectIds = await getUserDataFromFirestore<string[]>(currentUser.uid, 'appliedProjects', []);
      
      // Only add if not already in the list
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
      }
      
      return true;
    } catch (error) {
      console.error(`Error applying to project ${projectId}:`, error);
      return false;
    }
  }

  try {
    const response = await axios.post(`${API_URL}/connect/apply/${projectId}`, {}, {
      headers: getAuthHeaders()
    });
    
    return response.data.success || false;
  } catch (error) {
    console.error(`Error applying to project ${projectId}:`, error);
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
      id: '1',
      title: 'Predicting Housing Prices Using Advanced Machine Learning Models',
      description: 'This project explores the application of machine learning techniques to predict housing prices based on features such as location, square footage, and neighborhood amenities.',
      faculty: 'Dr. Jane Smith',
      department: 'Computer Science',
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      duration: '3 months',
      commitment: '10 hours/week'
    },
    {
      id: '2',
      title: 'Modeling Climate Change Impact on Regional Crop Yields',
      description: 'This project examines how climate change variables—temperature, precipitation, and CO₂ levels—affect crop yields using time-series analysis and geospatial modeling.',
      faculty: 'Dr. Michael Kim',
      department: 'Environmental Science',
      skills: ['Python', 'TensorFlow', 'Geospatial Analysis'],
      duration: '6 months',
      commitment: '15 hours/week'
    },
    {
      id: '3',
      title: 'Developing a Mobile App for Mental Health Monitoring',
      description: 'This project involves creating a mobile application that helps users track their mental health metrics over time, providing insights and suggesting resources when needed.',
      faculty: 'Dr. Sarah Johnson',
      department: 'Psychology',
      skills: ['React Native', 'JavaScript', 'UI/UX Design'],
      duration: '4 months',
      commitment: '12 hours/week'
    },
    {
      id: '4',
      title: 'Analyzing Social Media Discourse on Public Health Issues',
      description: 'This project uses natural language processing to analyze how public health topics are discussed across different social media platforms and demographic groups.',
      faculty: 'Dr. Robert Chen',
      department: 'Public Health',
      skills: ['NLP', 'Data Mining', 'Statistical Analysis'],
      duration: '5 months',
      commitment: '8 hours/week'
    },
    {
      id: '5',
      title: 'Quantum Computing Algorithms for Optimization Problems',
      description: 'This project explores how quantum computing can be applied to solve complex optimization problems that are computationally intensive for classical computers.',
      faculty: 'Dr. Emily Rodriguez',
      department: 'Physics',
      skills: ['Quantum Computing', 'Algorithm Design', 'Linear Algebra'],
      duration: '6 months',
      commitment: '20 hours/week'
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