import { Timestamp } from "firebase-admin/firestore";

// team member type
export interface TeamMember {
  userId: string;
  name: string;
  title: string;
  joinedDate: Timestamp;
}

// main project interface
export interface Project {
  title: string;
  description: string;
  responsibilities: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "active" | "archived" | "draft";
  isActive: boolean;

  // mentor information
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  isPrincipalInvestigator: boolean;

  // principal investigator (if mentor is not PI)
  principalInvestigatorName?: string;
  principalInvestigatorEmail?: string;

  // department info
  department: string;

  // Team members (hired students)
  teamMembers: TeamMember[];

  // Project keywords for search and matching
  keywords?: string[];
}

export interface ProjectWithId extends Project {
  id: string;
}
