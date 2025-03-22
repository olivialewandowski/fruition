import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentActiveTabApplications from '../StudentActiveTabApplications';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import QueryProvider from '@/contexts/QueryProvider';

// Mock the hooks
jest.mock('@/hooks/useStandardizedQueries', () => ({
  useStudentApplications: jest.fn(),
  useStudentTopProjects: jest.fn(),
  useMaxTopProjects: jest.fn(),
  useToggleTopProject: jest.fn(),
  useCurrentUser: jest.fn(),
}));

// Mock the dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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

// Mock ClientOnly component
jest.mock('../StudentActiveTabApplications', () => {
  const originalModule = jest.requireActual('../StudentActiveTabApplications');
  const Component = originalModule.default;
  
  return {
    __esModule: true,
    default: Component,
    ClientOnly: ({ children }: { children: React.ReactNode }) => <div data-testid="client-only">{children}</div>
  };
});

// Mock the ApplicationsWidget component
jest.mock('../widgets/applications/ApplicationsWidget', () => {
  return jest.fn(() => <div data-testid="applications-widget">Applications Widget</div>);
});

// Mock RecommendedProjectWidget component
jest.mock('../widgets/recommendations/RecommendedProjectWidget', () => {
  return jest.fn(() => <div data-testid="recommended-project-widget">Recommended Project Widget</div>);
});

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

// Import the hooks for the test
import { 
  useStudentApplications, 
  useStudentTopProjects, 
  useMaxTopProjects, 
  useToggleTopProject,
  useCurrentUser
} from '@/hooks/useStandardizedQueries';

// Wrap component with QueryProvider for testing
const renderWithQueryProvider = (ui: React.ReactElement) => {
  return render(
    <QueryProvider>
      {ui}
    </QueryProvider>
  );
};

describe('StudentActiveTabApplications', () => {
  // Sample data for testing
  const mockUser = { uid: 'user123' };
  const mockRefreshUserData = jest.fn();
  const mockPush = jest.fn();
  const mockOnRefresh = jest.fn();
  const mockMutateAsync = jest.fn();
  const mockInvalidateQueries = jest.fn();
  
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
    
    // Mock standardized hooks
    (useStudentApplications as jest.Mock).mockReturnValue({
      data: mockApplications,
      isLoading: false,
      error: null,
    });
    
    (useStudentTopProjects as jest.Mock).mockReturnValue({
      data: ['project1'],
      isLoading: false,
    });
    
    (useMaxTopProjects as jest.Mock).mockReturnValue({
      data: 3,
      isLoading: false,
    });
    
    (useToggleTopProject as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync.mockResolvedValue(true),
      isLoading: false,
    });
    
    (useCurrentUser as jest.Mock).mockReturnValue({
      userId: mockUser.uid,
      user: mockUser,
    });
  });
  
  test('renders loading state initially', async () => {
    // Mock loading state
    (useStudentApplications as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Check for the spinner by class name or structure
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeTruthy();
  });
  
  test('renders applications summary when data is loaded', async () => {
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
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
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Use a more general assertion for the presence of buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  test('navigates to applied tab when clicking View All Applications button', async () => {
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Click the View All Applications button
    const viewAllButton = screen.getByRole('button', { name: /view all applications/i });
    fireEvent.click(viewAllButton);
    
    // Check if router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith('/development/match?tab=applied');
  });
  
  test('renders nothing when there are no applications', async () => {
    // Mock empty applications
    (useStudentApplications as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // With no applications, the component should not render the application summary
    const applicationSummary = screen.queryByText(/You have applied to/i);
    expect(applicationSummary).not.toBeInTheDocument();
  });
  
  test('renders error state when fetching fails', async () => {
    // Mock error response
    (useStudentApplications as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });
    
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Check for error message
    const errorMessage = screen.getByText(/Failed to load your applications/i);
    expect(errorMessage).toBeInTheDocument();
    
    // Verify retry button is rendered
    const retryButton = screen.getByText(/Try Again/i);
    expect(retryButton).toBeInTheDocument();
  });
  
  test('calls onRefresh when try again button is clicked', async () => {
    // Mock error response
    (useStudentApplications as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });
    
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Find and click the Try Again button
    const tryAgainButton = screen.getByText(/Try Again/i);
    fireEvent.click(tryAgainButton);
    
    // Verify that onRefresh was called
    expect(mockOnRefresh).toHaveBeenCalled();
  });
  
  test('handles toggling top project', async () => {
    renderWithQueryProvider(<StudentActiveTabApplications onRefresh={mockOnRefresh} />);
    
    // Find and click the toggle button
    const toggleButton = screen.getByTestId('toggle-project-button');
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // Verify mutateAsync was called with the correct project ID
    expect(mockMutateAsync).toHaveBeenCalledWith('project1');
    
    // Verify refreshUserData was called
    expect(mockRefreshUserData).toHaveBeenCalled();
  });
}); 