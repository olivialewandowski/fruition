// src/types/position.ts
export interface Position {
    id?: string;
    projectId: string;
    title?: string;
    qualifications?: string;
    startDate?: any; // Using 'any' to match your Project type style
    endDate?: any;
    hoursPerWeek?: number;
    positionTypes?: string[];
    compensation?: {
      type: string[];
      details?: string;
    };
    tags?: string[];
    maxPositions?: number;
    filledPositions?: number;
    rollingApplications?: boolean;
    applicationCloseDate?: any;
    createdAt?: any;
    updatedAt?: any;
  }
  
  export interface Application {
    id?: string;
    studentId: string;
    studentName?: string;
    status: "incoming" | "pending" | "interviewing" | "accepted" | "rejected";
    submittedAt?: any;
    updatedAt?: any;
    notes?: string;
    interestStatement?: string;
    resumeFile?: {
      url: string;
      name: string;
    };
  }
  
  export interface OnboardingMaterial {
    id?: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    uploadedAt?: any;
    uploadedBy?: string;
  }