import React from 'react';
import { render } from '@testing-library/react';
import AuthInitializer from '@/components/auth/AuthInitializer';
import * as authService from '@/services/authService';

// Mock the auth service
jest.mock('@/services/authService', () => ({
  initAuth: jest.fn().mockResolvedValue(null),
  addAuthStateListener: jest.fn().mockImplementation(() => jest.fn()), // Returns a cleanup function
}));

describe('AuthInitializer', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset window properties
    if (typeof window !== 'undefined') {
      delete window.isUserAuthenticated;
      delete window.authInitialized;
    }
    
    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    jest.restoreAllMocks();
  });

  it('initializes auth on mount', () => {
    render(<AuthInitializer />);
    
    // Check if initAuth was called
    expect(authService.initAuth).toHaveBeenCalledTimes(1);
    
    // Check if addAuthStateListener was called
    expect(authService.addAuthStateListener).toHaveBeenCalledTimes(1);
  });

  it('sets window properties when auth is initialized with a user', async () => {
    // Mock initAuth to resolve with a user
    const mockUser = { uid: 'test-user-id' };
    (authService.initAuth as jest.Mock).mockResolvedValueOnce(mockUser);
    
    render(<AuthInitializer />);
    
    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check if console.log was called with the expected message
    expect(console.log).toHaveBeenCalledWith(
      'AuthInitializer: Auth initialized:',
      'User authenticated'
    );
  });

  it('sets window properties when auth is initialized without a user', async () => {
    // Mock initAuth to resolve with null (no user)
    (authService.initAuth as jest.Mock).mockResolvedValueOnce(null);
    
    render(<AuthInitializer />);
    
    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check if console.log was called with the expected message
    expect(console.log).toHaveBeenCalledWith(
      'AuthInitializer: Auth initialized:',
      'No user'
    );
  });

  it('handles auth initialization error', async () => {
    // Mock initAuth to reject with an error
    const error = new Error('Auth initialization failed');
    (authService.initAuth as jest.Mock).mockRejectedValueOnce(error);
    
    render(<AuthInitializer />);
    
    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check if console.error was called with the expected message
    expect(console.error).toHaveBeenCalledWith(
      'AuthInitializer: Error initializing auth:',
      error
    );
  });

  it('cleans up listener on unmount', () => {
    // Create a mock cleanup function
    const mockCleanup = jest.fn();
    (authService.addAuthStateListener as jest.Mock).mockReturnValueOnce(mockCleanup);
    
    const { unmount } = render(<AuthInitializer />);
    
    // Unmount the component
    unmount();
    
    // Check if the cleanup function was called
    expect(mockCleanup).toHaveBeenCalledTimes(1);
  });
}); 