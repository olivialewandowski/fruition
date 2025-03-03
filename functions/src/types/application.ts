import { Timestamp } from "firebase-admin/firestore";
import { StorageFile } from "./user";

/**
 * Interface for project application
 */
export interface Application {
  studentId: string;
  studentName: string;
  status: "pending" | "reviewing" | "interviewing" | "accepted" | "rejected";
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  interestStatement: string;
  resumeFile?: StorageFile;
  studentInfo: {
    major: string;
    year: string;
    gpa?: number;
  };
  notes?: string;
  interviewDate?: Timestamp;
}

/**
 * Interface for application with ID
 */
export interface ApplicationWithId extends Application {
  id: string;
  projectId: string;
  positionId: string;
}
