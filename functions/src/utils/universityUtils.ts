import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

// Define interface for university
export interface University {
  id: string;
  name: string;
  domain: string;
  studentCount: number;
  facultyCount: number;
  studentIds: string[];
  facultyIds: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Get university ID from name
 * @param universityName Full name of the university
 * @returns University ID or the name itself if not found
 */
export function getUniversityId(universityName: string): string {
  // For now, we only support NYU, so simplify this logic
  if (universityName === "New York University") {
    return "nyu";
  }

  // Default to a normalized version of the name
  return universityName.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Get university name from ID
 * @param universityId ID of the university
 * @returns University name or the ID itself if not found
 */
export function getUniversityName(universityId: string): string {
  // For now, we only support NYU, so simplify this logic
  if (universityId === "nyu") {
    return "New York University";
  }

  // Default to the ID itself
  return universityId;
}

/**
 * Ensures a university document exists in Firestore
 * @param universityName The full name of the university
 * @returns The university ID
 */
export async function ensureUniversityExists(universityName: string): Promise<string> {
  // Get university ID from the name
  const universityId = getUniversityId(universityName);

  try {
    // Check if university document exists
    const universityRef = db.collection("universities").doc(universityId);
    const universityDoc = await universityRef.get();

    if (!universityDoc.exists) {
      // Create university document if it doesn't exist
      await universityRef.set({
        id: universityId,
        name: universityName,
        domain: `${universityId}.edu`,
        studentCount: 0,
        facultyCount: 0,
        studentIds: [],
        facultyIds: [],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`Created university document for ${universityName} with ID ${universityId}`);
    }

    return universityId;
  } catch (error) {
    console.error(`Error ensuring university exists: ${error}`);
    // Return the ID anyway, so the calling code can continue
    return universityId;
  }
}

/**
 * Initializes NYU in the database
 * Use this function in an admin script or during initial setup
 */
export async function initializeUniversities(): Promise<void> {
  try {
    const universityRef = db.collection("universities").doc("nyu");

    // Check if already exists
    const doc = await universityRef.get();
    if (doc.exists) {
      console.log("NYU document already exists, skipping initialization");
      return;
    }

    await universityRef.set({
      id: "nyu",
      name: "New York University",
      domain: "nyu.edu",
      studentCount: 0,
      facultyCount: 0,
      studentIds: [],
      facultyIds: [],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("Initialized New York University in the database");
  } catch (error) {
    console.error("Error initializing universities:", error);
    throw error;
  }
}
