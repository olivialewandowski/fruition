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

// Add this interface at the top of the file with other imports/types
interface ProjectPosition {
  id: string;
  title: string;
  description: string;
  isOpen: boolean;
}

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

  const currentCount = projectData.applicationCount || 0;

  transaction.update(projectRef, {
    applicationCount: currentCount + increment,
  });
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

  const sourceProjectData = sourceProjectDoc.data();
  if (!sourceProjectData) {
    throw new Error("Source project data is empty");
  }

  // Get the target project
  const targetProjectDoc = await transaction.get(targetProjectRef);
  if (!targetProjectDoc.exists) {
    throw new Error("Target project not found");
  }

  // Find the position in the source project
  const positions = sourceProjectData.positions || [];
  const positionIndex = positions.findIndex((p: ProjectPosition) => p.id === positionId);

  if (positionIndex === -1) {
    throw new Error("Position not found in source project");
  }

  const position = positions[positionIndex];

  // Remove the position from the source project
  const updatedPositions = [
    ...positions.slice(0, positionIndex),
    ...positions.slice(positionIndex + 1),
  ];

  transaction.update(sourceProjectRef, {
    positions: updatedPositions,
  });

  // Add the position to the target project
  transaction.update(targetProjectRef, {
    positions: [...(targetProjectDoc.data()?.positions || []), position],
  });
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
  const applicationRef = db.collection("applications").doc();

  transaction.set(applicationRef, {
    ...applicationData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: "pending",
    statusHistory: [{
      status: "pending",
      updatedAt: Timestamp.now(),
      updatedBy: applicationData.userId,
      notes: "Initial application submission",
    }],
  });

  // Create a user action for this application
  const userActionData: UserAction = {
    userId: applicationData.userId,
    projectId: applicationData.projectId,
    action: "apply", // Use a valid action from UserAction type
    timestamp: Timestamp.now(),
  };

  // Add additional data to the document but not as part of the UserAction type
  const userActionDocData = {
    ...userActionData,
    applicationId: applicationRef.id,
  };

  const userActionRef = db.collection("userActions").doc();
  transaction.set(userActionRef, userActionDocData);

  // Update the project application count
  const projectRef = db.collection("projects").doc(applicationData.projectId);
  transaction.update(projectRef, {
    applicationCount: applicationData.applicationCount + 1 || 1,
  });

  return applicationRef;
}
