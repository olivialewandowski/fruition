import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentActiveTabApplications from '../StudentActiveTabApplications';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentApplications, getStudentTopProjects, getMaxTopProjects, toggleTopProject } from '@/services/studentService';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/studentService', () => ({
  getStudentApplications: jest.fn(),
  getStudentTopProjects: jest.fn(),
  getMaxTopProjects: jest.fn(),
  toggleTopProject: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components that are used by StudentActiveTabApplications
jest.mock('../StudentAppliedProjectsTab', () => ({
  TopChoicesManager: jest.fn(({ topProjects, maxTopProjects, applications, onToggleTopProject }) => (
    <div data-testid="top-choices-manager">
      <span>TopChoices: {topProjects.length} / {maxTopProjects}</span>
      <button data-testid="toggle-top-button" onClick={() => onToggleTopProject(applications[0]?.project.id, false)}>
        Toggle Top
      </button>
    </div>
  )),
}));

jest.mock('../ActiveProjectsDropdown', () => {
  return jest.fn(({ applications, topProjects, maxTopProjects, onTopProjectToggled }) => (
    <div data-testid="active-projects-dropdown">
      <span>Active Projects: {applications.length}</span>
      <span>Top Projects: {topProjects.length} / {maxTopProjects}</span>
      <button 
        data-testid="toggle-project-button" 
        onClick={() => onTopProjectToggled(applications[0]?.project.id, false)}
      >
        Toggle Project
      </button>
    </div>
  ));
});

describe('StudentActiveTabApplications', () => {
  // Sample data for testing
  const mockUser = { uid: 'user123' };
  const mockRefreshUserData = jest.fn();
  const mockPush = jest.fn();
  const mockOnRefresh = jest.fn();
  
  const mockApplications = [
    {
      id: 'app1',
      project: {
        id: 'project1',
        title: 'Project 1',
        description: 'Description 1',
        department: 'Department 1',
        mentorName: 'Mentor 1',
        keywords: ['React', 'Firebase'],
      },
      status: 'pending',
      submittedAt: new Date(),
    },
    {
      id: 'app2',
      project: {
        id: 'project2',
        title: 'Project 2',
        description: 'Description 2',
        department: 'Department 2',
        mentorName: 'Mentor 2',
        keywords: ['Angular', 'MongoDB'],
      },
      status: 'accepted',
      submittedAt: new Date(),
    }
  ];
  
  // Default mock implementations
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      refreshUserData: mockRefreshUserData,
    });
    
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock service functions
    (getStudentApplications as jest.Mock).mockResolvedValue(mockApplications);
    (getStudentTopProjects as jest.Mock).mockResolvedValue(['project1']);
    (getMaxTopProjects as jest.Mock).mockResolvedValue(3);
    (toggleTopProject as jest.Mock).mockResolvedValue(true);
  });
  
  test('renders loading state initially', () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Check loading indicator is shown
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
  });
  
  test('renders applications summary when data is loaded', async () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check application summary is displayed
    const summaryText = screen.getByText(/You have applied to/i);
    expect(summaryText).toBeInTheDocument();
    
    // Check application count is displayed
    const applicationCount = screen.getByText('2');
    expect(applicationCount).toBeInTheDocument();
    
    // Check View All Applications button exists
    const viewAllButton = screen.getByRole('button', { name: /view all applications/i });
    expect(viewAllButton).toBeInTheDocument();
  });
  
  test('displays ActiveProjectsDropdown when topProjects < maxTopProjects', async () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check if the ActiveProjectsDropdown is rendered
    const activeProjectsDropdown = screen.getByTestId('active-projects-dropdown');
    expect(activeProjectsDropdown).toBeInTheDocument();
  });
  
  test('displays TopChoicesManager when topProjects.length > 0', async () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check if the TopChoicesManager is rendered
    const topChoicesManager = screen.getByTestId('top-choices-manager');
    expect(topChoicesManager).toBeInTheDocument();
  });
  
  test('handles top project toggling correctly', async () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Click the toggle button
    const toggleButton = screen.getByTestId('toggle-top-button');
    fireEvent.click(toggleButton);
    
    // Check if toggleTopProject was called
    await waitFor(() => {
      expect(toggleTopProject).toHaveBeenCalledWith('project1');
    });
    
    // Check if getStudentApplications was called for refresh
    expect(getStudentApplications).toHaveBeenCalledTimes(2); // Once for initial load, once for refresh
    
    // Check if refreshUserData was called
    expect(mockRefreshUserData).toHaveBeenCalled();
  });
  
  test('navigates to applied tab when clicking View All Applications button', async () => {
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Click the View All Applications button
    const viewAllButton = screen.getByRole('button', { name: /view all applications/i });
    fireEvent.click(viewAllButton);
    
    // Check if router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith('/development/dashboard?tab=applied');
  });
  
  test('renders nothing when there are no applications', async () => {
    // Mock empty applications
    (getStudentApplications as jest.Mock).mockResolvedValue([]);
    
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check that the component renders nothing
    const applicationSummary = screen.queryByText(/You have applied to/i);
    expect(applicationSummary).not.toBeInTheDocument();
    
    const activeProjectsDropdown = screen.queryByTestId('active-projects-dropdown');
    expect(activeProjectsDropdown).not.toBeInTheDocument();
    
    const topChoicesManager = screen.queryByTestId('top-choices-manager');
    expect(topChoicesManager).not.toBeInTheDocument();
  });
  
  test('renders error state when fetching fails', async () => {
    // Mock error response
    (getStudentApplications as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check error message is displayed
    const errorMessage = screen.getByText('Failed to load your applications');
    expect(errorMessage).toBeInTheDocument();
    
    // Check try again button is displayed
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
    
    // Click try again and check if fetchData was called again
    fireEvent.click(tryAgainButton);
    expect(getStudentApplications).toHaveBeenCalledTimes(2);
    expect(mockOnRefresh).toHaveBeenCalled();
  });
}); 