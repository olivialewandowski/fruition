import { Router } from "express";
import {
  createProject,
  updateProject,
  getProjectById,
  getUserProjects,
  getProjectApplications,
  updateApplicationStatus,
  addOnboardingMaterial,
  getOnboardingMaterials,
  applyToProject,
  getAllProjects,
  deleteProject,
} from "../services/projectsService";
import { validateAuthToken, requirePermission } from "../middleware/auth";
import {
  PROJECT_PERMISSIONS,
  CONNECT_PERMISSIONS,
} from "../types/permissions";

export const projectsRouter = Router();

// all routes require authentication
projectsRouter.use(validateAuthToken);

// get all projects (admin only)
projectsRouter.get(
  "/all",
  requirePermission(PROJECT_PERMISSIONS.VIEW_APPLICATIONS),
  async (req, res) => {
    try {
      // since we've passed through validateAuthToken and requirePermission,
      // we can be sure that req.user exists and has a uid
      const projects = await getAllProjects(req.user!.uid);
      return res.status(200).json({ data: projects });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get projects",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// get user's projects
projectsRouter.get(
  "/",
  requirePermission(PROJECT_PERMISSIONS.VIEW_APPLICATIONS),
  async (req, res) => {
    try {
      const status = req.query.status as string;
      const projects = await getUserProjects(
        req.user!.uid,
        status as "active" | "archived" | "draft"
      );
      return res.status(200).json({ data: projects });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get projects",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// create new project
projectsRouter.post(
  "/",
  requirePermission(PROJECT_PERMISSIONS.CREATE_PROJECT),
  async (req, res) => {
    try {
      const projectData = req.body;
      const createdProjectId = await createProject(req.user!.uid, projectData);
      return res.status(201).json({
        message: "Project created successfully",
        data: { id: createdProjectId },
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// get project by ID
projectsRouter.get(
  "/:projectId",
  requirePermission(PROJECT_PERMISSIONS.VIEW_APPLICATIONS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await getProjectById(req.user!.uid, projectId);
      return res.status(200).json({ data: project });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get project",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// update project
projectsRouter.put(
  "/:projectId",
  requirePermission(PROJECT_PERMISSIONS.EDIT_PROJECT),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectData = req.body;
      await updateProject(req.user!.uid, projectId, projectData);
      return res.status(200).json({
        message: "Project updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to update project",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// delete project
projectsRouter.delete(
  "/:projectId",
  requirePermission(PROJECT_PERMISSIONS.DELETE_PROJECT),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      await deleteProject(req.user!.uid, projectId);

      return res.status(200).json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to delete project",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// get project applications
projectsRouter.get(
  "/:projectId/applications",
  requirePermission(PROJECT_PERMISSIONS.VIEW_APPLICATIONS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const applications = await getProjectApplications(req.user!.uid, projectId);
      return res.status(200).json({ data: applications });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get applications",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// update application status
projectsRouter.put(
  "/:projectId/applications/:applicationId",
  requirePermission(PROJECT_PERMISSIONS.MANAGE_APPLICATIONS),
  async (req, res) => {
    try {
      const { projectId, applicationId } = req.params;
      const { status, notes } = req.body;
      await updateApplicationStatus(
        req.user!.uid,
        projectId,
        applicationId,
        status,
        notes
      );
      return res.status(200).json({
        message: "Application status updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to update application status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// add onboarding material
projectsRouter.post(
  "/:projectId/materials",
  requirePermission(PROJECT_PERMISSIONS.EDIT_PROJECT),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const materialData = req.body;
      const materialId = await addOnboardingMaterial(
        req.user!.uid,
        projectId,
        materialData
      );
      return res.status(201).json({
        message: "Onboarding material added successfully",
        data: { id: materialId },
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to add onboarding material",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// get onboarding materials
projectsRouter.get(
  "/:projectId/materials",
  requirePermission(PROJECT_PERMISSIONS.VIEW_APPLICATIONS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const materials = await getOnboardingMaterials(req.user!.uid, projectId);
      return res.status(200).json({ data: materials });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get onboarding materials",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// apply to project
projectsRouter.post(
  "/:projectId/apply",
  requirePermission(CONNECT_PERMISSIONS.APPLY_TO_PROJECTS),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const applicationData = req.body;
      const applicationId = await applyToProject(
        req.user!.uid,
        projectId,
        applicationData
      );
      return res.status(201).json({
        message: "Application submitted successfully",
        data: { id: applicationId },
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default projectsRouter;
