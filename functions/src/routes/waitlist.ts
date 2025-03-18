import { Router } from "express";
import { WaitlistEntry } from "../types";
import { addToWaitlist, checkExistingEmail } from "../models/waitlist";

export const waitlistRouter = Router();

waitlistRouter.post("/join", async (req, res) => {
  try {
    const { email, firstName, lastName, role, institution, source, projectId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailExists = await checkExistingEmail(email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already on waitlist" });
    }

    // Clean the data to avoid undefined/null values
    const cleanedData = {
      email,
      firstName,
      lastName,
      role,
      institution,
      source: source || "waitlist",
    };

    // Only add projectId if it's a valid string value
    if (typeof projectId === "string" && projectId.trim().length > 0) {
      // Using a type assertion to add the optional property
      (cleanedData as any).projectId = projectId.trim();
    }

    // Log the data being sent to Firestore
    console.log("Adding to waitlist with data:", cleanedData);

    // Add to waitlist collection
    const docId = await addToWaitlist(cleanedData as Omit<WaitlistEntry, "createdAt">);

    // Create response data
    const responseData = {
      id: docId,
      ...cleanedData,
      createdAt: new Date().toISOString(),
    };

    // If this is a postProject submission and projectId exists, update the project with user info
    if (source === "postProject" && typeof projectId === "string" && projectId.trim().length > 0) {
      try {
        const { db } = await import("../config/firebase");
        const projectRef = db.collection("waitlistprojects").doc(projectId.trim());
        const projectDoc = await projectRef.get();

        if (projectDoc.exists) {
          await projectRef.update({
            userEmail: email,
            userFirstName: firstName,
            userLastName: lastName,
            updatedAt: new Date().toISOString(),
            status: "submitted",
          });
          console.log(`Updated project ${projectId} with user info`);
        } else {
          console.log(`Project ${projectId} does not exist, skipping update`);
        }
      } catch (error) {
        console.error(`Error updating project with user info: ${error}`);
        // Don't fail the overall request if this update fails
      }
    }

    return res.status(201).json({
      message: "Successfully joined waitlist",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in waitlist join:", error);
    return res.status(500).json({
      error: "Failed to join waitlist",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
