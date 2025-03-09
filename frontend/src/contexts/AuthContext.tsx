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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('Auth state changed. User:', user?.email);
      setUser(user); // Set the user immediately when auth state changes
      
      if (user) {
        try {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          console.log('Fetching user document for UID:', user.uid);
          
          const userDoc = await getDoc(userDocRef);
          console.log('Raw Firestore data:', userDoc.data());
          
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
            uid: user.uid,
            email: user.email,
            firstName: 'User',
            lastName: '',
            role: 'student', // Default to student
            university: '',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            activeProjects: [],
            archivedProjects: []
          });
          setPermissions([]);
        }
      } else {
        console.log('No user, clearing userData and permissions');
        setUserData(null);
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