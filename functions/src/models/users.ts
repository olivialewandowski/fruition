import { auth, db } from "../config/firebase";
import { User, UserWithId } from "../types";
import { UserRecord } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { ensureUniversityExists } from "../utils/universityUtils";

/**
 * Retrieves a user record by email
 * @param email - The email to look up
 * @return The user record from Firebase Auth
 */
export async function getUserByEmail(email: string): Promise<UserRecord> {
  return await auth.getUserByEmail(email);
}

/**
 * Retrieves user data from Firestore by ID
 * @param userId - The user ID to look up
 * @return The user data with ID or null if not found
 */
export async function getUserById(userId: string): Promise<UserWithId | null> {
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as UserWithId;
}

/**
 * Creates a custom authentication token for a user
 * @param userId - The user ID to create a token for
 * @return A JWT token string
 */
export async function createCustomToken(userId: string): Promise<string> {
  return await auth.createCustomToken(userId);
}

/**
 * Creates a new user in Firestore
 * @param userId - The user ID from Firebase Auth
 * @param userData - The user data to save
 * @return A promise that resolves when the user is created
 */
export async function createUser(
  userId: string,
  userData: Partial<User>
): Promise<void> {
  // If a university name is provided, ensure it exists and get its ID
  let universityId = null;
  if (userData.university) {
    try {
      // Ensure the university exists in our database
      universityId = await ensureUniversityExists(userData.university);
    } catch (error) {
      console.error(`Error processing university: ${error}`);
      // If we can't resolve the university, use the university name as-is
      universityId = userData.university;
    }
  }

  // Create user document with proper timestamps and university ID
  await db.collection("users").doc(userId).set({
    ...userData,
    // Store both the university name and ID
    university: userData.university || null,
    universityId: universityId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    activeProjects: [],
    archivedProjects: [],
  });
}

/**
 * Updates a user's profile
 * @param userId - The user ID to update
 * @param userData - The user data to update
 * @return A promise that resolves when the user is updated
 */
export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<void> {
  // If a university name is provided, ensure it exists and get its ID
  if (userData.university) {
    try {
      // Ensure the university exists in our database
      const universityId = await ensureUniversityExists(userData.university);
      // Add the university ID to the update
      userData.universityId = universityId;
    } catch (error) {
      console.error(`Error processing university: ${error}`);
      // If we can't resolve the university, use the university name as-is
      userData.universityId = userData.university;
    }
  }

  // Update the user document
  await db.collection("users").doc(userId).update({
    ...userData,
    updatedAt: Timestamp.now(),
  });
}
