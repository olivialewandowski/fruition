import { 
  initAuth, 
  getCurrentUser, 
  isAuthenticated, 
  getCurrentUserSync, 
  addAuthStateListener,
  signInWithGoogle,
  signOut
} from '@/services/authService';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Mock Firebase auth
jest.mock('@/config/firebase', () => ({
  auth: {
    currentUser: null,
    signOut: jest.fn().mockResolvedValue(undefined),
    onAuthStateChanged: jest.fn()
  }
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // Return a mock unsubscribe function
  }),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn()
  }))
}));

describe('authService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset auth state
    (auth as any).currentUser = null;
    
    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initAuth', () => {
    it('initializes auth state and resolves with the current user', async () => {
      // Mock onAuthStateChanged to call the callback with a user
      const mockUser = { uid: 'test-user-id' } as User;
      (onAuthStateChanged as jest.Mock).mockImplementationOnce((auth, callback) => {
        callback(mockUser);
        return jest.fn(); // Return a mock unsubscribe function
      });

      const result = await initAuth();
      
      expect(result).toEqual(mockUser);
      expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
    });

    it('handles server-side rendering', async () => {
      // Save the original window
      const originalWindow = global.window;
      
      // Delete window to simulate server-side rendering
      delete (global as any).window;
      
      const result = await initAuth();
      
      expect(result).toBeNull();
      expect(onAuthStateChanged).not.toHaveBeenCalled();
      
      // Restore window
      (global as any).window = originalWindow;
    });
  });

  describe('getCurrentUser', () => {
    it('returns the current user when auth is initialized', async () => {
      // Set up a mock user
      const mockUser = { uid: 'test-user-id' } as User;
      (auth as any).currentUser = mockUser;
      
      const result = await getCurrentUser();
      
      expect(result).toEqual(mockUser);
    });

    it('initializes auth if not already initialized', async () => {
      // Mock initAuth to resolve with a user
      const mockUser = { uid: 'test-user-id' } as User;
      (auth as any).currentUser = mockUser;
      
      const result = await getCurrentUser();
      
      expect(result).toEqual(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when a user is authenticated', async () => {
      // Set up a mock user
      const mockUser = { uid: 'test-user-id' } as User;
      (auth as any).currentUser = mockUser;
      
      const result = await isAuthenticated();
      
      expect(result).toBe(true);
    });

    it('returns false when no user is authenticated', async () => {
      // Ensure no user is set
      (auth as any).currentUser = null;
      
      const result = await isAuthenticated();
      
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUserSync', () => {
    it('returns the current user synchronously', () => {
      // Set up a mock user
      const mockUser = { uid: 'test-user-id' } as User;
      (auth as any).currentUser = mockUser;
      
      const result = getCurrentUserSync();
      
      expect(result).toEqual(mockUser);
    });

    it('returns null when no user is authenticated', () => {
      // Ensure no user is set
      (auth as any).currentUser = null;
      
      const result = getCurrentUserSync();
      
      expect(result).toBeNull();
    });
  });

  describe('addAuthStateListener', () => {
    it('adds a listener for auth state changes', () => {
      const listener = jest.fn();
      
      const removeListener = addAuthStateListener(listener);
      
      expect(typeof removeListener).toBe('function');
    });

    it('calls the listener immediately if auth is already initialized', () => {
      // Set up a mock user
      const mockUser = { uid: 'test-user-id' } as User;
      
      // Mock onAuthStateChanged to call the callback with a user
      (onAuthStateChanged as jest.Mock).mockImplementationOnce((auth, callback) => {
        callback(mockUser);
        return jest.fn(); // Return a mock unsubscribe function
      });
      
      // Initialize auth
      initAuth();
      
      // Add a listener
      const listener = jest.fn();
      addAuthStateListener(listener);
      
      // The listener should be called immediately
      expect(listener).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signInWithGoogle', () => {
    it('signs in with Google and returns the user', async () => {
      // Mock signInWithPopup to resolve with a user
      const mockUser = { uid: 'test-user-id' } as User;
      (signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: mockUser });
      
      const result = await signInWithGoogle();
      
      expect(result).toEqual(mockUser);
      expect(signInWithPopup).toHaveBeenCalled();
      expect(GoogleAuthProvider).toHaveBeenCalled();
    });

    it('handles sign-in errors', async () => {
      // Mock signInWithPopup to reject with an error
      const error = new Error('Sign-in failed');
      (signInWithPopup as jest.Mock).mockRejectedValueOnce(error);
      
      const result = await signInWithGoogle();
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error signing in with Google:', error);
    });
  });

  describe('signOut', () => {
    it('signs out the user', async () => {
      await signOut();
      
      expect(auth.signOut).toHaveBeenCalled();
    });

    it('handles sign-out errors', async () => {
      // Mock signOut to reject with an error
      const error = new Error('Sign-out failed');
      (auth.signOut as jest.Mock).mockRejectedValueOnce(error);
      
      await signOut();
      
      expect(console.error).toHaveBeenCalledWith('Error signing out:', error);
    });
  });
}); 