// src/types/project.ts
import { Timestamp, FieldValue } from "firebase/firestore";

// Helper type to handle different timestamp formats
export type TimestampValue = Timestamp | Date | string | number | FieldValue;

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  joinedDate?: TimestampValue;
}

// Base Project interface with common properties
export interface BaseProject {
  title: string;
  description: string;
  keywords?: string[];
  createdAt?: TimestampValue;
  updatedAt?: TimestampValue;
}

// Project interface for main project creation/dashboard
export interface Project extends BaseProject {
  id: string; // Made required for all Project instances
  // Faculty/mentor information
  facultyId?: string;
  mentorId: string;
  mentorName?: string;
  mentorEmail?: string;
  mentorTitle?: string;
  isPrincipalInvestigator?: boolean;
  principalInvestigatorName?: string;
  principalInvestigatorEmail?: string;
  faculty?: string;

  // Department/university info
  department?: string;
  departmentId?: string;
  university?: string;
  universityId?: string;

  // Project metadata
  status: "active" | "archived" | "draft" | "inactive";
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

// ProjectWithId type - an alias for Project with guaranteed ID
export type ProjectWithId = Project;

// For Connect feature - simpler version of Project
export interface ConnectProject extends BaseProject {
  id: string;
  faculty?: string;
  department?: string;
  skills?: string[];
  duration?: string;
  commitment?: string;
  // Add these fields to match what's being used in the code
  responsibilities?: string;
  outcomes?: string;
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
  return { ...result, ...project };
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

// Helper function to extract the original ID (remove prefixes like 'saved_' or 'applied_')
export function extractOriginalId(id?: string): string {
  // If id is undefined, return empty string
  if (!id) return '';
  
  // Remove saved_ or applied_ prefix
  return id.replace(/^(saved_|applied_)/, '');
}