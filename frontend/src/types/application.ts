// src/types/application.ts
import { Timestamp, FieldValue } from "firebase/firestore";

// Expanded ApplicationStatus to include all possible statuses
export type ApplicationStatus = 
  | 'pending'     // Initial application state
  | 'reviewing'   // Currently being reviewed
  | 'interviewing' // In interview process
  | 'accepted'    // Accepted for the position
  | 'rejected'    // Rejected from the position
  | 'hired'       // Hired for the position
  | 'incoming';   // Newly submitted application

// Application interface with comprehensive details
export interface Application {
  id?: string;
  projectId: string;
  positionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: ApplicationStatus;
  
  // Optional metadata
  submittedAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  coverLetter?: string;
  resume?: string;
  
  // Additional tracking fields
  interviewNotes?: string;
  additionalDocuments?: string[];
}

// Helper type for creating or updating applications
export type ApplicationCreateInput = Omit<Application, 'id'> & { id?: string };

// Utility function to validate application status
export function isValidApplicationStatus(status: string): status is ApplicationStatus {
  const validStatuses: ApplicationStatus[] = [
    'pending', 
    'reviewing', 
    'interviewing', 
    'accepted', 
    'rejected', 
    'hired',
    'incoming'
  ];
  return validStatuses.includes(status as ApplicationStatus);
}