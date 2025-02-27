import { getUserByEmail, getUserById, createCustomToken } from "../models/users";

/**
 * Service for handling user authentication
 * @param email - The user's email address
 * @param password - The user's password (used by Firebase Auth)
 * @return Object containing token and user data
 */
export async function authenticateUser(email: string, _password: string) {
  // Get the user record from Firebase Auth
  const userRecord = await getUserByEmail(email);

  // Get the user profile from Firestore
  const userProfile = await getUserById(userRecord.uid);

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  // Create a custom token for the user
  const token = await createCustomToken(userRecord.uid);

  // Return the authenticated user with profile data
  return {
    token,
    user: {
      uid: userRecord.uid,
      ...userProfile,
      email: userRecord.email,
    },
  };
}
