'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { DEFAULT_ROLE_PERMISSIONS, PermissionId, FEATURES } from '@/permissions';

interface UserData {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'admin' | 'user';
  institution?: string;
  createdAt?: string;
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
  hasFeature: () => false,
  permissions: [],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user?.email);
      setUser(user);
      
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
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              institution: data.institution,
              createdAt: data.createdAt,
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
          } else {
            console.warn('No user document found for uid:', user.uid);
            // Only set defaults if document doesn't exist
            const defaultUserData: UserData = {
              uid: user.uid,
              email: user.email,
              firstName: 'User',
              lastName: '',
              role: 'user',
            };
            console.log('Setting default userData:', defaultUserData);
            setUserData(defaultUserData);
            setPermissions([]);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          const defaultUserData: UserData = {
            uid: user.uid,
            email: user.email,
            firstName: 'User',
            lastName: '',
            role: 'user',
          };
          console.log('Setting default userData due to error:', defaultUserData);
          setUserData(defaultUserData);
          setPermissions([]);
        }
      } else {
        console.log('No user, clearing userData and permissions');
        setUserData(null);
        setPermissions([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const handle = setInterval(async () => {
        const token = await user.getIdToken(true);
        // Token refreshed
      }, 10 * 60 * 1000); // Refresh every 10 minutes
      return () => clearInterval(handle);
    }
  }, [user]);

  const signOut = async () => {
    try {
      await auth.signOut();
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
      signOut, 
      hasPermission, 
      hasFeature,
      permissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);