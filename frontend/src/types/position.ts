// src/types/position.ts
import { TimestampValue } from "./project";

// Extended status type to include archived state
export type PositionStatus = "open" | "closed" | "filled" | "archived" | "active";

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
  status?: PositionStatus; // Updated to use PositionStatus type
  rollingApplications?: boolean;
  applicationCloseDate?: TimestampValue;
  createdAt?: TimestampValue;
  updatedAt?: TimestampValue;
  
  // Project related fields for position cards
  projectTitle?: string;
  projectDescription?: string;
  
  // Application settings
  applicationSettings?: {
    requiresResume?: boolean;
    requiresStatement?: boolean;
    statementPrompt?: string;
    requiredDocuments?: string[];
  };
}

export interface PositionWithId extends Position {
  id: string;
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