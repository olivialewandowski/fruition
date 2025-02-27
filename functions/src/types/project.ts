import { Timestamp } from "firebase-admin/firestore";
import { StorageFile } from "./user";

// team member type
export interface TeamMember {
  userId: string;
  name: string;
  title: string;
  joinedDate: Timestamp;
}

// compensation type
export interface CompensationType {
  type: string[];
  details: string;
}

// student application info
export interface StudentInfo {
  year: string;
  major: string;
  minor?: string;
  skills: string[];
  interests: string[];
}

// application type
export interface Application {
  studentId: string;
  studentName: string;
  status: "incoming" | "pending" | "interviewing" | "accepted" | "rejected";
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  interestStatement: string;
  resumeFile: StorageFile;
  studentInfo: StudentInfo;
  notes?: string;
  interviewDate?: Timestamp;
}

export interface ApplicationWithId extends Application {
  id: string;
}

// material file type
export interface MaterialFile extends StorageFile {
  fileSize: number;
}

// onboarding material type
export interface OnboardingMaterial {
  title: string;
  type: "document" | "video" | "link" | "publication";
  description: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  externalUrl?: string;
  file?: MaterialFile;
}

export interface OnboardingMaterialWithId extends OnboardingMaterial {
  id: string;
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
  startDate: Timestamp;
  endDate: Timestamp;
  hoursPerWeek: number;
  positionTypes: string[];
  compensation: CompensationType;
  qualifications: string;
  tags: string[];
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  isPrincipalInvestigator: boolean;
  principalInvestigatorName?: string;
  principalInvestigatorEmail?: string;
  rollingApplications: boolean;
  applicationCloseDate?: Timestamp;
  department: string;
  teamMembers: TeamMember[];
}

export interface ProjectWithId extends Project {
  id: string;
}
