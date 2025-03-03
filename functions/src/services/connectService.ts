import { db } from "../config/firebase";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { hasPermission } from "../models/permissions";
import { CONNECT_PERMISSIONS } from "../types/permissions";
import { Application } from "../types/application";
import { createUserAction } from "./firestoreService";
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
