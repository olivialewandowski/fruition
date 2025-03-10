import { Timestamp } from "firebase-admin/firestore";

// common types for file storage
export interface StorageFile {
  storagePath: string;
  fileName: string;
  fileType: string;
  uploadedAt: Timestamp;
}

export interface StoragePhoto {
  storagePath: string;
  thumbnailPath?: string;
  uploadedAt: Timestamp;
}

// user interface with consolidated fields
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "faculty" | "admin";
  university: string; // University name (display value)
  universityId?: string; // University ID (reference value)
  createdAt: Timestamp;
  lastActive: Timestamp;
  activeProjects: string[];
  archivedProjects: string[];

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
  };

  // faculty/admin specific fields
  title?: string;
  department?: string;
  researchInterests?: string[];
}

export interface UserWithId extends User {
  id: string;
}
