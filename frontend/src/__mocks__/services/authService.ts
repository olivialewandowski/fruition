import { User } from 'firebase/auth';

/**
 * Mock implementation of the auth service for testing
 */

// Mock the User interface more appropriately
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  emailVerified: true,
  displayName: 'Test User',
  isAnonymous: false,
  providerData: [],
  metadata: {
    creationTime: '1/1/2023, 12:00:00 AM',
    lastSignInTime: '1/1/2023, 12:00:00 AM',
  },
  phoneNumber: null,
  photoURL: null,
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  providerId: 'firebase',  // Add missing property
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
};

// Create a promise that mimics auth initialization
let authInitialized = true;
let currentUser = mockUser;

// Initialization function always resolves with the mockUser
export const initAuth = jest.fn().mockResolvedValue(mockUser);

// Get current user functions
export const getCurrentUser = jest.fn().mockResolvedValue(mockUser);
export const getCurrentUserSync = jest.fn().mockReturnValue(mockUser);

// Authentication status
export const isAuthenticated = jest.fn().mockResolvedValue(true);

// Auth state listener management
const authStateListeners = [];
export const addAuthStateListener = jest.fn((listener) => {
  authStateListeners.push(listener);
  listener(currentUser);
  return jest.fn(() => {
    // removal function
  });
});

// Sign in and sign out functions
export const signInWithGoogle = jest.fn().mockResolvedValue(mockUser);
export const signOut = jest.fn().mockResolvedValue(undefined);

// Password reset functionality
export const sendPasswordResetEmail = jest.fn().mockResolvedValue({ 
  success: true,
  isDevMode: true,
  devModeMessage: 'Mock password reset email sent'
}); 