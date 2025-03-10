// src/types/project.ts
import { Timestamp, FieldValue } from "firebase/firestore";

export interface TeamMember {
  userId: string;
  name: string;
  role?: string;
  joinedAt?: Timestamp | FieldValue;
}

// Base Project interface with common properties
export interface BaseProject {
  id?: string;
  title: string;
  description: string;
  keywords?: string[];
  createdAt?: Timestamp | FieldValue | any;
  updatedAt?: Timestamp | FieldValue | any;
}

// Project interface for main project creation/dashboard
export interface Project extends BaseProject {
  // Faculty/mentor information
  mentorId: string;
  mentorName?: string;
  mentorEmail?: string;
  mentorTitle?: string;
  isPrincipalInvestigator?: boolean;
  principalInvestigatorName?: string;
  principalInvestigatorEmail?: string;
  faculty?: string; // Added for Connect compatibility

  // Department/university info
  department?: string;
  departmentId?: string;
  university?: string;
  universityId?: string;

  // Project metadata
  status: "active" | "archived" | "draft";
  isActive: boolean;

  // Keywords and skills
  skills?: string[];

  // Position-related fields
  positionCount?: number;
  mainPositionId?: string;
  applicationCount?: number;

  // Team information
  teamMembers: TeamMember[];

  // Connect-related fields
  duration?: string;
  commitment?: string;
  responsibilities?: string;
  outcomes?: string;
}

// Interface specifically for projects with ID
export interface ProjectWithId extends Omit<Project, 'id'> {
  id: string;
}

// For Connect feature - simpler version of Project
export interface ConnectProject extends BaseProject {
  id: string; // Required for Connect projects
  faculty?: string;
  department?: string;
  skills?: string[];
  duration?: string;
  commitment?: string;
  // No required fields like mentorId, status, etc.
}

// Utility function to convert between project types
export function convertToProjectWithId(project: Partial<Project> & { id: string }): ProjectWithId {
  // Provide default values for required fields
  const result: ProjectWithId = {
    id: project.id,
    title: project.title || '',
    description: project.description || '',
    mentorId: project.mentorId || '',
    status: project.status || 'active',
    isActive: project.isActive ?? true,
    teamMembers: project.teamMembers || []
  };

  // Copy all other properties
  return { ...project, ...result };
}

// Utility function to convert Connect project to full Project
export function connectProjectToProject(connectProject: ConnectProject): Project {
  return {
    id: connectProject.id,
    title: connectProject.title,
    description: connectProject.description,
    faculty: connectProject.faculty,
    department: connectProject.department,
    skills: connectProject.skills,
    duration: connectProject.duration,
    commitment: connectProject.commitment,
    // Default values for required fields
    mentorId: '',
    status: 'active',
    isActive: true,
    teamMembers: []
  };
}