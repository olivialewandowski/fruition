// src/services/projectsService.ts
import { db } from "../config/firebase";
import { getAuth } from "firebase-admin/auth";
import {
  Timestamp,
  FieldValue,
  FieldPath,
} from "firebase-admin/firestore";
import { Project, ProjectWithId } from "../types/project";
import { Position, Application, OnboardingMaterial, ApplicationWithId } from "../types/position";
import { hasPermission } from "../models/permissions";
import { PROJECT_PERMISSIONS } from "../types/permissions";

/**
 * Get multiple projects by their IDs
 * @param projectIds - Array of project IDs to fetch
 * @returns Array of projects with their IDs
 */
export const getProjectsByIds = async (projectIds: string[]): Promise<ProjectWithId[]> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
    if (!canView) {
      throw new Error("Unauthorized: You don't have permission to view projects");
    }

    if (projectIds.length === 0) {
      return [];
    }

    // Fetch projects (process in batches as Firestore has a limit for "in" queries)
    const projects: ProjectWithId[] = [];

    for (let i = 0; i < projectIds.length; i += 10) {
      const batch = projectIds.slice(i, i + 10);

      if (batch.length > 0) {
        const projectsQuery = db.collection("projects")
          .where(FieldPath.documentId(), "in", batch);

        const projectsSnapshot = await projectsQuery.get();

        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            projects.push({
              id: doc.id,
              mentorId: data.mentorId,
              status: data.status,
              isActive: data.isActive,
              teamMembers: data.teamMembers,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              ...data,
            } as ProjectWithId);
          }
        });
      }
    }

    return projects;
  } catch (error) {
    console.error("Error getting projects by IDs:", error);
    throw error;
  }
};

/**
 * Create a new project with position
 * @param projectData - The project data
 * @param positionData - The position data
 * @returns The created project ID
 */
