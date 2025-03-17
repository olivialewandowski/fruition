import { auth } from '@/config/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';

// Create a promise that resolves when auth is initialized
let authInitialized = false;
let currentUser: User | null = null;
let authInitializedPromise: Promise<User | null>;
let authStateListeners: ((user: User | null) => void)[] = [];

// Initialize the auth state listener
const initAuthState = () => {
  if (typeof window === 'undefined') {
    // Server-side, return a resolved promise with null
    return Promise.resolve(null);
  }

  console.log('authService: Initializing auth state');
  
  if (!authInitialized) {
    authInitializedPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('authService: Auth state changed:', user ? `User authenticated (${user.uid})` : 'No user');
        currentUser = user;
        authInitialized = true;
        
        // Set global window properties if available
        if (typeof window !== 'undefined') {
          window.isUserAuthenticated = !!user;
          window.authInitialized = true;
        }
        
        // Notify all listeners
        authStateListeners.forEach(listener => listener(user));
        
        resolve(user);
        // Don't unsubscribe to keep listening to auth state changes
      });
    });
    authInitialized = true;
  }

  return authInitializedPromise;
};

// Get the current user, waiting for auth to initialize if needed
export const getCurrentUser = async (): Promise<User | null> => {
  if (!authInitialized) {
    await initAuthState();
  }
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

// Export the auth initialization function
export const initAuth = initAuthState;

// Export a synchronous function to get the current user (use with caution)
export const getCurrentUserSync = (): User | null => {
  return auth.currentUser;
};

// Add a listener for auth state changes
export const addAuthStateListener = (listener: (user: User | null) => void): () => void => {
  authStateListeners.push(listener);
  
  // If auth is already initialized, call the listener immediately
  if (authInitialized && currentUser !== undefined) {
    listener(currentUser);
  }
  
  // Return a function to remove the listener
  return () => {
    authStateListeners = authStateListeners.filter(l => l !== listener);
  };
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    // Create a new provider for each sign-in attempt
    const provider = new GoogleAuthProvider();
    
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Attempt sign in with popup
    console.log('Attempting Google sign-in with popup');
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful');
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Helper function to check if we're in development mode
const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         (typeof window !== 'undefined' && window.location.hostname === 'localhost');
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string): Promise<{ 
  success: boolean; 
  error?: string;
  isDevMode?: boolean;
  devModeMessage?: string;
}> => {
  // Check if we're in development mode
  const isDevMode = isDevelopmentMode();
  
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    
    // In development mode, provide additional information
    if (isDevMode) {
      console.log(`[DEV MODE] Password reset email for ${email} would be sent in production.`);
      
      return { 
        success: true,
        isDevMode: true,
        devModeMessage: `In development mode, password reset emails are not actually sent. In production, a real email would be sent to ${email}. Check Firebase Auth Emulator logs for the reset link if you're using emulators.`
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    // Map Firebase error codes to user-friendly messages
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      isDevMode: isDevMode
    };
  }
};