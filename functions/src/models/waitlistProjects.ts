// functions/src/models/waitlistProjects.ts
import { db } from "../config/firebase";
import { WaitlistProject, WaitlistProjectWithId } from "../types/waitlistProjects";

/**
 * Adds a new project to the waitlistprojects collection
 * @param project - The project to add
 * @return The document ID of the created project
 */
export async function addProjectToWaitlist(project: Omit<WaitlistProject, "createdAt">): Promise<string> {
  const docRef = await db.collection("waitlistprojects").add({
    ...project,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Retrieves all waitlist projects
 * @return Array of waitlist projects with IDs
 */
export async function getAllWaitlistProjects(): Promise<WaitlistProjectWithId[]> {
  const snapshot = await db.collection("waitlistprojects").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WaitlistProjectWithId));
}

/**
 * Retrieves projects submitted by a specific user
 * @param userEmail - The email of the user
 * @return Array of waitlist projects with IDs
 */
export async function getProjectsByUser(userEmail: string): Promise<WaitlistProjectWithId[]> {
  const snapshot = await db.collection("waitlistprojects")
    .where("userEmail", "==", userEmail)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WaitlistProjectWithId));
}
