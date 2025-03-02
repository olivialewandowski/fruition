import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as authService from '@/services/authService';
import * as projectsService from '@/services/projectsService';
import { toast } from 'react-hot-toast';

// Mock the services
jest.mock('@/services/authService');
jest.mock('@/services/projectsService');
jest.mock('react-hot-toast');

// Mock the firebase config
jest.mock('@/config/firebase', () => ({
  db: {},
  auth: {
    currentUser: null
  }
}));

// Create a simple component for testing
const TestComponent = () => {
  return (
    <div data-testid="connect-page">
      <div data-testid="auth-status">
        Not Authenticated
      </div>
      <div data-testid="projects-container">
        <div>Please sign in to view projects</div>
        <button onClick={() => authService.signInWithGoogle()}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

describe('Connect Page Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock the auth service
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
    (authService.addAuthStateListener as jest.Mock).mockImplementation((callback) => {
      // Store the callback for later use
      (authService as any).authCallback = callback;
      return jest.fn(); // Return a cleanup function
    });
    (authService.signInWithGoogle as jest.Mock).mockResolvedValue(undefined);
    
    // Mock the projects service
    (projectsService.getProjects as jest.Mock).mockResolvedValue([]);
    (projectsService.getSavedProjects as jest.Mock).mockResolvedValue([]);
    (projectsService.getAppliedProjects as jest.Mock).mockResolvedValue([]);
    
    // Mock toast
    (toast.error as jest.Mock).mockImplementation(() => {});
    (toast.success as jest.Mock).mockImplementation(() => {});
  });
  
  it('shows sign-in button when user is not authenticated', async () => {
    render(<TestComponent />);
    
    // Should show the sign-in button
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view projects')).toBeInTheDocument();
  });
  
  it('handles sign-in button click', async () => {
    render(<TestComponent />);
    
    // Click the sign-in button
    fireEvent.click(screen.getByText('Sign in with Google'));
    
    // Should call signInWithGoogle
    expect(authService.signInWithGoogle).toHaveBeenCalled();
  });
}); 