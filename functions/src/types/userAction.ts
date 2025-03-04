import { Timestamp } from "firebase-admin/firestore";

/**
 * Interface for user action
 */
export interface UserAction {
  userId: string;
  projectId: string;
  action: "view" | "save" | "apply" | "decline" | "remove_save" | "undo";
  timestamp: Timestamp;
  sessionId?: string;
  timeSpentViewingSeconds?: number;
  sourceFeature?: string;
  undoneActionId?: string; // Reference to the action being undone
}

/**
 * Interface for user action with ID
 */
export interface UserActionWithId extends UserAction {
  id: string;
}
