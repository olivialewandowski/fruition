import { auth, db } from "../config/firebase";
import { User, UserWithId } from "../types";
import { UserRecord } from "firebase-admin/auth";

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
  await db.collection("users").doc(userId).set({
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeProjects: [],
    archivedProjects: [],
  });
}
