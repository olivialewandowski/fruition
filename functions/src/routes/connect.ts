import express from "express";
import { validateAuthToken, requirePermission } from "../middleware/auth";
import { CONNECT_PERMISSIONS } from "../types/permissions";
import { 
  saveProject, 
  removeSavedProject, 
  declineProject, 
  getSavedProjects,
  getAppliedProjects,
  undoLastAction
} from "../services/connectService";
import { getProjectsByIds } from "../services/projectsService";

export const connectRouter = express.Router();

// All routes require authentication
connectRouter.use(validateAuthToken);

// Get recommended projects
connectRouter.get(
  "/recommended",
  requirePermission(CONNECT_PERMISSIONS.SWIPE_PROJECTS),
  async (req, res) => {
    try {
      // TODO: Implement recommendation algorithm
      // For now, return placeholder data
      return res.status(200).json({
        success: true,
        message: "Recommended projects retrieved successfully",
        data: []
      });
    } catch (error) {
      console.error("Error getting recommended projects:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get recommended projects",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Save a project
connectRouter.post(
  "/save/:projectId",
  requirePermission(CONNECT_PERMISSIONS.SAVE_PROJECTS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.uid;

      await saveProject(userId, projectId);

      return res.status(200).json({
        success: true,
        message: "Project saved successfully"
      });
    } catch (error) {
      console.error("Error saving project:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Decline a project
connectRouter.post(
  "/decline/:projectId",
  requirePermission(CONNECT_PERMISSIONS.SWIPE_PROJECTS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.uid;

      await declineProject(userId, projectId);

      return res.status(200).json({
        success: true,
        message: "Project declined successfully"
      });
    } catch (error) {
      console.error("Error declining project:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to decline project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Get saved projects
connectRouter.get(
  "/saved",
  requirePermission(CONNECT_PERMISSIONS.SAVE_PROJECTS),
  async (req, res) => {
    try {
      const userId = req.user!.uid;
      
      // Get saved project IDs
      const savedProjectIds = await getSavedProjects(userId);
      
      // Get project details
      const savedProjects = await getProjectsByIds(savedProjectIds);

      return res.status(200).json({
        success: true,
        message: "Saved projects retrieved successfully",
        data: savedProjects
      });
    } catch (error) {
      console.error("Error getting saved projects:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get saved projects",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Remove a saved project
connectRouter.delete(
  "/saved/:projectId",
  requirePermission(CONNECT_PERMISSIONS.SAVE_PROJECTS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.uid;

      await removeSavedProject(userId, projectId);

      return res.status(200).json({
        success: true,
        message: "Project removed from saved successfully"
      });
    } catch (error) {
      console.error("Error removing saved project:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to remove saved project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Get applied projects
connectRouter.get(
  "/applied",
  requirePermission(CONNECT_PERMISSIONS.APPLY_TO_PROJECTS),
  async (req, res) => {
    try {
      const userId = req.user!.uid;
      
      // Get applied project IDs
      const appliedProjectIds = await getAppliedProjects(userId);
      
      // Get project details
      const appliedProjects = await getProjectsByIds(appliedProjectIds);

      return res.status(200).json({
        success: true,
        message: "Applied projects retrieved successfully",
        data: appliedProjects
      });
    } catch (error) {
      console.error("Error getting applied projects:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get applied projects",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Undo last action
connectRouter.post(
  "/undo",
  requirePermission(CONNECT_PERMISSIONS.SWIPE_PROJECTS),
  async (req, res) => {
    try {
      const userId = req.user!.uid;

      const result = await undoLastAction(userId);

      return res.status(200).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Error undoing last action:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to undo last action",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

export default connectRouter;
