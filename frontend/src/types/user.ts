// src/types/user.ts
import { Timestamp } from "firebase/firestore";

// Helper type to handle different timestamp formats
export type TimestampValue = Timestamp | Date | string | number;

// Common types for file storage
export interface StorageFile {
  storagePath: string;
  fileName: string;
  fileType: string;
  uploadedAt: TimestampValue;
}

export interface StoragePhoto {
  storagePath: string;
  thumbnailPath?: string;
  uploadedAt: TimestampValue;
}

// User interface with consolidated fields
export interface User {
  id: string; // Make id required for all users
  email: string;
  firstName: string;
  lastName: string;
  role?: "student" | "faculty" | "admin";
  university?: string; // University name (display value)
  universityId?: string; // University ID (reference value)
  createdAt?: TimestampValue;
  lastActive?: TimestampValue;
  activeProjects?: string[];
  archivedProjects?: string[];

  // student-specific fields
  year?: string;
  major?: string;
  minor?: string;
  gpa?: number;

  // common fields
  aboutMe?: string;
  profilePhoto?: StoragePhoto;
  resumeFile?: StorageFile;

  // student-specific arrays
  skills?: string[];
  interests?: string[];
  projectPreferences?: {
    savedProjects: string[];
    appliedProjects: string[];
    rejectedProjects: string[];
    topProjects?: string[]; // Array of project IDs that are in the student's top 5%
  };

  // faculty/admin specific fields
  title?: string;
  department?: string;
  researchInterests?: string[];
  
  // Additional fields needed for the UI
  status?: string;
  projectRole?: string;
  joinedDate?: TimestampValue;
  notes?: string;
}

export interface UserWithId extends User {
  id: string;
}


export interface UserWithId extends User {
  id: string;
}