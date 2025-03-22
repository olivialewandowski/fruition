import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import ProjectsPage from '@/app/development/dashboard/page';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects } from '@/services/clientProjectService';

// Define types for mock components
interface TabItem {
  id: string;
  label: string;
}

interface TopNavigationProps {
  title: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/clientProjectService', () => ({
  getUserProjects: jest.fn(),
}));

jest.mock('@/components/layout/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar" />,
}));

jest.mock('@/components/layout/TopNavigation', () => ({
  __esModule: true,
  default: ({ title, tabs, activeTab, onTabChange }: TopNavigationProps) => (
    <div data-testid="top-navigation">
      <div data-testid="nav-title">{title}</div>
      <div data-testid="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            data-active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  ),
}));

jest.mock('@/components/dashboard/StudentActiveTabApplications', () => ({
  __esModule: true,
  default: () => <div data-testid="student-applications" />,
}));

jest.mock('@/components/projects/ProjectCreationModal', () => ({
  __esModule: true,
  default: () => <div data-testid="project-creation-modal" />,
}));

// Mock ClientOnly component
jest.mock('@/components/utils/ClientOnly', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Dashboard Page', () => {
  // Default mock values
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockProjects = [
    {
      id: '1',
      title: 'Test Project 1',
      description: 'Project 1 description',
      status: 'active',
      mentorId: 'user1',
      isActive: true,
      teamMembers: [],
    },
    {
      id: '2',
      title: 'Test Project 2',
      description: 'Project 2 description',
      status: 'active',
      mentorId: 'user1',
      isActive: true,
      teamMembers: [],
    },
  ];

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user1' },
      userData: { role: 'student' },
      loading: false,
      refreshUserData: jest.fn().mockResolvedValue(undefined),
    });
    
    (getUserProjects as jest.Mock).mockResolvedValue(mockProjects);
  });

  it('renders the dashboard with sidebar and top navigation', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Verify that the sidebar and top navigation are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('nav-title')).toHaveTextContent('Dashboard');
  });

  it('renders active and archived tabs in the navigation', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Verify that the tabs are rendered
    expect(screen.getByTestId('tab-active')).toBeInTheDocument();
    expect(screen.getByTestId('tab-archived')).toBeInTheDocument();
    
    // Active tab should be selected by default
    expect(screen.getByTestId('tab-active')).toHaveAttribute('data-active', 'true');
  });

  it('renders projects in a grid layout for students', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Wait for the projects to load
    await waitFor(() => {
      // Verify that the projects are rendered
      expect(screen.getAllByText(/Test Project/)).toHaveLength(2);
      
      // Verify that the dashboard sections (grid containers) are present
      expect(screen.getAllByRole('heading', { name: /Your Projects/i })).toHaveLength(1);
    });
  });

  it('displays the correct number of project cards based on the data', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Wait for the projects to load
    await waitFor(() => {
      // Check for "View Details" buttons (one for each project)
      const viewButtons = screen.getAllByText(/View Details/i);
      expect(viewButtons).toHaveLength(2);
    });
  });

  it('switches to archived projects when archived tab is clicked', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Click the archived tab
    await act(async () => {
      const archivedTab = screen.getByTestId('tab-archived');
      archivedTab.click();
    });
    
    // Verify that the router was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith('/development/dashboard?tab=archived');
  });
}); 