export const createProject = async (
  projectData: Partial<Project>,
  positionData: Partial<Position>
): Promise<string> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canCreate = await hasPermission(userId, PROJECT_PERMISSIONS.CREATE_PROJECT);
    if (!canCreate) {
      throw new Error("Unauthorized: You don't have permission to create projects");
    }

    // Add the current user as the mentorId
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

    // Add the position with a reference to the project
    const positionWithProject = {
      ...positionData,
      projectId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection("positions").add(positionWithProject);

    // Update user's active projects
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (!userData) {
        throw new Error("User data is missing");
      }

      const activeProjects = userData.activeProjects || [];
      const archivedProjects = userData.archivedProjects || [];

      const updatedActiveProjects = activeProjects.filter((id: string) => id !== projectId);
      const updatedArchivedProjects = archivedProjects.filter((id: string) => id !== projectId);

      await userRef.update({
        activeProjects: updatedActiveProjects,
        archivedProjects: updatedArchivedProjects,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      if (!activeProjects.includes(projectId)) {
        await userRef.update({
          activeProjects: [...activeProjects, projectId],
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return projectId;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/**
 * Get user projects based on status
 * @param status - The project status to filter by (active, archived, applied)
 * @returns Array of projects
 */
export const getUserProjects = async (
  status: "active" | "archived" | "applied" = "active"
): Promise<Project[]> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
    if (!canView) {
      throw new Error("Unauthorized: You don't have permission to view projects");
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    if (!userData) {
      return [];
    }

    let projectIds: string[] = [];

    // Get project IDs based on status
    if (status === "active") {
      projectIds = userData.activeProjects || [];

      // For faculty, also get projects where they are the mentor
      if (userData.role === "faculty" || userData.role === "admin") {
        const mentorProjectsQuery = db.collection("projects")
          .where("mentorId", "==", userId)
          .where("status", "==", "active");

        const mentorProjectsSnapshot = await mentorProjectsQuery.get();
        const mentorProjectIds = mentorProjectsSnapshot.docs.map((doc) => doc.id);

        projectIds = [...new Set([...projectIds, ...mentorProjectIds])];
      }
    } else if (status === "archived") {
      projectIds = userData.archivedProjects || [];
    } else if (status === "applied") {
      projectIds = userData.projectPreferences?.appliedProjects || [];
    }

    if (projectIds.length === 0) {
      return [];
    }

    // Fetch projects
    const projects: Project[] = [];

    // Process in batches (Firestore has a limit for "in" queries)
    for (let i = 0; i < projectIds.length; i += 10) {
      const batch = projectIds.slice(i, i + 10);

      if (batch.length > 0) {
        const projectsQuery = db.collection("projects")
          .where(FieldPath.documentId(), "in", batch);

        const projectsSnapshot = await projectsQuery.get();

        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            const project = {
              id: doc.id,
              mentorId: data.mentorId,
              status: data.status,
              isActive: data.isActive,
              teamMembers: data.teamMembers,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              ...data,
            } as ProjectWithId;
            projects.push(project);
          }
        });
      }
    }

    return projects;
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw error;
  }
};

/**
 * Get a project by ID
 * @param projectId - The project ID to fetch
 * @returns The project data
 */
export const getProjectById = async (projectId: string): Promise<ProjectWithId | null> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
    if (!canView) {
      throw new Error("Unauthorized: You don't have permission to view projects");
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return null;
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      return null;
    }

    return {
      id: projectDoc.id,
      ...projectData,
    } as ProjectWithId;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

/**
 * Update a project
 * @param projectId - The project ID to update
 * @param projectData - The updated project data
 */
export const updateProject = async (
  projectId: string,
  projectData: Partial<Project>
): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId();

    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const existingProject = projectDoc.data();
    if (!existingProject) {
      throw new Error("Project data is missing");
    }

    // Check permission
    const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
    if (!canEdit) {
      throw new Error("Unauthorized: You don't have permission to edit projects");
    }

    // Only the project owner or admin can update it
    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (existingProject.mentorId !== userId && !isAdmin) {
      throw new Error("You do not have permission to update this project");
    }

    // Handle status changes
    let isActive = existingProject.isActive || false;
    if (projectData.status) {
      isActive = projectData.status === "active";
    }

    // Update the project
    await db.collection("projects").doc(projectId).update({
      ...projectData,
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // If status changed to "archived", move from active to archived projects
    if (projectData.status === "archived" && existingProject.status !== "archived") {
      const userRef = db.collection("users").doc(existingProject.mentorId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          const activeProjects = userData.activeProjects || [];
          const archivedProjects = userData.archivedProjects || [];

          // Remove from active projects
          const updatedActiveProjects = activeProjects.filter(
            (id: string) => id !== projectId
          );

          // Add to archived projects if not already there
          if (!archivedProjects.includes(projectId)) {
            await userRef.update({
              activeProjects: updatedActiveProjects,
              archivedProjects: [...archivedProjects, projectId],
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            await userRef.update({
              activeProjects: updatedActiveProjects,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
      }
    }

    // If status changed from "archived" to "active", move from archived to active projects
    if (projectData.status === "active" && existingProject.status === "archived") {
      const userRef = db.collection("users").doc(existingProject.mentorId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          const activeProjects = userData.activeProjects || [];
          const archivedProjects = userData.archivedProjects || [];

          // Remove from archived projects
          const updatedArchivedProjects = archivedProjects.filter(
            (id: string) => id !== projectId
          );

          // Add to active projects if not already there
          if (!activeProjects.includes(projectId)) {
            await userRef.update({
              archivedProjects: updatedArchivedProjects,
              activeProjects: [...activeProjects, projectId],
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            await userRef.update({
              archivedProjects: updatedArchivedProjects,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

/**
 * Get project positions
 * @param projectId - The project ID
 * @returns Array of positions for the project
 */
export const getProjectPositions = async (projectId: string): Promise<Position[]> => {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      throw new Error("You must be logged in to view positions");
    }

    const positionsQuery = db.collection("positions")
      .where("projectId", "==", projectId);

    const positionsSnapshot = await positionsQuery.get();
    const positions: Position[] = [];

    positionsSnapshot.forEach((doc) => {
      const positionData = doc.data();
      positions.push({
        id: doc.id,
        ...positionData,
      } as unknown as Position);
    });

    return positions;
  } catch (error) {
    console.error("Error getting project positions:", error);
    throw error;
  }
};

/**
 * Archive a project
 * @param projectId - The project ID to archive
 */
export const archiveProject = async (projectId: string): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
    if (!canEdit) {
      throw new Error("Unauthorized: You don't have permission to edit projects");
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const project = projectDoc.data();
    if (!project) {
      throw new Error("Project data is missing");
    }

    // Only the project owner or admin can archive it
    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (project.mentorId !== userId && !isAdmin) {
      throw new Error("You do not have permission to archive this project");
    }

    // Update the project status
    await projectRef.update({
      status: "archived",
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update user's active and archived projects
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData) {
        const activeProjects = userData.activeProjects || [];
        const archivedProjects = userData.archivedProjects || [];

        // Remove from active projects
        const updatedActiveProjects = activeProjects.filter(
          (id: string) => id !== projectId
        );

        // Add to archived projects if not already there
        if (!archivedProjects.includes(projectId)) {
          await userRef.update({
            activeProjects: updatedActiveProjects,
            archivedProjects: [...archivedProjects, projectId],
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          await userRef.update({
            activeProjects: updatedActiveProjects,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error archiving project:", error);
    throw error;
  }
};

/**
 * Unarchive a project
 * @param projectId - The project ID to unarchive
 */
export const unarchiveProject = async (projectId: string): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
    if (!canEdit) {
      throw new Error("Unauthorized: You don't have permission to edit projects");
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const project = projectDoc.data();
    if (!project) {
      throw new Error("Project data is missing");
    }

    // Only the project owner or admin can unarchive it
    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (project.mentorId !== userId && !isAdmin) {
      throw new Error("You do not have permission to unarchive this project");
    }

    // Update the project status
    await projectRef.update({
      status: "active",
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update user's active and archived projects
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData) {
        const activeProjects = userData.activeProjects || [];
        const archivedProjects = userData.archivedProjects || [];

        // Remove from archived projects
        const updatedArchivedProjects = archivedProjects.filter(
          (id: string) => id !== projectId
        );

        // Add to active projects if not already there
        if (!activeProjects.includes(projectId)) {
          await userRef.update({
            archivedProjects: updatedArchivedProjects,
            activeProjects: [...activeProjects, projectId],
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          await userRef.update({
            archivedProjects: updatedArchivedProjects,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error unarchiving project:", error);
    throw error;
  }
};

/**
 * Gets all applications for a project
 * @param projectId - The ID of the project
 * @returns Array of applications
 */
export const getProjectApplications = async (projectId: string): Promise<Application[]> => {
  try {
    const userId = await getAuthenticatedUserId();

    // Check permission
    const canManage = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (!canManage) {
      throw new Error("Unauthorized: You don't have permission to view applications");
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      throw new Error("Project data is missing");
    }

    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (projectData.mentorId !== userId && !isAdmin) {
      throw new Error("Unauthorized: You can only view applications for your own projects");
    }

    const applicationsQuery = db.collection("projects").doc(projectId).collection("applications");
    const applicationsSnapshot = await applicationsQuery.get();
    const applications: Application[] = [];

    applicationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        const application: ApplicationWithId = {
          id: doc.id,
          studentId: data.studentId,
          studentName: data.studentName,
          status: data.status,
          submittedAt: data.submittedAt,
          updatedAt: data.updatedAt,
          notes: data.notes,
          interestStatement: data.interestStatement,
          resumeFile: data.resumeFile,
          studentInfo: data.studentInfo,
          ...data,
        };
        applications.push(application);
      }
    });

    return applications;
  } catch (error) {
    console.error("Error getting project applications:", error);
    throw error;
  }
};

/**
 * Updates an application status
 * @param projectId - The ID of the project
 * @param applicationId - The ID of the application
 * @param status - The new status
 * @param notes - Optional notes about the status change
 */
export const updateApplicationStatus = async (
  projectId: string,
  applicationId: string,
  status: "incoming" | "pending" | "interviewing" | "accepted" | "rejected",
  notes?: string
): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId();

    const applicationDoc = await db.collection("projects")
      .doc(projectId)
      .collection("applications")
      .doc(applicationId)
      .get();

    if (!applicationDoc.exists) {
      throw new Error("Application not found");
    }

    const applicationData = applicationDoc.data();
    if (!applicationData) {
      throw new Error("Application data is missing");
    }

    // Check permission
    const canManage = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (!canManage) {
      throw new Error("Unauthorized: You don't have permission to manage applications");
    }

    // Check if user is the project mentor or an admin
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const projectData = projectDoc.data();

    if (!projectData) {
      throw new Error("Project data is missing");
    }

    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (projectData.mentorId !== userId && !isAdmin) {
      throw new Error("Unauthorized: You can only manage applications for your own projects");
    }

    // Update the application status
    const updateData: Record<string, any> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await applicationDoc.ref.update(updateData);

    // If status is "accepted", add the student to the project team
    if (status === "accepted") {
      const studentId = applicationData.studentId;

      if (studentId) {
        const studentDoc = await db.collection("users").doc(studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          if (studentData) {
            // Now we can safely use studentData
            const teamMember = {
              userId: studentId,
              name: `${studentData.firstName} ${studentData.lastName}`,
              title: "Research Assistant",
              joinedDate: Timestamp.fromDate(new Date()),
            };

            const currentTeamMembers = projectData.teamMembers || [];
            await projectRef.update({
              teamMembers: [...currentTeamMembers, teamMember],
              updatedAt: FieldValue.serverTimestamp(),
            });

            // Add project to student's active projects
            const studentActiveProjects = studentData.activeProjects || [];
            if (!studentActiveProjects.includes(projectId)) {
              await studentDoc.ref.update({
                activeProjects: [...studentActiveProjects, projectId],
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

/**
 * Adds onboarding material to a project
 * @param projectId - The ID of the project
 * @param material - The onboarding material to add
 * @returns The ID of the created material
 */
export const addOnboardingMaterial = async (
  projectId: string,
  material: Partial<OnboardingMaterial>
): Promise<string> => {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      throw new Error("You must be logged in to add onboarding materials");
    }

    // Check permission
    const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
    if (!canEdit) {
      throw new Error("Unauthorized: You don't have permission to edit projects");
    }

    // Check if user is the project mentor or an admin
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      throw new Error("Project data is missing");
    }

    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (projectData.mentorId !== userId && !isAdmin) {
      throw new Error("Unauthorized: You can only add materials to your own projects");
    }

    // Create the onboarding material
    const materialData = {
      ...material,
      uploadedAt: FieldValue.serverTimestamp(),
      uploadedBy: userId,
    };

    const materialRef = await db
      .collection("projects")
      .doc(projectId)
      .collection("onboardingMaterials")
      .add(materialData);

    return materialRef.id;
  } catch (error) {
    console.error("Error adding onboarding material:", error);
    throw error;
  }
};

/**
 * Gets all onboarding materials for a project
 * @param projectId - The ID of the project
 * @returns Array of onboarding materials
 */
export const getOnboardingMaterials = async (projectId: string): Promise<OnboardingMaterial[]> => {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      throw new Error("You must be logged in to view onboarding materials");
    }

    // Check permission
    const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
    if (!canView) {
      throw new Error("Unauthorized: You don't have permission to view projects");
    }

    // Verify project exists
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    // Get onboarding materials
    const materialsQuery = db.collection("projects").doc(projectId).collection("onboardingMaterials");

    const materialsSnapshot = await materialsQuery.get();
    const materials: OnboardingMaterial[] = [];

    materialsSnapshot.forEach((doc) => {
      const materialData = doc.data();
      materials.push({
        id: doc.id,
        ...materialData,
      } as unknown as OnboardingMaterial);
    });

    return materials;
  } catch (error) {
    console.error("Error getting onboarding materials:", error);
    throw error;
  }
};

/**
 * Applies to a project
 * @param projectId - The ID of the project
 * @param applicationData - The application data
 * @returns The ID of the created application
 */
export const applyToProject = async (
  projectId: string,
  applicationData: Partial<Application>
): Promise<string> => {
  try {
    const userId = await getAuthenticatedUserId();

    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      throw new Error("Project data is missing");
    }

    if (projectData.status !== "active") {
      throw new Error("Cannot apply to inactive project");
    }

    // Check if applications are closed
    if (!projectData.rollingApplications) {
      const closeDate = projectData.applicationCloseDate?.toDate();

      if (closeDate && closeDate < new Date()) {
        throw new Error("Applications for this project are closed");
      }
    }

    // Check if user already applied
    const existingApplicationsQuery = db.collection("projects").doc(projectId).collection("applications")
      .where("studentId", "==", userId);

    const existingApplicationsSnapshot = await existingApplicationsQuery.get();

    if (!existingApplicationsSnapshot.empty) {
      throw new Error("You have already applied to this project");
    }

    // Get user data
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    if (!userData) {
      throw new Error("User data is missing");
    }

    // Create application
    const applicationWithDefaults = {
      studentId: userId,
      studentName: `${userData.firstName} ${userData.lastName}`,
      status: "incoming",
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...applicationData,
    };

    const applicationRef = await db
      .collection("projects")
      .doc(projectId)
      .collection("applications")
      .add(applicationWithDefaults);

    // Add project to student's applied projects
    const projectPreferences = userData.projectPreferences || {};
    const appliedProjects = projectPreferences.appliedProjects || [];

    if (!appliedProjects.includes(projectId)) {
      await userRef.update({
        "projectPreferences.appliedProjects": [...appliedProjects, projectId],
        "updatedAt": FieldValue.serverTimestamp(),
      });
    }

    return applicationRef.id;
  } catch (error) {
    console.error("Error applying to project:", error);
    throw error;
  }
};

/**
 * Gets all faculty-managed projects
 * Used by admins to view all projects
 * @returns Array of projects
 */
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      throw new Error("You must be logged in to view all projects");
    }

    const projectsQuery = db.collection("projects");
    const projectsSnapshot = await projectsQuery.get();

    const projects: Project[] = [];

    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        const project = {
          id: doc.id,
          mentorId: data.mentorId,
          status: data.status,
          isActive: data.isActive,
          teamMembers: data.teamMembers,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ...data,
        } as ProjectWithId;
        projects.push(project);
      }
    });

    return projects;
  } catch (error) {
    console.error("Error getting all projects:", error);
    throw error;
  }
};

/**
 * Deletes a project
 * @param projectId - The ID of the project to delete
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId();

    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      throw new Error("Project not found");
    }

    const projectData = projectDoc.data();
    if (!projectData) {
      throw new Error("Project data is missing");
    }

    // Only the project owner or admin can delete it
    const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
    if (projectData.mentorId !== userId && !isAdmin) {
      throw new Error("Unauthorized: You can only delete your own projects");
    }

    // Remove project from user's lists
    const userRef = db.collection("users").doc(projectData.mentorId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      if (!userData) {
        throw new Error("User data is missing");
      }

      const activeProjects = userData.activeProjects || [];
      const archivedProjects = userData.archivedProjects || [];

      const updatedActiveProjects = activeProjects.filter((id: string) => id !== projectId);
      const updatedArchivedProjects = archivedProjects.filter((id: string) => id !== projectId);

      await userRef.update({
        activeProjects: updatedActiveProjects,
        archivedProjects: updatedArchivedProjects,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    // Delete project positions
    const positionsQuery = db.collection("positions")
      .where("projectId", "==", projectId);

    const positionsSnapshot = await positionsQuery.get();

    const deletePositions = positionsSnapshot.docs.map(async (positionDoc) => {
      await positionDoc.ref.delete();
    });

    await Promise.all(deletePositions);

    // Delete project document
    await projectDoc.ref.delete();
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Helper function to get authenticated user ID
const getAuthenticatedUserId = async (): Promise<string> => {
  const auth = getAuth();
  // This should be replaced with actual token from your request context
  const idToken = "YOUR_ID_TOKEN_HERE"; // Replace this with actual token
  const token = await auth.verifyIdToken(idToken);
  if (!token.uid) {
    throw new Error("Not authenticated");
  }
  return token.uid;
};
