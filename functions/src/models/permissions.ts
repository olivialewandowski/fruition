// src/models/permissions.ts
import { db } from "../config/firebase";
import { PROJECT_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../types/permissions";

/**
 * Check if a user has a specific permission
 * This simplified version allows all authenticated users to create projects
 *
 * @param userId - The user ID
 * @param permission - The permission to check
 * @returns Whether the user has the permission
 */
export const hasPermission = async (userId: string, permission: string): Promise<boolean> => {
  try {
    console.log(`Checking permission "${permission}" for user "${userId}"`);

    // If no user ID provided, deny permission
    if (!userId) {
      console.log("No user ID provided, denying permission");
      return false;
    }

    // Get the user document
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`User document ${userId} not found`);
      return false;
    }

    const userData = userDoc.data();
    if (!userData) {
      console.log(`User data for ${userId} is empty`);
      return false;
    }

    const userRole = userData.role;
    console.log(`User ${userId} has role: ${userRole || "undefined"}`);

    // If no role is defined, set default role and grant basic permissions
    if (!userRole) {
      console.log(`Setting default role for user ${userId}`);

      // Determine default role based on email domain or other data
      const defaultRole = userData.email && userData.email.endsWith(".edu") ? "faculty" : "student";

      await userRef.update({
        role: defaultRole,
        updatedAt: new Date(),
      });

      // Get permissions for the default role
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[defaultRole] || [];
      return defaultPermissions.includes(permission);
    }

    // Allow all authenticated users to create projects
    if (permission === PROJECT_PERMISSIONS.CREATE_PROJECT) {
      console.log(`Granting ${permission} to authenticated user ${userId}`);
      return true;
    }

    // Get role permissions from the DEFAULT_ROLE_PERMISSIONS mapping
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];

    // Check if the permission is in the list
    const hasRequiredPermission = rolePermissions.includes(permission);
    console.log(`User ${userId} permission check for ${permission}: ${hasRequiredPermission}`);

    return hasRequiredPermission;
  } catch (error) {
    console.error(`Error checking permission: ${error}`);
    // In case of error, deny permission
    return false;
  }
};

/**
 * Check if a user can manage a specific project
 *
 * @param userId - The user ID
 * @param projectId - The project ID to check
 * @returns Whether the user can manage the project
 */
export const canManageProject = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    // If no user ID or project ID provided, deny permission
    if (!userId || !projectId) {
      return false;
    }

    // Get the user document
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    if (!userData) {
      return false;
    }

    // Admins can manage all projects
    if (userData.role === "admin") {
      return true;
    }

    // Get the project document
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return false;
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      return false;
    }

    // Project creators/mentors can manage their own projects
    return projectData.mentorId === userId;
  } catch (error) {
    console.error(`Error checking project management permission: ${error}`);
    return false;
  }
};
