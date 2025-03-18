// types/waitlist.ts
export interface WaitlistEntry {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution: string;
  source?: "waitlist" | "getStarted" | "demo" | "postProject";
  createdAt: string;
  projectId?: string; // Optional project ID to link to submitted project
}

export interface WaitlistEntryWithId extends WaitlistEntry {
  id: string;
}
