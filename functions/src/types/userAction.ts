import { Timestamp } from "firebase-admin/firestore";

export interface UserAction {
  userId: string;
  projectId: string;
  action: "view" | "save" | "apply" | "reject";
  timestamp: Timestamp;
  sessionId: string;
  timeSpentViewingSeconds: number;
  visitCount: number;
  sourceFeature: string;
}

export interface UserActionWithId extends UserAction {
  id: string;
}
