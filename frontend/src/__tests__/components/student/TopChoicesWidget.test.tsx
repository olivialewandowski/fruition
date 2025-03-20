import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { act } from 'react';
import TopChoicesWidget from '@/components/student/TopChoicesWidget';
import { toast } from 'react-hot-toast';
import * as studentService from '@/services/studentService';

// Mock the student service
jest.mock('@/services/studentService', () => ({
  getStudentTopProjects: jest.fn(),
  removeTopProject: jest.fn(),
  getMaxTopProjects: jest.fn(),
  getStudentApplications: jest.fn(),
}));

// Ensure both toast methods are mocked
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { uid: 'test-user-id' },
    refreshUserData: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Helper to create a delayed promise
const createDelayedPromise = <T,>(data: T, ms = 100): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), ms);
  });
};

describe('TopChoicesWidget Component', () => {
  // Sample data for tests
  const mockTopProjects = ['project1', 'project2'];
  const mockMaxTopProjects = 5;
  const mockApplications = [
    { project: { id: 'project1', title: 'Project One' } },
    { project: { id: 'project2', title: 'Project Two' } },
    { project: { id: 'project3', title: 'Project Three' } }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations for all tests
    (studentService.getStudentTopProjects as jest.Mock).mockResolvedValue(mockTopProjects);
    (studentService.getMaxTopProjects as jest.Mock).mockResolvedValue(mockMaxTopProjects);
    (studentService.getStudentApplications as jest.Mock).mockResolvedValue(mockApplications);
    (studentService.removeTopProject as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('renders loading state initially', async () => {
    // Setup delayed promises for each API call
    (studentService.getStudentTopProjects as jest.Mock).mockImplementation(() => 
      createDelayedPromise(mockTopProjects, 200)
    );
    (studentService.getMaxTopProjects as jest.Mock).mockImplementation(() => 
      createDelayedPromise(mockMaxTopProjects, 200)
    );
    (studentService.getStudentApplications as jest.Mock).mockImplementation(() => 
      createDelayedPromise(mockApplications, 200)
    );

    // Render without advancing timers
    render(<TopChoicesWidget />);
    
    // The loading skeleton should be visible initially
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Cleanup before next test
    await act(async () => {
      jest.runAllTimers();
    });
  });

  it('displays top choices after data is loaded', async () => {
    // Wrap the render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });
    
    // Check for project titles
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    
    // Check for count indication
    expect(screen.getByText(/Using 2 of 5 available slots/i)).toBeInTheDocument();
  });

  it('handles empty top projects list', async () => {
    // Mock empty top projects
    (studentService.getStudentTopProjects as jest.Mock).mockResolvedValue([]);
    
    // Wrap the render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete using waitFor
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });
    
    // Check for empty state message
    expect(screen.getByText(/You haven't selected any top choice projects yet/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock service error
    (studentService.getStudentTopProjects as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    // Wrap the render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete using waitFor
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByText('Failed to load your top choices')).toBeInTheDocument();
    
    // Check for retry button
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('allows removing a top choice', async () => {
    // Make sure we start with good data for this test
    (studentService.getStudentTopProjects as jest.Mock).mockResolvedValue(mockTopProjects);
    (studentService.getMaxTopProjects as jest.Mock).mockResolvedValue(mockMaxTopProjects);
    (studentService.getStudentApplications as jest.Mock).mockResolvedValue(mockApplications);
    
    // Wrap render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete and verify we see the projects
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Project One')).toBeInTheDocument();
    });
    
    // Find and click the remove button for Project One using name matching
    const removeButtons = screen.getAllByRole('button', { 
      name: /Remove .* from top choices/i 
    });
    
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Wrap the button click in act
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });
    
    // Verify with waitFor that the service was called correctly
    await waitFor(() => {
      expect(studentService.removeTopProject).toHaveBeenCalledWith('project1');
      expect(toast.success).toHaveBeenCalledWith('Project removed from top choices');
    });
  });

  it('handles errors when removing a top choice', async () => {
    // Set up failure for removeTopProject but success for loading data
    (studentService.getStudentTopProjects as jest.Mock).mockResolvedValue(mockTopProjects);
    (studentService.getMaxTopProjects as jest.Mock).mockResolvedValue(mockMaxTopProjects);
    (studentService.getStudentApplications as jest.Mock).mockResolvedValue(mockApplications);
    (studentService.removeTopProject as jest.Mock).mockRejectedValue(new Error('Failed to remove'));
    
    // Wrap render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Project One')).toBeInTheDocument();
    });
    
    // Find and click the remove button for Project One using name matching
    const removeButtons = screen.getAllByRole('button', { 
      name: /Remove .* from top choices/i 
    });
    
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Wrap the button click in act
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });
    
    // Verify with waitFor that the error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to remove');
    });
  });

  it('links to the dashboard with the applied tab', async () => {
    // Ensure we have good data loading
    (studentService.getStudentTopProjects as jest.Mock).mockResolvedValue(mockTopProjects);
    
    // Wrap render in act
    await act(async () => {
      render(<TopChoicesWidget />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Project One')).toBeInTheDocument();
    });
    
    // Check for links that navigate to the dashboard with the applied tab
    const manageLink = screen.getByText('Manage Top Choices');
    expect(manageLink).toBeInTheDocument();
    expect(manageLink).toHaveAttribute('href', '/development/dashboard?tab=applied');
  });
}); 