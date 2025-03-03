import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_ROLE_PERMISSIONS } from '@/permissions';

// Import the context version without calling it as a hook
let contextAuth: any = null;
try {
  // This is a module reference, not a hook call
  const AuthModule = require('@/contexts/AuthContext');
  contextAuth = AuthModule.useAuth;
} catch (error) {
  // If import fails, we'll use only the local implementation
  console.log("Could not import context auth module");
}

// Original implementation as the main export
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [usingContext, setUsingContext] = useState(false);

  // Always setup the local auth - necessary to follow React Hooks rules
  useEffect(() => {
    // If we're using the context version, skip setting up local auth
    if (usingContext) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            
            // Set permissions based on user role
            if (data.role && DEFAULT_ROLE_PERMISSIONS[data.role]) {
              setPermissions(DEFAULT_ROLE_PERMISSIONS[data.role]);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setPermissions([]);
      }
      
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription
  }, [usingContext]);

  // Try to use context auth if available, but only once on component mount
  useEffect(() => {
    if (contextAuth) {
      try {
        // If we're in a component tree with AuthProvider, use the context
        const contextResult = contextAuth();
        if (contextResult) {
          setUser(contextResult.user);
          setUserData(contextResult.userData);
          setLoading(contextResult.loading);
          setPermissions(contextResult.permissions);
          setUsingContext(true);
        }
      } catch (error) {
        // If context use fails, we'll fall back to the local implementation
        console.log("Context auth not available, using local implementation");
      }
    }
  }, []);

  // Implement required interface
  return { 
    user, 
    userData, 
    loading,
    permissions,
    hasPermission: (permission: string) => permissions.includes(permission),
    hasFeature: (featureId: string) => false, // Simplified implementation
    signOut: async () => { await auth.signOut(); }
  };
}