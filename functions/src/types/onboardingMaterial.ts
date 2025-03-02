import { Timestamp } from "firebase-admin/firestore";

/**
 * Interface for onboarding material file
 */
export interface MaterialFile {
  materialId: string;
  title: string;
  type: "document" | "video" | "link" | "publication";
  description: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  externalUrl?: string;
  file?: {
    storagePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Timestamp;
  };
}

/**
 * Interface for onboarding material with ID
 */
export interface MaterialFileWithId extends MaterialFile {
  id: string;
  projectId: string;
} 