import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProjectsPage from '@/app/development/dashboard/page';
import { useSearchParams, useRouter } from 'next/navigation';

// Define types for the component props
interface TabType {
  id: string;
  label: string;
}

interface TopNavigationProps {
  onTabChange: (tabId: string) => void;
  tabs: TabType[];
  activeTab: string;
}

// Mock the Next.js API
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/development/dashboard')
}));

// Mock components used by the page
jest.mock('@/components/layout/Sidebar', () => ({ __esModule: true, default: () => <div data-testid="sidebar">Sidebar</div> }));
jest.mock('@/components/layout/TopNavigation', () => ({ 
  __esModule: true, 
  default: ({ onTabChange, tabs, activeTab }: TopNavigationProps) => (
    <div data-testid="top-navigation">
      {tabs.map((tab: TabType) => (
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
  )
}));
jest.mock('@/components/dashboard/ProjectSection', () => ({ __esModule: true, default: () => <div data-testid="project-section">Projects</div> }));
jest.mock('@/components/projects/ProjectCreationModal', () => ({ __esModule: true, default: () => <div data-testid="project-modal">Modal</div> }));
jest.mock('@/components/student/TopChoicesWidget', () => ({ __esModule: true, default: () => <div data-testid="top-choices-widget">Top Choices</div> }));
jest.mock('@/components/dashboard/StudentAppliedProjectsTab', () => ({ __esModule: true, default: () => <div data-testid="applied-projects-tab">Applied Projects</div> }));

// Mock API services
jest.mock('@/services/clientProjectService', () => ({
  getUserProjects: jest.fn().mockResolvedValue([])
}));

describe('Dashboard Page with URL Tab Navigation', () => {
  let pushMock: jest.Mock;
  let searchParamsMock: URLSearchParams;
  
  beforeEach(() => {
    // Setup router mock
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      replace: jest.fn(),
      back: jest.fn()
    });
    
    // Setup searchParams mock with a default empty value
    searchParamsMock = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(searchParamsMock);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('renders the dashboard with default active tab', async () => {
    // Render without any URL parameters
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Check that the default tab (active) is selected
    const activeTab = screen.getByTestId('tab-active');
    expect(activeTab).toHaveAttribute('data-active', 'true');
  });

  it('initializes with the tab from URL query parameter', async () => {
    // Mock URL search params with 'tab=archived'
    searchParamsMock = new URLSearchParams('tab=archived');
    (useSearchParams as jest.Mock).mockReturnValue(searchParamsMock);
    
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Check that the 'archived' tab is selected based on the URL parameter
    const archivedTab = screen.getByTestId('tab-archived');
    expect(archivedTab).toHaveAttribute('data-active', 'true');
  });

  it('updates URL when tab is changed', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Find and click the 'archived' tab
    const archivedTab = screen.getByTestId('tab-archived');
    
    await act(async () => {
      fireEvent.click(archivedTab);
    });
    
    // Check that router.push was called with the correct URL
    expect(pushMock).toHaveBeenCalledWith('/development/dashboard?tab=archived');
  });

  it('ignores invalid tab parameters in URL', async () => {
    // Mock URL search params with an invalid tab value
    searchParamsMock = new URLSearchParams('tab=invalid');
    (useSearchParams as jest.Mock).mockReturnValue(searchParamsMock);
    
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Should fall back to the default 'active' tab
    const activeTab = screen.getByTestId('tab-active');
    expect(activeTab).toHaveAttribute('data-active', 'true');
  });

  it('ensures URLs are properly encoded', async () => {
    await act(async () => {
      render(<ProjectsPage />);
    });
    
    // Find and click the 'archived' tab
    const archivedTab = screen.getByTestId('tab-archived');
    
    await act(async () => {
      fireEvent.click(archivedTab);
    });
    
    // Check that router.push was called with a properly encoded URL
    expect(pushMock).toHaveBeenCalled();
    const urlArg = pushMock.mock.calls[0][0];
    expect(urlArg).toContain('tab=archived');
    expect(urlArg).not.toContain(' '); // No spaces (properly encoded)
  });
}); 