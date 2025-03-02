'use client';

import { useEffect } from 'react';
import { initAuth, addAuthStateListener } from '@/services/authService';

// Declare global window property for TypeScript
declare global {
  interface Window {
    isUserAuthenticated?: boolean;
    authInitialized?: boolean;
  }
}

/**
 * Component that initializes authentication on app load
 * This ensures auth state is properly tracked across page loads
 */
export default function AuthInitializer() {
  useEffect(() => {
    console.log('AuthInitializer: Starting initialization');
    
    // Set initial state
    if (typeof window !== 'undefined') {
      window.authInitialized = false;
    }
    
    // Initialize auth state listener
    const authPromise = initAuth();
    
    // Log when auth is initialized (for debugging)
    authPromise.then((user) => {
      console.log('AuthInitializer: Auth initialized:', user ? 'User authenticated' : 'No user');
      
      // Set global flags immediately when auth is initialized
      if (typeof window !== 'undefined') {
        window.isUserAuthenticated = !!user;
        window.authInitialized = true;
      }
    }).catch(error => {
      console.error('AuthInitializer: Error initializing auth:', error);
      
      // Set initialized flag even on error
      if (typeof window !== 'undefined') {
        window.authInitialized = true;
      }
    });

    // Add a global auth state listener
    const removeListener = addAuthStateListener((user) => {
      console.log('AuthInitializer: Auth state changed:', user ? 'User authenticated' : 'No user');
      
      // Set a global flag that can be checked immediately (for components that can't wait for async)
      if (typeof window !== 'undefined') {
        window.isUserAuthenticated = !!user;
        window.authInitialized = true;
      }
    });

    // Clean up listener on unmount
    return () => {
      console.log('AuthInitializer: Cleaning up');
      removeListener();
    };
  }, []);

  // This component doesn't render anything
  return null;
} 