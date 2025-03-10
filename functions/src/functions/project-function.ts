// functions/src/functions/project-functions.ts

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { Project } from "../types/project";
import { Position } from "../types/position";
import { hasPermission } from "../models/permissions";
import { PROJECT_PERMISSIONS } from "../types/permissions";

// Initialize Firestore if not already initialized
const db = admin.firestore();

/**
 * Cloud function to create a project directly
 * Validates request data and implements the creation with proper permissions
 */
export const createProjectDirect = onCall(async (request) => {
  try {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to create a project"
      );
    }

    const userId = request.auth.uid;
    console.log(`Creating project for user ${userId}`);

    // Extract project and position data
    const { projectData, positionData } = request.data;

    if (!projectData) {
      throw new HttpsError(
        "invalid-argument",
        "Project data is required"
      );
    }

    // Check if user has permission to create projects
    // Always allow in development mode
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasCreatePermission = isDevelopment || await hasPermission(userId, PROJECT_PERMISSIONS.CREATE_PROJECT);

    if (!hasCreatePermission) {
      throw new HttpsError(
        "permission-denied",
        "User does not have permission to create projects"
      );
    }

    // Prepare project data
    const projectWithMetadata: Partial<Project> = {
      ...projectData,
      mentorId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: projectData.status || "active",
      isActive: projectData.status === "active",
      teamMembers: projectData.teamMembers || [],
    };

    // Create the project in Firestore
    const projectRef = await db.collection("projects").add(projectWithMetadata);
    const projectId = projectRef.id;
    console.log(`Created project with ID: ${projectId}`);

    // Create position if position data is provided
    if (positionData) {
      const positionWithMetadata: Partial<Position> = {
        ...positionData,
        projectId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        filledPositions: 0,
      };

      await db.collection("positions").add(positionWithMetadata);
      console.log(`Created position for project: ${projectId}`);
    }

    // Add project to user's active projects
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData) {
        const activeProjects = userData.activeProjects || [];

        // Only add if not already in the list
        if (!activeProjects.includes(projectId)) {
          await userRef.update({
            activeProjects: [...activeProjects, projectId],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    return {
      success: true,
      projectId,
      message: "Project created successfully",
    };
  } catch (error) {
    console.error("Error in createProjectDirect:", error);

    // Format the error appropriately for the client
    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      "internal",
      `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

/**
 * API endpoint to create a project via REST
 * For use with direct API calls rather than Firebase Functions SDK
 */
export const createProject = onRequest(async (req, res) => {
  try {
    // Only allow POST method
    if (req.method !== "POST") {
      res.status(405).json({ success: false, message: "Method not allowed" });
      return;
    }

    // Verify authentication token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    const userId = decodedToken.uid;
    const { projectData, positionData } = req.body;

    if (!projectData) {
      res.status(400).json({ success: false, message: "Project data is required" });
      return;
    }

    // Check if user has permission to create projects
    const hasCreatePermission = await hasPermission(userId, PROJECT_PERMISSIONS.CREATE_PROJECT);
    if (!hasCreatePermission) {
      res.status(403).json({ success: false, message: "Permission denied" });
      return;
    }

    // Prepare project data
    const projectWithMetadata: Partial<Project> = {
      ...projectData,
      mentorId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: projectData.status || "active",
      isActive: projectData.status === "active",
      teamMembers: projectData.teamMembers || [],
    };

    // Create the project in Firestore
    const projectRef = await db.collection("projects").add(projectWithMetadata);
    const projectId = projectRef.id;

    // Create position if position data is provided
    if (positionData) {
      const positionWithMetadata: Partial<Position> = {
        ...positionData,
        projectId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        filledPositions: 0,
      };

      await db.collection("positions").add(positionWithMetadata);
    }

    // Add project to user's active projects
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData) {
        const activeProjects = userData.activeProjects || [];

        // Only add if not already in the list
        if (!activeProjects.includes(projectId)) {
          await userRef.update({
            activeProjects: [...activeProjects, projectId],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      projectId,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error in createProject HTTP endpoint:", error);
    res.status(500).json({
      success: false,
      message: `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
});
