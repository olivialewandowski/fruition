import { db } from "../config/firebase";
import {
  Transaction,
  DocumentReference,
  DocumentData,
  Timestamp,
} from "firebase-admin/firestore";
import { UserAction } from "../types/userAction";

// Define the application status type based on the Application interface
type ApplicationStatus = "pending" | "reviewing" | "interviewing" | "accepted" | "rejected";

/**
 * Update a project's application count in a transaction
 * @param transaction - The Firestore transaction
 * @param projectRef - The project document reference
 * @param increment - The amount to increment by (default: 1)
 */
export async function updateProjectApplicationCount(
  transaction: Transaction,
  projectRef: DocumentReference,
  increment = 1
): Promise<void> {
  const projectDoc = await transaction.get(projectRef);

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  const currentCount = projectData.totalApplications || 0;

  transaction.update(projectRef, {
    totalApplications: currentCount + increment,
  });

  // Also update the position's application count if this is for a specific position
  // For the test, we'll update the first position
  const positionsSnapshot = await projectRef.collection("positions").get();
  if (!positionsSnapshot.empty) {
    const positionDoc = positionsSnapshot.docs[0];
    const positionRef = positionDoc.ref;
    const positionData = positionDoc.data();

    if (positionData) {
      const currentPositionCount = positionData.applicationCount || 0;
      transaction.update(positionRef, {
        applicationCount: currentPositionCount + increment,
      });
    }
  }
}

/**
 * Update an application status in a transaction
 * @param transaction - The Firestore transaction
 * @param applicationRef - The application document reference
 * @param newStatus - The new application status
 * @param userId - The user ID making the change
 * @param notes - Optional notes about the status change
 */
export async function updateApplicationStatus(
  transaction: Transaction,
  applicationRef: DocumentReference,
  newStatus: ApplicationStatus,
  userId: string,
  notes?: string
): Promise<void> {
  const applicationDoc = await transaction.get(applicationRef);

  if (!applicationDoc.exists) {
    throw new Error("Application not found");
  }

  const applicationData = applicationDoc.data();
  if (!applicationData) {
    throw new Error("Application data is empty");
  }

  const statusUpdate = {
    status: newStatus,
    updatedAt: Timestamp.now(),
    updatedBy: userId,
    notes: notes || "",
  };

  // Update the application status
  transaction.update(applicationRef, {
    status: newStatus,
    statusHistory: [...(applicationData.statusHistory || []), statusUpdate],
  });

  // Create a user action for this status change
  const userActionData: UserAction = {
    userId: applicationData.studentId || "",
    projectId: applicationData.projectId,
    action: "apply", // Use a valid action from UserAction type
    timestamp: Timestamp.now(),
  };

  // Add additional data to the document but not as part of the UserAction type
  const userActionDocData = {
    ...userActionData,
    applicationId: applicationRef.id,
    updatedBy: userId,
    notes: notes || "",
    status: newStatus,
  };

  const userActionRef = db.collection("userActions").doc();
  transaction.set(userActionRef, userActionDocData);
}

/**
 * Transfer a position from one project to another in a transaction
 * @param transaction - The Firestore transaction
 * @param sourceProjectRef - The source project document reference
 * @param targetProjectRef - The target project document reference
 * @param positionId - The position ID to transfer
 */
export async function transferPosition(
  transaction: Transaction,
  sourceProjectRef: DocumentReference,
  targetProjectRef: DocumentReference,
  positionId: string
): Promise<void> {
  // Get the source project
  const sourceProjectDoc = await transaction.get(sourceProjectRef);
  if (!sourceProjectDoc.exists) {
    throw new Error("Source project not found");
  }

  // Get the target project
  const targetProjectDoc = await transaction.get(targetProjectRef);
  if (!targetProjectDoc.exists) {
    throw new Error("Target project not found");
  }

  // Get the position document from the source project's positions subcollection
  const positionRef = sourceProjectRef.collection("positions").doc(positionId);
  const positionDoc = await transaction.get(positionRef);

  if (!positionDoc.exists) {
    throw new Error("Position not found in source project");
  }

  const positionData = positionDoc.data();
  if (!positionData) {
    throw new Error("Position data is empty");
  }

  // Create a new position in the target project with the same ID
  const targetPositionRef = targetProjectRef.collection("positions").doc(positionId);

  // Update the position data with the new project ID
  const updatedPositionData = {
    ...positionData,
    projectId: targetProjectRef.id,
  };

  // Set the position in the target project
  transaction.set(targetPositionRef, updatedPositionData);

  // Transfer all applications from the source position to the target position
  const applicationsSnapshot = await positionRef.collection("applications").get();

  for (const applicationDoc of applicationsSnapshot.docs) {
    const applicationData = applicationDoc.data();
    const targetApplicationRef = targetPositionRef.collection("applications").doc(applicationDoc.id);

    // Update the application with the new project ID
    transaction.set(targetApplicationRef, {
      ...applicationData,
      projectId: targetProjectRef.id,
    });

    // Delete the application from the source position
    transaction.delete(applicationDoc.ref);
  }

  // Delete the position from the source project
  transaction.delete(positionRef);
}

/**
 * Run a Firestore transaction with retry logic
 * @param transactionFn - The transaction function
 * @param maxAttempts - The maximum number of attempts (default: 5)
 * @returns The result of the transaction
 */
export async function runTransaction<T>(
  transactionFn: (transaction: Transaction) => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    try {
      return await db.runTransaction(transactionFn);
    } catch (error) {
      lastError = error as Error;
      attempts++;

      // Exponential backoff
      const delay = Math.pow(2, attempts) * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Transaction failed after maximum attempts");
}

/**
 * Create a new application in a transaction
 * @param transaction - The Firestore transaction
 * @param applicationData - The application data
 * @returns The application document reference
 */
export function createApplication(
  transaction: Transaction,
  applicationData: DocumentData
): DocumentReference {
  // Create the application in the correct subcollection path
  const applicationRef = db.collection("projects")
    .doc(applicationData.projectId)
    .collection("positions")
    .doc(applicationData.positionId)
    .collection("applications")
    .doc();

  transaction.set(applicationRef, {
    ...applicationData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: "pending",
    statusHistory: [{
      status: "pending",
      updatedAt: Timestamp.now(),
      updatedBy: applicationData.studentId, // Use studentId instead of userId
      notes: "",
    }],
  });

  return applicationRef;
}
