// Add this to the client-side types/project.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  faculty?: string;
  department?: string;
  skills?: string[];
  duration?: string;
  commitment?: string;
  status?: string;
  mentorId?: string;
  keywords?: string[];
  createdAt?: any;
  updatedAt?: any;
  isActive?: boolean;
  teamMembers?: any[];
}