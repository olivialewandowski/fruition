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
  | 'liked'       // Liked by the faculty (shortlisted)
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
  
  // Student information for filtering and display
  studentMajor?: string;
  studentYear?: string;
  studentDepartment?: string;
  studentGPA?: number;
  
  // Optional metadata
  submittedAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  statement?: string;
  coverLetter?: string;
  resumeUrl?: string;
  resume?: string;
  
  // Additional tracking fields
  interviewDate?: Timestamp | Date | string;
  interviewNotes?: string;
  additionalDocuments?: string[];
  
  // Top project indicator
  isTopChoice?: boolean; // Indicates if this project is marked as a top choice by the student
  
  // Optional student info structure (for backward compatibility)
  studentInfo?: {
    major?: string;
    year?: string;
    gpa?: number;
    department?: string;
  };
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
    'liked',
    'incoming'
  ];
  return validStatuses.includes(status as ApplicationStatus);
}

// Utility function to ensure ApplicationStatus is properly typed
export function ensureValidStatus(status: string): ApplicationStatus {
  if (isValidApplicationStatus(status)) {
    return status;
  }
  return 'pending'; // Default to pending if invalid
}

// Utility function to extract student information consistently
export function getStudentInfo(application: Application): {major: string, year: string, gpa: number | undefined, department: string} {
  return {
    major: application.studentMajor || application.studentInfo?.major || '',
    year: application.studentYear || application.studentInfo?.year || '',
    gpa: application.studentGPA || application.studentInfo?.gpa,
    department: application.studentDepartment || application.studentInfo?.department || ''
  };
}