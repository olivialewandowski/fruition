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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user?.email);
      setUser(user);
      
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
            role: 'user',
            profileCompleted: false
          };
          console.log('Setting default userData after retries:', defaultUserData);
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