import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import router from "./routes";
import { requestLogger } from "./middleware/auth";
import * as functions from "firebase-functions";
import { db } from "./config/firebase";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
// Import the projectsRouter
import { projectsRouter } from "./routes/projects";
// Import the waitlistProjects router
import { waitlistProjectsRouter } from "./routes/waitlistProjects";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore triggers directly with named exports
// This ensures they are properly registered as individual functions
// Updated to use the new function names from firestoreTriggers.ts
import {
  onUserCreateOrUpdate,
  onProjectCreate,
  onApplicationUpdate,
  onPositionCreate,
  onProjectUpdate,
  onApplicationCreate,
} from "./triggers/firestoreTriggers";

export {
  onUserCreateOrUpdate,
  onProjectCreate,
  onApplicationUpdate,
  onPositionCreate,
  onProjectUpdate,
  onApplicationCreate,
};

// Example HTTP function with Gen 2 configuration
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({ message: "Hello from Fruition Research Matching Platform!" });
});

// Define a type for the context that matches what we need
interface AuthContext {
  auth?: {
    uid: string;
    token?: any;
  };
}

/**
 * Direct function to create projects bypassing permission checks
 * This helps diagnose issues with the normal flow
 */
export const createProjectDirect = functions.https.onCall(async (data: any, context: any) => {
  // Use type assertion to help TypeScript understand the context structure
  const authContext = context as AuthContext;

  // Check if authenticated
  if (!authContext || !authContext.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a project"
    );
  }

  const userId = authContext.auth.uid;
  console.log(`Attempting to create project for user ${userId}`);

  try {
    // Get user document and log all its fields for debugging
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`User document ${userId} not found`);
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    console.log("User document data:", userData);

    if (!userData) {
      console.log(`User data for ${userId} is empty`);
      throw new functions.https.HttpsError("not-found", "User data is missing");
    }

    // Log the user role
    console.log(`User role: ${userData.role || "undefined"}`);

    // If role is missing, set it for testing
    if (!userData.role) {
      console.log("Role is missing, setting to faculty");
      await userRef.update({
        role: "faculty",
        updatedAt: Timestamp.now(),
      });
    }

    // Extract project and position data
    // Use proper type guard to access data properties
    if (!data || typeof data !== "object") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request data is missing or invalid"
      );
    }

    const projectData = data.projectData;
    const positionData = data.positionData;

    if (!projectData || !positionData) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Project data or position data is missing"
      );
    }

    console.log("Project data:", projectData);
    console.log("Position data:", positionData);

    // Add the user as mentor if not already set
    const projectWithUser = {
      ...projectData,
      mentorId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: projectData.status || "active",
      isActive: projectData.status === "active" ? true : false,
      teamMembers: projectData.teamMembers || [],
    };

    // Create the project document
    const projectRef = await db.collection("projects").add(projectWithUser);
    const projectId = projectRef.id;
    console.log(`Created project with ID: ${projectId}`);

    // Add the position
    const positionWithProject = {
      ...positionData,
      projectId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection("positions").add(positionWithProject);
    console.log("Created position successfully");

    // Update user's active projects
    const activeProjects = userData.activeProjects || [];
    await userRef.update({
      activeProjects: [...activeProjects, projectId],
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log("Updated user's active projects");

    return { projectId };
  } catch (error) {
    console.error("Error in createProjectDirect:", error);
    throw new functions.https.HttpsError(
      "internal",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

const app = express();
app.use(cors({
  origin: ["https://fruitionresearch.com", "http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
}));
app.use(express.json());
app.use(requestLogger);

// Add waitlistProjects router to handle waitlist project submissions (no auth required)
app.use("/waitlist/projects", waitlistProjectsRouter);

// Add projects router to the Express app (with auth)
app.use("/projects", projectsRouter);

// Use the main router
app.use(router);

// Add a direct test endpoint for debugging
app.post("/test-waitlist-project", async (req, res) => {
  try {
    console.log("Received test project data:", req.body);
    const { title, description, qualifications, positionType } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Project title and description are required" });
    }

    // Add project to waitlistprojects collection
    const docRef = await db.collection("waitlistprojects").add({
      title,
      description,
      qualifications,
      positionType,
      createdAt: new Date().toISOString(),
    });

    console.log("Test project added with ID:", docRef.id);

    return res.status(201).json({
      message: "Successfully added test project to waitlist",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error adding test project:", error);
    return res.status(500).json({
      error: "Failed to add test project",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export const api = onRequest(app);
