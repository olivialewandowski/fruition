import { db } from "../config/firebase";
import { WaitlistEntry, WaitlistEntryWithId } from "../types";

/**
 * Adds a new entry to the waitlist collection with undefined value filtering
 * @param entry - The waitlist entry to add
 * @return The document ID of the created entry
 */
export async function addToWaitlist(entry: Omit<WaitlistEntry, "createdAt">): Promise<string> {
  // Filter out any undefined or null values
  const cleanEntry = Object.fromEntries(
    Object.entries(entry).filter(([_, v]) => v !== undefined && v !== null)
  );

  // Log the cleaned entry being sent to Firestore
  console.log("Clean entry being sent to Firestore:", cleanEntry);

  // Add to Firestore
  const docRef = await db.collection("waitlist").add({
    ...cleanEntry,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Checks if an email already exists in the waitlist
 * @param email - The email to check
 * @return Boolean indicating if the email exists
 */
export async function checkExistingEmail(email: string): Promise<boolean> {
  const existingEntries = await db.collection("waitlist")
    .where("email", "==", email)
    .get();
  return !existingEntries.empty;
}

/**
 * Retrieves all waitlist entries
 * @return Array of waitlist entries with IDs
 */
export async function getAllWaitlistEntries(): Promise<WaitlistEntryWithId[]> {
  const snapshot = await db.collection("waitlist").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WaitlistEntryWithId));
}

/**
 * Gets waitlist entries by projectId
 * @param projectId - The project ID to search for
 * @return Array of waitlist entries with IDs
 */
export async function getWaitlistEntriesByProjectId(projectId: string): Promise<WaitlistEntryWithId[]> {
  const snapshot = await db.collection("waitlist")
    .where("projectId", "==", projectId)
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WaitlistEntryWithId));
}
