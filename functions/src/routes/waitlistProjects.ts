// functions/src/routes/waitlistProjects.ts
import { Router } from "express";
import { addProjectToWaitlist, getAllWaitlistProjects } from "../models/waitlistProjects";

export const waitlistProjectsRouter = Router();

waitlistProjectsRouter.post("/add", async (req, res) => {
  try {
    console.log("Received project data:", req.body);
    const { title, description, qualifications, positionType } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Project title and description are required" });
    }

    const projectData = {
      title,
      description,
      qualifications,
      positionType,
      userEmail: req.body.userEmail || "",
    };

    const docId = await addProjectToWaitlist(projectData);

    const responseData = {
      id: docId,
      ...projectData,
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      message: "Successfully added project to waitlist",
      data: responseData,
      id: docId,
    });
  } catch (error) {
    console.error("Error adding project to waitlist:", error);
    return res.status(500).json({
      error: "Failed to add project to waitlist",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all waitlist projects
waitlistProjectsRouter.get("/", async (req, res) => {
  try {
    const projects = await getAllWaitlistProjects();
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.error("Error fetching waitlist projects:", error);
    return res.status(500).json({
      error: "Failed to fetch waitlist projects",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
