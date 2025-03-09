'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { DEFAULT_ROLE_PERMISSIONS, PermissionId, FEATURES } from '@/permissions';

// Update the UserData interface to use a specific set of roles
interface UserData {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  
  role: "student" | "faculty" | "admin"; // Remove "user" option
  university: string;
  createdAt: string;
  lastActive: string;
  
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
  role: 'student' | 'faculty' | 'admin' | 'user';
  institution?: string;
  createdAt?: string;
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
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const router = useRouter();
  
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
          (!data.profileCompleted && (!data.role || !data.firstName || !data.lastName || !data.institution));
        
        if (isGoogleUser && hasIncompleteData) {
          console.log('Google user with incomplete data detected');
          
          // For Google users with incomplete data, we'll use a more complete default
          // but still mark it as incomplete by returning false
          const defaultUserData: UserData = {
            uid: userId,
            email: user?.email || null,
            firstName: data.firstName || (user?.displayName ? user.displayName.split(' ')[0] : 'User'),
            lastName: data.lastName || (user?.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''),
            role: data.role || 'user',
            institution: data.institution,
            createdAt: data.createdAt,
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
          role: data.role,
          institution: data.institution,
          createdAt: data.createdAt,
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
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Firestore data exists:', data);
            
            // Explicitly construct the userData object with known fields
            const userData: UserData = {
              uid: user.uid,
              email: user.email,
              firstName: data.firstName || 'User',
              lastName: data.lastName || '',
              // Default to "student" if no role is found
              role: data.role === "student" || data.role === "faculty" || data.role === "admin" 
                ? data.role 
                : "student",
              university: data.university || '',
              createdAt: data.createdAt || new Date().toISOString(),
              lastActive: data.lastActive || new Date().toISOString(),
              
              // Ensure these are always arrays or have default values
              activeProjects: data.activeProjects || [],
              archivedProjects: data.archivedProjects || [],

              // Optional fields with fallback
              year: data.year,
              major: data.major,
              minor: data.minor,
              gpa: data.gpa,
              aboutMe: data.aboutMe,
              department: data.department,
              skills: data.skills || [],
              interests: data.interests || [],
              projectPreferences: data.projectPreferences || {
                savedProjects: [],
                appliedProjects: [],
                rejectedProjects: []
              },
              title: data.title,
              researchInterests: data.researchInterests || []
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
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set minimal userData instead of returning
          setUserData({
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
            university: 'university1', // Add default university to fix our issue
            profileCompleted: false, // Keep this from the main branch
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            activeProjects: [],
            archivedProjects: []
          };
          console.log('Setting default userData after retries:', defaultUserData);
          setUserData(defaultUserData);
          setPermissions([]);
        }
      
      setLoading(false); // Always set loading to false at the end
    });

    return unsubscribe;
  }, []);

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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);