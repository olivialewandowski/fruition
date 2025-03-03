import { Timestamp } from "firebase-admin/firestore";

/**
 * Interface for university data
 */
export interface University {
  name: string;
  domain: string;
  logo?: {
    storagePath: string;
    uploadedAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface for university with ID
 */
export interface UniversityWithId extends University {
  id: string;
}

/**
 * Interface for university department
 */
export interface Department {
  name: string;
  description?: string;
  facultyCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface for department with ID
 */
export interface DepartmentWithId extends Department {
  id: string;
}

/**
 * Interface for university faculty directory
 */
export interface FacultyDirectory {
  facultyId: string;
  name: string;
  title: string;
  department: string;
  email: string;
  profileUrl?: string;
}

/**
 * Interface for university data including departments and faculty
 */
export interface UniversityData {
  departments: Record<string, string[]>; // departmentId -> array of faculty IDs
  facultyDirectory: Record<string, FacultyDirectory>; // facultyId -> faculty info
}
