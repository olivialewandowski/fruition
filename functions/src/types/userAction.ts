import { Timestamp } from "firebase-admin/firestore";

/**
 * Interface for user action
 */
export interface UserAction {
  userId: string;
  projectId: string;
  action: "view" | "save" | "apply" | "decline" | "remove_save";
  timestamp: Timestamp;
  sessionId?: string;
  timeSpentViewingSeconds?: number;
  sourceFeature?: string;
}

/**
 * Interface for user action with ID
 */
export interface UserActionWithId extends UserAction {
  id: string;
}
