import { Timestamp } from "firebase-admin/firestore";

export interface WaitlistEntry {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution: string;
  source?: string;
  createdAt: Timestamp | string;
}

export interface WaitlistEntryWithId extends WaitlistEntry {
  id: string;
}
