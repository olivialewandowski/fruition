'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, serverTimestamp, Timestamp, FieldValue, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { DEFAULT_ROLE_PERMISSIONS, PermissionId, FEATURES } from '@/permissions';

// Update the UserData interface to use a specific set of roles
interface UserData {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  
  role: "student" | "faculty" | "admin"; // Remove "user" option
  university: string;
  createdAt: string | Timestamp | FieldValue; 
  lastActive: string | Timestamp | FieldValue;
  
  activeProjects: string[];
  archivedProjects: string[];

  // student-specific fields
  year?: string;
  major?: string;
  minor?: string;
  gpa?: number;

  // common fields
  aboutMe?: string;
  department?: string;

  // student-specific arrays
  skills?: string[];
  interests?: string[];
  projectPreferences?: {
    savedProjects: string[];
    appliedProjects: string[];
    rejectedProjects: string[];
  };

  // faculty/admin specific fields
  title?: string;
  researchInterests?: string[];
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasFeature: (featureId: string) => boolean;
  permissions: string[];
  refreshUserData: () => Promise<void>; // Added refreshUserData method
  checkUserHasProjects: (userId: string) => Promise<boolean>; // Added method to check for projects
}

// Provide default implementations for the context methods
const defaultContextValue: AuthContextType = {
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
  hasPermission: () => false,
  hasFeature: () => false,
  permissions: [],
  refreshUserData: async () => {}, // Default implementation
  checkUserHasProjects: async () => false, // Default implementation
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  
  // Function to check if a user has any projects
  const checkUserHasProjects = async (userId: string): Promise<boolean> => {
    try {
      console.log(`Checking if user ${userId} has any projects`);
      
      // Get the user document to find projects
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('User document not found');
        return false;
      }
      
      const userData = userDoc.data();
      
      // Check if user has any active projects
      if (userData.activeProjects && Array.isArray(userData.activeProjects) && userData.activeProjects.length > 0) {
        return true;
      }
      
      // Check if user is a mentor on any projects
      const mentorProjectsQuery = query(
        collection(db, "projects"), 
        where("mentorId", "==", userId)
      );
      
      const mentorProjectsSnapshot = await getDocs(mentorProjectsQuery);
      return !mentorProjectsSnapshot.empty;
      
    } catch (error) {
      console.error('Error checking for user projects:', error);
      return false; // Assume no projects in case of error
    }
  };
  
  // Function to fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user document for UID:', userId);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Firestore data exists:', data);
        
        // Check if this is a Google user with incomplete data
        const isGoogleUser = user?.providerData?.some(provider => provider.providerId === 'google.com');
        const hasIncompleteData = data.profileCompleted === false || 
          (!data.profileCompleted && (!data.role || !data.firstName || !data.lastName || !data.university));
        
        if (isGoogleUser && hasIncompleteData) {
          console.log('Google user with incomplete data detected');
          
          // For Google users with incomplete data, we'll use a more complete default
          // but still mark it as incomplete by returning false
          const defaultUserData: UserData = {
            uid: userId,
            email: user?.email || null,
            firstName: data.firstName || (user?.displayName ? user.displayName.split(' ')[0] : 'User'),
            lastName: data.lastName || (user?.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''),
            role: data.role || 'student', // Default to student instead of 'user'
            university: data.university || '', // Only check for university field
            createdAt: data.createdAt || serverTimestamp(),
            lastActive: serverTimestamp(),
            activeProjects: [],
            archivedProjects: [],
            profileCompleted: data.profileCompleted || false
          };
          
          console.log('Setting temporary userData for Google user:', defaultUserData);
          setUserData(defaultUserData);
          
          // Set basic permissions
          if (defaultUserData.role && DEFAULT_ROLE_PERMISSIONS[defaultUserData.role]) {
            setPermissions(DEFAULT_ROLE_PERMISSIONS[defaultUserData.role]);
          } else {
            setPermissions([]);
          }
          
          return false; // Mark as incomplete to trigger retry
        }
        
        // Normal case - complete user data
        const userData: UserData = {
          uid: userId,
          email: user?.email || null,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'student',
          university: data.university || '', // Only use university field
          createdAt: data.createdAt || serverTimestamp(),
          lastActive: data.lastActive || serverTimestamp(),
          activeProjects: data.activeProjects || [],
          archivedProjects: data.archivedProjects || [],
          profileCompleted: data.profileCompleted || false
        };
        
        console.log('Processed userData:', userData);
        setUserData(userData);
        
        // Set permissions based on user role
        if (userData.role && DEFAULT_ROLE_PERMISSIONS[userData.role]) {
          console.log('Setting permissions for role:', userData.role);
          setPermissions(DEFAULT_ROLE_PERMISSIONS[userData.role]);
        } else {
          console.warn('No permissions found for role:', userData.role);
          setPermissions([]);
        }
        
        return true;
      } else {
        console.warn('No user document found for uid:', userId);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return false;
    }
  };

  // Function to refresh user data - can be called after project creation
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      console.log('Manually refreshing user data from Firestore');
      // Get the latest user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const freshUserData = userDoc.data();
        
        // Update userData with the fresh data
        setUserData(prevUserData => ({
          ...prevUserData!,
          ...freshUserData,
          activeProjects: freshUserData.activeProjects || [],
          archivedProjects: freshUserData.archivedProjects || [],
        }));
        
        console.log('User data refreshed from Firestore:', freshUserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Function to handle faculty redirection
  const handleFacultyRedirection = async (userData: UserData, userId: string) => {
    try {
      // Only process redirection for faculty users
      if (userData.role !== 'faculty') return;
      
      // Skip redirection if already on appropriate pages
      if (pathname?.includes('/faculty-onboarding') || 
          pathname?.includes('/projects/') ||
          pathname?.includes('/login') ||
          pathname?.includes('/signup') ||
          pathname?.includes('/complete-profile')) {
        return;
      }
      
      // Check if faculty user has any projects
      const hasProjects = await checkUserHasProjects(userId);
      console.log(`Faculty user ${userId} has projects: ${hasProjects}`);
      
      // If faculty has no projects, redirect to onboarding page
      if (!hasProjects) {
        console.log('Redirecting faculty to onboarding page');
        router.push('/development/faculty-onboarding');
      } else if (pathname === '/development/dashboard') {
        // If on dashboard, redirect to active projects
        const projectsQuery = query(
          collection(db, "projects"), 
          where("facultyId", "==", userId),
          where("status", "==", "active")
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        
        if (!projectsSnapshot.empty) {
          const firstProject = projectsSnapshot.docs[0];
          console.log(`Redirecting faculty to first project: ${firstProject.id}`);
          router.push(`/development/projects/${firstProject.id}`);
        }
      }
    } catch (error) {
      console.error('Error in faculty redirection:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('Auth state changed. User:', user?.email);
      setUser(user); // Set the user immediately when auth state changes
      
      if (user) {
        // Try to fetch user data with retries
        let dataFetched = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!dataFetched && attempts < maxAttempts) {
          dataFetched = await fetchUserData(user.uid);
          
          if (!dataFetched) {
            attempts++;
            if (attempts < maxAttempts) {
              console.log(`Retry ${attempts}/${maxAttempts} fetching user data...`);
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        // If still no data after retries, set default data
        if (!dataFetched) {
          const defaultUserData: UserData = {
            uid: user.uid,
            email: user.email,
            firstName: 'User',
            lastName: '',
            role: 'student', // Default to student instead of 'user' for better permissions
            university: 'New York University', // Default university
            profileCompleted: false, // Keep this from the main branch
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            activeProjects: [],
            archivedProjects: []
          };
          console.log('Setting default userData after retries:', defaultUserData);
          setUserData(defaultUserData);
          setPermissions([]);
        } else if (userData) {
          // Handle faculty redirection if needed
          await handleFacultyRedirection(userData, user.uid);
        }
      } else {
        setUserData(null);
        setPermissions([]);
      }
      
      setLoading(false); // Always set loading to false at the end
    });

    return unsubscribe;
  }, [pathname]);

  // Effect for handling faculty redirection when userData changes
  useEffect(() => {
    const redirectFacultyIfNeeded = async () => {
      if (userData && user && !loading) {
        await handleFacultyRedirection(userData, user.uid);
      }
    };
    
    redirectFacultyIfNeeded();
  }, [userData, user, loading, pathname]);

  // Implement signOut method
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/development/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Check if user has access to a specific feature
  const hasFeature = (featureId: string): boolean => {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    // Check if user has any of the required permissions for this feature
    return feature.requiredPermissions.some(permission => permissions.includes(permission));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signOut: handleSignOut, 
      hasPermission, 
      hasFeature,
      permissions,
      refreshUserData,
      checkUserHasProjects
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);