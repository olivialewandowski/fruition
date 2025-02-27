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

// project preference types
export interface ProjectPreferences {
  savedProjects: string[];
  appliedProjects: string[];
  rejectedProjects: string[];
}

// role-specific fields - student + faculty + admin
export interface StudentFields {
  year: string;
  major: string;
  minor?: string;
  gpa?: number;
  aboutMe?: string;
  profilePhoto?: StoragePhoto;
  resumeFile?: StorageFile;
  skills: string[];
  interests: string[];
  projectPreferences: ProjectPreferences;
}

export interface FacultyFields {
  title: string;
  department: string;
  aboutMe?: string;
  researchInterests: string[];
  profilePhoto?: StoragePhoto;
}

export interface AdminFields {
  title: string;
  department: string;
}

// main user
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "faculty" | "admin";
  university: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  activeProjects: string[];
  archivedProjects: string[];
  studentFields?: StudentFields;
  facultyFields?: FacultyFields;
  adminFields?: AdminFields;
}

export interface UserWithId extends User {
  id: string;
}
