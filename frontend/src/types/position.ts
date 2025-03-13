// src/types/position.ts
import { TimestampValue } from "./project";

export interface Position {
  id: string; // Made required to match our components
  projectId: string;
  title: string; // Made required since it's used for display
  description?: string; // Added for completeness
  qualifications?: string;
  responsibilities?: string; // Added for completeness
  startDate?: TimestampValue;
  endDate?: TimestampValue;
  hoursPerWeek?: number;
  positionTypes?: string[];
  compensation?: {
    type: string[];
    details?: string;
    hourlyRate?: number; // Added for paid positions
  };
  tags?: string[];
  maxPositions?: number;
  filledPositions?: number;
  isActive?: boolean; // Added for status tracking
  status?: "open" | "closed" | "filled"; // Added for status tracking
  rollingApplications?: boolean;
  applicationCloseDate?: TimestampValue;
  createdAt?: TimestampValue;
  updatedAt?: TimestampValue;
}

export interface PositionWithId extends Position {
  id: string;
}

export interface Application {
  id: string; // Made required to match our components
  studentId: string;
  studentName: string; // Made required since it's displayed in UI
  studentEmail?: string; // Added for contact info
  positionId: string;
  projectId?: string; // Added for cross-referencing
  status: "incoming" | "pending" | "interviewing" | "accepted" | "rejected" | "hired"; // Added "hired" status
  submittedAt: TimestampValue; // Made required as it's used for sorting
  updatedAt?: TimestampValue;
  notes?: string;
  interestStatement?: string;
  resumeFile?: {
    url: string;
    name: string;
  };
  // Added for UI components
  studentInfo?: {
    major: string;
    year: string;
    gpa?: number;
  };
  interviewDate?: TimestampValue;
  // Optional references to related data for UI
  project?: any;
  position?: Position;
}

export interface ApplicationWithId extends Application {
  id: string;
  projectId: string;
  positionId: string;
}

export interface OnboardingMaterial {
  id: string; // Made required to match our components
  projectId: string; // Added for relationship to project
  name: string; // Changed from title for consistency with our components
  description?: string; // Added for our UI
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize?: number; // Added for display in UI
  storageRef?: string; // Added for deletion functionality
  uploadedAt: TimestampValue;
  uploadedBy: string;
  uploadedById?: string; // Added for permissions
}