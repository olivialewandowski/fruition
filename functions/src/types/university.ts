import { Timestamp } from "firebase-admin/firestore";

// department type
export interface Department {
  name: string;
  abbreviation: string;
  facultyCount: number;
  projectCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DepartmentWithId extends Department {
  id: string;
}

// faculty directory entry
export interface FacultyDirectoryEntry {
  email: string;
  name: string;
  department: string;
  title: string;
  profileCreated: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FacultyDirectoryEntryWithId extends FacultyDirectoryEntry {
  id: string;
}

// university logo
export interface UniversityLogo {
  storagePath: string;
  uploadedAt: Timestamp;
}

// university type
export interface University {
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo: UniversityLogo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UniversityWithId extends University {
  id: string;
}
