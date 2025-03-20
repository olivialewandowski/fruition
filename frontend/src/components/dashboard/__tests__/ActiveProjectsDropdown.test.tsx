import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveProjectsDropdown from '../ActiveProjectsDropdown';
import { Project } from '@/types/project';
import { Application, ApplicationStatus } from '@/types/application';
import { Timestamp } from 'firebase/firestore';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Import the mocked module
import { toast } from 'react-hot-toast';

// Sample data for testing
const mockApplications: (Application & { project: Project })[] = [
  {
    id: 'app1',
    projectId: 'project1',
    positionId: 'position1',
    studentId: 'student1',
    studentName: 'Test Student 1',
    studentEmail: 'student1@test.com',
    status: 'pending' as ApplicationStatus,
    submittedAt: Timestamp.fromDate(new Date()),
    project: {
      id: 'project1',
      title: 'Project 1',
      description: 'This is project 1 description',
      mentorId: 'mentor1',
      mentorName: 'Mentor 1',
      department: 'Computer Science',
      status: 'active',
      isActive: true,
      teamMembers: [],
      skills: ['React', 'TypeScript', 'Firebase']
    } as Project
  },
  {
    id: 'app2',
    projectId: 'project2',
    positionId: 'position2',
    studentId: 'student1',
    studentName: 'Test Student 1',
    studentEmail: 'student1@test.com',
    status: 'reviewing' as ApplicationStatus,
    submittedAt: Timestamp.fromDate(new Date()),
    project: {
      id: 'project2',
      title: 'Project 2',
      description: 'This is project 2 description',
      mentorId: 'mentor2',
      mentorName: 'Mentor 2',
      department: 'Biology',
      status: 'active',
      isActive: true,
      teamMembers: [],
      skills: ['R', 'Python', 'Data Analysis']
    } as Project
  },
  {
    id: 'app3',
    projectId: 'project3',
    positionId: 'position3',
    studentId: 'student1',
    studentName: 'Test Student 1',
    studentEmail: 'student1@test.com',
    status: 'accepted' as ApplicationStatus,
    submittedAt: Timestamp.fromDate(new Date()),
    project: {
      id: 'project3',
      title: 'Project 3',
      description: 'This is project 3 description',
      mentorId: 'mentor3',
      mentorName: 'Mentor 3',
      department: 'Physics',
      status: 'active',
      isActive: true,
      teamMembers: [],
      skills: ['MATLAB', 'Simulation']
    } as Project
  },
  {
    id: 'app4',
    projectId: 'project4',
    positionId: 'position4',
    studentId: 'student1',
    studentName: 'Test Student 1',
    studentEmail: 'student1@test.com',
    status: 'rejected' as ApplicationStatus,
    submittedAt: Timestamp.fromDate(new Date()),
    project: {
      id: 'project4',
      title: 'Project 4',
      description: 'This is project 4 description',
      mentorId: 'mentor4',
      mentorName: 'Mentor 4',
      department: 'Chemistry',
      status: 'active',
      isActive: true,
      teamMembers: [],
      skills: ['Lab Work']
    } as Project
  }
];

const mockTopProjects = ['project3'];
const mockMaxTopProjects = 3;
const mockOnTopProjectToggled = jest.fn().mockResolvedValue(true);

