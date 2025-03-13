import { Project, ConnectProject } from '@/types/project';

// Utility function to convert Connect projects to full Projects
export function convertConnectProjectsToProjects(connectProjects: ConnectProject[]): Project[] {
  return connectProjects.map(project => ({
    id: project.id || '',  // Ensure id is always a string
    title: project.title,
    description: project.description,
    keywords: project.keywords,
    faculty: project.faculty,
    department: project.department,
    skills: project.skills,
    duration: project.duration,
    commitment: project.commitment,
    // Required fields for Project type
    mentorId: '', // Default empty string
    status: 'active',
    isActive: true,
    teamMembers: []
  }));
}

// Helper function to extract the original ID (remove prefixes like 'saved_' or 'applied_')
export function extractOriginalId(id?: string): string {
  // If id is undefined, return empty string
  if (!id) return '';
  
  // Remove saved_ or applied_ prefix
  return id.replace(/^(saved_|applied_)/, '');
}

// Utility function to check if a project has a prefix
export function hasPrefix(id?: string): boolean {
  return id ? /^(saved_|applied_)/.test(id) : false;
}