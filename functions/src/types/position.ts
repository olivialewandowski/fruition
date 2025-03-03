import { Timestamp } from "firebase-admin/firestore";
import { StorageFile } from "./user";

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

// position type
export interface Position {
  projectId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  hoursPerWeek: number;
  positionTypes: string[];
  compensation: CompensationType;
  qualifications: string;
  tags: string[];
  maxPositions: number;
  filledPositions: number;
  rollingApplications: boolean;
  applicationCloseDate?: Timestamp;
}

export interface PositionWithId extends Position {
  id: string;
  applications?: {
    id: string;
    studentName: string;
    status: string;
    submittedAt: Timestamp;
  }[];
}
