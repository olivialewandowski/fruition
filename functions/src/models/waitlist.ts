import { db } from "../config/firebase";
import { WaitlistEntry, WaitlistEntryWithId } from "../types";

/**
 * Adds a new entry to the waitlist collection
 * @param entry - The waitlist entry to add
 * @return The document ID of the created entry
 */
export async function addToWaitlist(entry: Omit<WaitlistEntry, "createdAt">): Promise<string> {
  const docRef = await db.collection("waitlist").add({
    ...entry,
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
