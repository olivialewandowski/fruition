// src/models/permissions.ts
import { db } from "../config/firebase";

/**
 * Initializes default permissions for a new user based on their role
 * @param userId - The user ID to set permissions for
 * @param role - The user's role (student, faculty, admin)
 */
export async function initializeUserPermissions(userId: string, role: string): Promise<void> {
  // Import here to avoid circular dependencies
  const { DEFAULT_ROLE_PERMISSIONS } = await import("../types/permissions");
  
  // default permissions for the role
  const permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  
  // user permissions document
  await db.collection("userPermissions").doc(userId).set({
    userId,
    role,
    permissions,
    customPermissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Gets all permissions for a specific user
 * @param userId - The user ID to get permissions for
 * @returns Array of permission IDs
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const doc = await db.collection("userPermissions").doc(userId).get();
  
  if (!doc.exists) {
    return [];
  }
  
  const data = doc.data();
  return [...(data?.permissions || []), ...(data?.customPermissions || [])];
}

/**
 * Checks if a user has a specific permission
 * @param userId - The user ID to check permissions for
 * @param permissionId - The permission ID to check
 * @returns Boolean indicating if the user has the permission
 */
export async function hasPermission(userId: string, permissionId: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionId);
}

/**
 * Adds a custom permission to a user
 * @param userId - The user ID to add the permission to
 * @param permissionId - The permission ID to add
 */
export async function addCustomPermission(userId: string, permissionId: string): Promise<void> {
  const docRef = db.collection("userPermissions").doc(userId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error("User permissions not initialized");
  }
  
  const data = doc.data();
  const customPermissions = data?.customPermissions || [];
  
  if (!customPermissions.includes(permissionId)) {
    await docRef.update({
      customPermissions: [...customPermissions, permissionId],
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Removes a custom permission from a user
 * @param userId - The user ID to remove the permission from
 * @param permissionId - The permission ID to remove
 */
export async function removeCustomPermission(userId: string, permissionId: string): Promise<void> {
  const docRef = db.collection("userPermissions").doc(userId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error("User permissions not initialized");
  }
  
  const data = doc.data();
  const customPermissions = data?.customPermissions || [];
  
  await docRef.update({
    customPermissions: customPermissions.filter((perm: string) => perm !== permissionId),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Gets all available features for a specific user based on their permissions
 * @param userId - The user ID to get features for
 * @returns Array of feature IDs
 */
export async function getUserFeatures(userId: string): Promise<string[]> {
  const userDoc = await db.collection("users").doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  
  // Get user's permissions
  const permissions = await getUserPermissions(userId);
  
  // Load features configuration
  const { FEATURES } = await import("../types/permissions");
  
  // Filter features based on user permissions
  return FEATURES
    .filter(feature => {
      // Check if user has any of the required permissions for this feature
      return feature.requiredPermissions.some(permission => 
        permissions.includes(permission)
      );
    })
    .map(feature => feature.id);
}