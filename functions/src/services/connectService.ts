import { db } from "../config/firebase";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { UserAction, UserActionWithId } from "../types/userAction";
import { hasPermission } from "../models/permissions";
import { CONNECT_PERMISSIONS } from "../types/permissions";
import { Application } from "../types/application";
import { createUserAction, getUserActionsByUser } from "./firestoreService";
import { saveProjectForStudent, removeSavedProjectForStudent } from "../utils/firestoreArrays";

/**
 * Save a project for a user
 * @param userId - The ID of the user saving the project
 * @param projectId - The ID of the project to save
 * @returns A promise that resolves when the project is saved
 */
export async function saveProject(userId: string, projectId: string): Promise<void> {
  // Check permission
  const canSave = await hasPermission(userId, CONNECT_PERMISSIONS.SAVE_PROJECTS);
  if (!canSave) {
    throw new Error("Unauthorized: You don't have permission to save projects");
  }

  // Verify project exists
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  // Save the project for the user
  await saveProjectForStudent(userId, projectId);
}

/**
 * Remove a saved project for a user
 * @param userId - The ID of the user removing the saved project
 * @param projectId - The ID of the project to remove
 * @returns A promise that resolves when the project is removed
 */
export async function removeSavedProject(userId: string, projectId: string): Promise<void> {
  // Check permission
  const canSave = await hasPermission(userId, CONNECT_PERMISSIONS.SAVE_PROJECTS);
  if (!canSave) {
    throw new Error("Unauthorized: You don't have permission to save projects");
  }

  // Remove the saved project
  await removeSavedProjectForStudent(userId, projectId);
}

/**
 * Decline a project
 * @param userId - The ID of the user declining the project
 * @param projectId - The ID of the project to decline
 * @returns A promise that resolves when the project is declined
 */
export async function declineProject(userId: string, projectId: string): Promise<void> {
  // Check permission
  const canSwipe = await hasPermission(userId, CONNECT_PERMISSIONS.SWIPE_PROJECTS);
  if (!canSwipe) {
    throw new Error("Unauthorized: You don't have permission to swipe projects");
  }

  // Verify project exists
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  // Create a user action for declining the project
  await createUserAction({
    userId,
    projectId,
    action: "decline",
    timestamp: Timestamp.now(),
  });
}

/**
 * Apply to a project
 * @param userId - The ID of the user applying to the project
 * @param projectId - The ID of the project to apply to
 * @param applicationData - The application data
 * @returns The ID of the created application
 */
export async function applyToProject(
  userId: string,
  projectId: string,
  applicationData: Partial<Application>
): Promise<string> {
  // Check permission
  const canApply = await hasPermission(userId, CONNECT_PERMISSIONS.APPLY_TO_PROJECTS);
  if (!canApply) {
    throw new Error("Unauthorized: You don't have permission to apply to projects");
  }

  // Verify project exists and is accepting applications
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  // Check if project is active
  if (projectData.status !== "active") {
    throw new Error("Cannot apply to inactive project");
  }

  // Check if applications are closed
  if (!projectData.rollingApplications) {
    const closeDate = projectData.applicationCloseDate?.toDate();
    if (closeDate && closeDate < new Date()) {
      throw new Error("Applications for this project are closed");
    }
  }

  // Check if user already applied
  const existingApplicationsQuery = await db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .where("studentId", "==", userId)
    .get();

  if (!existingApplicationsQuery.empty) {
    throw new Error("You have already applied to this project");
  }

  // Get user data
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User data is empty");
  }

  // Create application
  const now = Timestamp.now();

  const applicationRef = await db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .add({
      studentId: userId,
      studentName: `${userData.firstName} ${userData.lastName}`,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
      ...applicationData,
    });

  // Add project to student's applied projects
  await db.collection("users").doc(userId).update({
    "projectPreferences.appliedProjects": FieldValue.arrayUnion(projectId),
    "updatedAt": now,
  });

  // Create a user action for applying to the project
  await createUserAction({
    userId,
    projectId,
    action: "apply",
    timestamp: now,
  });

  return applicationRef.id;
}

