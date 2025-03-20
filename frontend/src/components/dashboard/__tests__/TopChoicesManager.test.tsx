import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { Timestamp } from 'firebase/firestore';
import { TopChoicesManager } from '../StudentAppliedProjectsTab';

// Mock the studentService functions
jest.mock('@/services/studentService', () => ({
  getStudentApplications: jest.fn().mockResolvedValue([]),
  getStudentTopProjects: jest.fn().mockResolvedValue([]),
  getMaxTopProjects: jest.fn().mockResolvedValue(3),
  toggleTopProject: jest.fn().mockResolvedValue(true),
}));

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { uid: 'student1' },
    refreshUserData: jest.fn(),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Sample data for testing
const mockApplications: (Application & { project: Project })[] = [
  {
    id: 'app1',
    projectId: 'project1',
    positionId: 'position1',
    studentId: 'student1',
    studentName: 'Test Student 1',
    studentEmail: 'student1@test.com',
    status: 'pending',
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
    status: 'reviewing',
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
  }
];

const mockTopProjects = ['project1'];
const mockMaxTopProjects = 3;
const mockOnToggleTopProject = jest.fn();

describe('TopChoicesManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with top choice projects', () => {
    render(
      <TopChoicesManager
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        applications={mockApplications}
        onToggleTopProject={mockOnToggleTopProject}
        isLoading={false}
      />
    );

    // Check if header is rendered
    expect(screen.getByText('Your Top Choice Projects')).toBeInTheDocument();
    
    // Check if it shows the correct count
    expect(screen.getByText(/You have marked 1 of 3 allowed top choices/)).toBeInTheDocument();
    
    // Check if the top project is shown
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Top Choice')).toBeInTheDocument();
    
    // Check if the non-top project is not shown
    expect(screen.queryByText('Project 2')).not.toBeInTheDocument();
    
    // Check if the remove button is present
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  test('shows empty state when no top projects are selected', () => {
    render(
      <TopChoicesManager
        topProjects={[]}
        maxTopProjects={mockMaxTopProjects}
        applications={mockApplications}
        onToggleTopProject={mockOnToggleTopProject}
        isLoading={false}
      />
    );
    
    // Check if empty state message is shown
    expect(screen.getByText(/You haven't marked any projects as top choices yet/)).toBeInTheDocument();
  });

  test('calls onToggleTopProject when Remove button is clicked', () => {
    render(
      <TopChoicesManager
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        applications={mockApplications}
        onToggleTopProject={mockOnToggleTopProject}
        isLoading={false}
      />
    );
    
    // Find and click the Remove button
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    // Check if the callback was called with the correct parameters
    expect(mockOnToggleTopProject).toHaveBeenCalledWith('project1', true);
  });

  test('shows loading state when isLoading is true', () => {
    const { container } = render(
      <TopChoicesManager
        topProjects={mockTopProjects}
        maxTopProjects={mockMaxTopProjects}
        applications={mockApplications}
        onToggleTopProject={mockOnToggleTopProject}
        isLoading={true}
      />
    );
    
    // Check if loading state is shown
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    
    // Content should not be rendered when loading
    expect(screen.queryByText('Your Top Choice Projects')).not.toBeInTheDocument();
  });
}); 