describe('ActiveProjectsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with active applications', () => {
    // Adding a third active application to see the "Show More" button
    const projectFive: Application & { project: Project } = {
      id: 'app5',
      projectId: 'project5',
      positionId: 'position5',
      studentId: 'student1',
      studentName: 'Test Student 1',
      studentEmail: 'student1@test.com',
      status: 'reviewing' as ApplicationStatus,
      submittedAt: Timestamp.fromDate(new Date()),
      project: {
        id: 'project5',
        title: 'Project 5',
        description: 'This is project 5 description',
        mentorId: 'mentor5',
        mentorName: 'Mentor 5',
        department: 'Mathematics',
        status: 'active',
        isActive: true,
        teamMembers: [],
        skills: ['Statistics']
      } as Project
    };
    
    const expandedApps = [...mockApplications, projectFive];
    
    render(
      <ActiveProjectsDropdown
        applications={expandedApps}
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        onTopProjectToggled={mockOnTopProjectToggled}
        initialVisibleCount={2}
      />
    );

    // Check if header is rendered
    expect(screen.getByText('Add More Top Choices')).toBeInTheDocument();
    
    // Check if it shows the correct number of available slots
    expect(screen.getByText(/You can select 2 more top choices/)).toBeInTheDocument();
    
    // Check if the correct projects are shown (2 out of 3 eligible projects)
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    
    // Look for the Show More button by text content
    expect(screen.getByText(/Show More/)).toBeInTheDocument();
    
    // Project 3 is already a top project, so it shouldn't be in the list
    expect(screen.queryByText('Project 3')).not.toBeInTheDocument();
    
    // Project 4 has rejected status, so it shouldn't be in the list
    expect(screen.queryByText('Project 4')).not.toBeInTheDocument();
  });

  test('shows "Show More" button and expands the list when clicked', async () => {
    // Adding a third active application to see the "Show More" button
    const projectFive: Application & { project: Project } = {
      id: 'app5',
      projectId: 'project5',
      positionId: 'position5',
      studentId: 'student1',
      studentName: 'Test Student 1',
      studentEmail: 'student1@test.com',
      status: 'reviewing' as ApplicationStatus,
      submittedAt: Timestamp.fromDate(new Date()),
      project: {
        id: 'project5',
        title: 'Project 5',
        description: 'This is project 5 description',
        mentorId: 'mentor5',
        mentorName: 'Mentor 5',
        department: 'Mathematics',
        status: 'active',
        isActive: true,
        teamMembers: [],
        skills: ['Statistics']
      } as Project
    };
    
    const expandedApps = [...mockApplications, projectFive];
    
    render(
      <ActiveProjectsDropdown
        applications={expandedApps}
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        onTopProjectToggled={mockOnTopProjectToggled}
        initialVisibleCount={1}
      />
    );

    // Should initially show "Show More" button with count of hidden applications
    const showMoreButton = screen.getByText(/Show More/);
    expect(showMoreButton).toBeInTheDocument();
    
    // Click the "Show More" button
    fireEvent.click(showMoreButton);
    
    // Should now show "Show Less" button and all eligible applications
    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 5')).toBeInTheDocument();
    });
  });

  test('calls onTopProjectToggled when Add to Top button is clicked', async () => {
    render(
      <ActiveProjectsDropdown
        applications={mockApplications}
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        onTopProjectToggled={mockOnTopProjectToggled}
        initialVisibleCount={2}
      />
    );

    // Find and click the Add to Top button for Project 1
    const addToTopButtons = screen.getAllByText('Add as Top');
    fireEvent.click(addToTopButtons[0]);
    
    // Check if the callback was called with the correct parameters
    expect(mockOnTopProjectToggled).toHaveBeenCalledWith('project1', false);
    
    // Wait for the mock function to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('does not render if there are no eligible applications', () => {
    // All applications either rejected or already top projects
    const noEligibleApplications = mockApplications.map(app => ({
      ...app,
      status: app.project.id === 'project4' ? 'rejected' as ApplicationStatus : app.status
    }));
    
    const { container } = render(
      <ActiveProjectsDropdown
        applications={noEligibleApplications}
        topProjects={['project1', 'project2', 'project3']} // All non-rejected are top projects
        maxTopProjects={mockMaxTopProjects}
        onTopProjectToggled={mockOnTopProjectToggled}
      />
    );
    
    // Component should render nothing
    expect(container.firstChild).toBeNull();
  });

  test('disables Add to Top buttons when max projects reached', () => {
    render(
      <ActiveProjectsDropdown
        applications={mockApplications}
        topProjects={['project3', 'project5', 'project6']} // 3/3 slots used
        maxTopProjects={3} // Max reached
        onTopProjectToggled={mockOnTopProjectToggled}
      />
    );
    
    // Header should indicate all slots are used
    expect(screen.getByText('You have used all your top choice slots')).toBeInTheDocument();
    
    // All Add to Top buttons should be disabled
    const addButtons = screen.getAllByText('Add as Top');
    addButtons.forEach(button => {
      expect(button.closest('button')).toBeDisabled();
    });
  });
}); 