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
  role: string;
  institution: string;
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
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          
          // Set permissions based on user role
          if (data.role && DEFAULT_ROLE_PERMISSIONS[data.role]) {
            setPermissions(DEFAULT_ROLE_PERMISSIONS[data.role]);
          } else {
            setPermissions([]);
          }
        }
      } else {
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