/**
 * Get saved projects for a user
 * @param userId - The ID of the user
 * @returns An array of saved project IDs
 */
export async function getSavedProjects(userId: string): Promise<string[]> {
  // Check permission
  const canSave = await hasPermission(userId, CONNECT_PERMISSIONS.SAVE_PROJECTS);
  if (!canSave) {
    throw new Error("Unauthorized: You don't have permission to view saved projects");
  }

  // Get user data
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User data is empty");
  }

  // Return saved projects
  return userData.projectPreferences?.savedProjects || [];
}

/**
 * Get applied projects for a user
 * @param userId - The ID of the user
 * @returns An array of applied project IDs
 */
export async function getAppliedProjects(userId: string): Promise<string[]> {
  // Check permission
  const canApply = await hasPermission(userId, CONNECT_PERMISSIONS.APPLY_TO_PROJECTS);
  if (!canApply) {
    throw new Error("Unauthorized: You don't have permission to view applied projects");
  }

  // Get user data
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User data is empty");
  }

  // Return applied projects
  return userData.projectPreferences?.appliedProjects || [];
}

/**
 * Undo the last action performed by a user
 * @param userId - The ID of the user undoing their last action
 * @returns A promise that resolves when the action is undone
 */
export async function undoLastAction(userId: string): Promise<{ success: boolean; message: string }> {
  // Check permission
  const canSwipe = await hasPermission(userId, CONNECT_PERMISSIONS.SWIPE_PROJECTS);
  if (!canSwipe) {
    throw new Error("Unauthorized: You don't have permission to undo actions");
  }

  // Get the user's most recent actions
  const userActions = await getUserActionsByUser(userId);
  
  if (userActions.length === 0) {
    return { success: false, message: "No actions to undo" };
  }

  // Find the most recent action that can be undone (save, apply, or decline)
  const undoableActions = ["save", "apply", "decline"];
  const lastUndoableAction = userActions.find(action => 
    undoableActions.includes(action.action)
  );

  if (!lastUndoableAction) {
    return { success: false, message: "No undoable actions found" };
  }

  // Create a transaction to ensure data consistency
  const actionId = lastUndoableAction.id;
  const projectId = lastUndoableAction.projectId;
  
  try {
    // Perform the undo operation based on the action type
    switch (lastUndoableAction.action) {
      case "save":
        // If the last action was saving a project, remove it from saved
        await removeSavedProjectForStudent(userId, projectId);
        break;
        
      case "apply":
        // If the last action was applying to a project, remove the application
        // First, find the application
        const applicationsQuery = await db.collection("projects")
          .doc(projectId)
          .collection("applications")
          .where("studentId", "==", userId)
          .get();
          
        if (!applicationsQuery.empty) {
          // Delete the application
          await applicationsQuery.docs[0].ref.delete();
          
          // Remove from user's applied projects
          await db.collection("users").doc(userId).update({
            "projectPreferences.appliedProjects": FieldValue.arrayRemove(projectId)
          });
        }
        break;
        
      case "decline":
        // If the last action was declining a project, remove it from declined list
        await db.collection("users").doc(userId).update({
          "projectPreferences.declinedProjects": FieldValue.arrayRemove(projectId)
        });
        break;
        
      default:
        return { success: false, message: "Action cannot be undone" };
    }
    
    // Log the undo action
    await createUserAction({
      userId,
      projectId,
      action: "undo",
      timestamp: Timestamp.now(),
      undoneActionId: actionId
    });
    
    return { 
      success: true, 
      message: `Successfully undid ${lastUndoableAction.action} action for project ${projectId}` 
    };
  } catch (error) {
    console.error("Error undoing action:", error);
    throw new Error(`Failed to undo action: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
} 
