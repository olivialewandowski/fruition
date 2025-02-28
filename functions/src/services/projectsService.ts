// src/services/projectsService.ts
import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { Project, ProjectWithId } from "../types/project";
import { Application, OnboardingMaterial } from "../types/position";
import { hasPermission } from "../models/permissions";
import { PROJECT_PERMISSIONS, CONNECT_PERMISSIONS } from "../types/permissions";

// Type for update data to improve type safety
type UpdateData = {
  status: string;
  updatedAt: string;
  notes?: string;
};

// Type for team member addition
type TeamMemberUpdate = {
  userId: string;
  name: string;
  title: string;
  joinedDate: string;
};

/**
 * Creates a new project
 * @param userId - The ID of the user creating the project
 * @param projectData - The project data to save
 * @returns The ID of the created project
 */
export async function createProject(userId: string, projectData: Partial<Project>): Promise<string> {
  // check permission
  const canCreate = await hasPermission(userId, PROJECT_PERMISSIONS.CREATE_PROJECT);
  if (!canCreate) {
    throw new Error("Unauthorized: You don't have permission to create projects");
  }

  const now = new Date().toISOString();

  const projectRef = await db.collection("projects").add({
    ...projectData,
    mentorId: userId,
    createdAt: now,
    updatedAt: now,
    status: projectData.status || "draft",
    isActive: projectData.status === "active" ? true : false,
    teamMembers: projectData.teamMembers || [],
  });

  // add the project to the user's active projects
  await db.collection("users").doc(userId).update({
    activeProjects: admin.firestore.FieldValue.arrayUnion(projectRef.id),
    updatedAt: now,
  });

  return projectRef.id;
}

/**
 * Updates an existing project
 * @param userId - The ID of the user updating the project
 * @param projectId - The ID of the project to update
 * @param projectData - The updated project data
 */
export async function updateProject(
  userId: string,
  projectId: string,
  projectData: Partial<Project>
): Promise<void> {
  // check permission
  const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
  if (!canEdit) {
    throw new Error("Unauthorized: You don't have permission to edit projects");
  }

  // get the project to check ownership
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectInfo = projectDoc.data();
  if (!projectInfo) {
    throw new Error("Project data is empty");
  }

  // only the project mentor or an admin can edit the project
  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
  if (projectInfo.mentorId !== userId && !isAdmin) {
    throw new Error("Unauthorized: You can only edit your own projects");
  }

  const now = new Date().toISOString();

  // handle status changes
  let isActive = projectInfo.isActive || false;
  if (projectData.status) {
    isActive = projectData.status === "active";
  }

  await db.collection("projects").doc(projectId).update({
    ...projectData,
    isActive,
    updatedAt: now,
  });

  // if status changed to "archived", move from active to archived projects for the mentor
  if (projectData.status === "archived" && projectInfo.status !== "archived") {
    await db.collection("users").doc(projectInfo.mentorId).update({
      activeProjects: admin.firestore.FieldValue.arrayRemove(projectId),
      archivedProjects: admin.firestore.FieldValue.arrayUnion(projectId),
      updatedAt: now,
    });
  }

  // if status changed from "archived" to "active", move from archived to active projects
  if (projectData.status === "active" && projectInfo.status === "archived") {
    await db.collection("users").doc(projectInfo.mentorId).update({
      activeProjects: admin.firestore.FieldValue.arrayUnion(projectId),
      archivedProjects: admin.firestore.FieldValue.arrayRemove(projectId),
      updatedAt: now,
    });
  }
}

/**
 * Gets a project by ID
 * @param userId - The ID of the user requesting the project
 * @param projectId - The ID of the project to retrieve
 * @returns The project data
 */
export async function getProjectById(userId: string, projectId: string): Promise<ProjectWithId> {
  // check permission
  const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
  if (!canView) {
    throw new Error("Unauthorized: You don't have permission to view projects");
  }

  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  return {
    id: projectDoc.id,
    ...projectData,
  } as ProjectWithId;
}

/**
 * Gets all projects for the current user
 * @param userId - The ID of the user
 * @param status - Optional status filter ("active", "archived", "draft")
 * @returns Array of projects
 */
export async function getUserProjects(
  userId: string,
  status?: "active" | "archived" | "draft"
): Promise<ProjectWithId[]> {
  // check permission
  const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
  if (!canView) {
    throw new Error("Unauthorized: You don't have permission to view projects");
  }

  // get user document to retrieve project IDs
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User data is empty");
  }

  // determine which project list to use based on status
  let projectIds: string[] = [];

  if (status === "archived") {
    projectIds = userData.archivedProjects || [];
  } else {
    // default to active projects
    projectIds = userData.activeProjects || [];

    // for faculty, also get projects where they are the mentor
    if (userData.role === "faculty" || userData.role === "admin") {
      const mentorProjectsQuery = await db.collection("projects")
        .where("mentorId", "==", userId)
        .where("status", "==", status || "active")
        .get();

      const mentorProjectIds = mentorProjectsQuery.docs.map((doc) => doc.id);
      projectIds = [...new Set([...projectIds, ...mentorProjectIds])];
    }

    // for students, also include projects they applied to if needed
    if (userData.role === "student" && status === undefined) {
      // Only add applied projects if they're explicitly requested or showing all projects
      const appliedProjects = userData.projectPreferences?.appliedProjects || [];
      projectIds = [...new Set([...projectIds, ...appliedProjects])];
    }
  }

  // if no project IDs, return empty array
  if (projectIds.length === 0) {
    return [];
  }

  // get projects in batches (Firestore limits "in" queries to 10 items)
  const projects: ProjectWithId[] = [];

  // process in batches of 10
  for (let i = 0; i < projectIds.length; i += 10) {
    const batch = projectIds.slice(i, i + 10);

    const projectsQuery = await db.collection("projects")
      .where(admin.firestore.FieldPath.documentId(), "in", batch)
      .get();

    projectsQuery.docs.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        ...data,
      } as ProjectWithId);
    });
  }

  return projects;
}

/**
 * Gets all applications for a project
 * @param userId - The ID of the user requesting applications
 * @param projectId - The ID of the project
 * @returns Array of applications
 */
export async function getProjectApplications(
  userId: string,
  projectId: string
): Promise<Application[]> {
  // check permission
  const canManage = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
  if (!canManage) {
    throw new Error("Unauthorized: You don't have permission to view applications");
  }

  // check if user is the project mentor or an admin
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);

  if (projectData.mentorId !== userId && !isAdmin) {
    throw new Error("Unauthorized: You can only view applications for your own projects");
  }

  // get all applications for the project
  const applicationsSnapshot = await db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .get();

  const applications: Application[] = [];

  applicationsSnapshot.forEach((doc) => {
    const appData = doc.data();
    applications.push({
      id: doc.id,
      ...appData,
    } as unknown as Application);
  });

  return applications;
}

/**
 * Updates an application status
 * @param userId - The ID of the user updating the application
 * @param projectId - The ID of the project
 * @param applicationId - The ID of the application
 * @param status - The new status
 * @param notes - Optional notes about the status change
 */
export async function updateApplicationStatus(
  userId: string,
  projectId: string,
  applicationId: string,
  status: "incoming" | "pending" | "interviewing" | "accepted" | "rejected",
  notes?: string
): Promise<void> {
  // check permission
  const canManage = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
  if (!canManage) {
    throw new Error("Unauthorized: You don't have permission to manage applications");
  }

  // check if user is the project mentor or an admin
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);

  if (projectData.mentorId !== userId && !isAdmin) {
    throw new Error("Unauthorized: You can only manage applications for your own projects");
  }

  // update the application status
  const applicationRef = db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .doc(applicationId);

  const applicationDoc = await applicationRef.get();

  if (!applicationDoc.exists) {
    throw new Error("Application not found");
  }

  const now = new Date().toISOString();
  const updateData: UpdateData = {
    status,
    updatedAt: now,
  };

  if (notes) {
    updateData.notes = notes;
  }

  await applicationRef.update(updateData);

  // if status is "accepted", add the student to the project team
  if (status === "accepted") {
    const applicationData = applicationDoc.data();
    if (!applicationData) {
      throw new Error("Application data is empty");
    }

    const studentId = applicationData.studentId;

    if (studentId) {
      // get student information
      const studentDoc = await db.collection("users").doc(studentId).get();

      if (studentDoc.exists) {
        const studentData = studentDoc.data();
        if (!studentData) {
          throw new Error("Student data is empty");
        }

        // add student to project team members
        const teamMemberUpdate: TeamMemberUpdate = {
          userId: studentId,
          name: `${studentData.firstName} ${studentData.lastName}`,
          title: "Research Assistant", // Default title
          joinedDate: now,
        };

        await db.collection("projects").doc(projectId).update({
          teamMembers: admin.firestore.FieldValue.arrayUnion(teamMemberUpdate),
          updatedAt: now,
        });

        // add project to student's active projects
        await db.collection("users").doc(studentId).update({
          activeProjects: admin.firestore.FieldValue.arrayUnion(projectId),
          updatedAt: now,
        });
      }
    }
  }
}

/**
 * Adds onboarding material to a project
 * @param userId - The ID of the user adding the material
 * @param projectId - The ID of the project
 * @param material - The onboarding material to add
 * @returns The ID of the created material
 */
export async function addOnboardingMaterial(
  userId: string,
  projectId: string,
  material: Partial<OnboardingMaterial>
): Promise<string> {
  // check permission
  const canEdit = await hasPermission(userId, PROJECT_PERMISSIONS.EDIT_PROJECT);
  if (!canEdit) {
    throw new Error("Unauthorized: You don't have permission to edit projects");
  }

  // check if user is the project mentor or an admin
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);

  if (projectData.mentorId !== userId && !isAdmin) {
    throw new Error("Unauthorized: You can only add materials to your own projects");
  }

  const now = new Date().toISOString();

  // create the onboarding material
  const materialRef = await db.collection("projects")
    .doc(projectId)
    .collection("onboardingMaterials")
    .add({
      ...material,
      uploadedAt: now,
      uploadedBy: userId,
    });

  return materialRef.id;
}

/**
 * Gets all onboarding materials for a project
 * @param userId - The ID of the user requesting materials
 * @param projectId - The ID of the project
 * @returns Array of onboarding materials
 */
export async function getOnboardingMaterials(
  userId: string,
  projectId: string
): Promise<OnboardingMaterial[]> {
  // check permission (only need view_projects to see materials)
  const canView = await hasPermission(userId, PROJECT_PERMISSIONS.VIEW_APPLICATIONS);
  if (!canView) {
    throw new Error("Unauthorized: You don't have permission to view projects");
  }

  // verify project exists
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  // get onboarding materials
  const materialsSnapshot = await db.collection("projects")
    .doc(projectId)
    .collection("onboardingMaterials")
    .get();

  const materials: OnboardingMaterial[] = [];

  materialsSnapshot.forEach((doc) => {
    const materialData = doc.data();
    materials.push({
      id: doc.id,
      ...materialData,
    } as unknown as OnboardingMaterial);
  });

  return materials;
}

/**
 * Applies to a project
 * @param userId - The ID of the student applying
 * @param projectId - The ID of the project
 * @param applicationData - The application data
 * @returns The ID of the created application
 */
export async function applyToProject(
  userId: string,
  projectId: string,
  applicationData: Partial<Application>
): Promise<string> {
  // check permission
  const canApply = await hasPermission(userId, CONNECT_PERMISSIONS.APPLY_TO_PROJECTS);
  if (!canApply) {
    throw new Error("Unauthorized: You don't have permission to apply to projects");
  }

  // verify project exists and is accepting applications
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error("Project data is empty");
  }

  // if project is active
  if (projectData.status !== "active") {
    throw new Error("Cannot apply to inactive project");
  }

  // if applications are closed
  if (!projectData.rollingApplications) {
    const closeDate = projectData.applicationCloseDate?.toDate();

    if (closeDate && closeDate < new Date()) {
      throw new Error("Applications for this project are closed");
    }
  }

  // if user already applied
  const existingApplicationsQuery = await db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .where("studentId", "==", userId)
    .get();

  if (!existingApplicationsQuery.empty) {
    throw new Error("You have already applied to this project");
  }

  // user data
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User data is empty");
  }

  // create application
  const now = new Date().toISOString();

  const applicationRef = await db.collection("projects")
    .doc(projectId)
    .collection("applications")
    .add({
      studentId: userId,
      studentName: `${userData.firstName} ${userData.lastName}`,
      status: "incoming",
      submittedAt: now,
      updatedAt: now,
      ...applicationData,
    });

  // add project to student's applied projects
  await db.collection("users").doc(userId).update({
    "projectPreferences.appliedProjects": admin.firestore.FieldValue.arrayUnion(projectId),
    "updatedAt": now,
  });

  return applicationRef.id;
}

/**
 * Gets all faculty-managed projects
 * Used by admins to view all projects
 * @param userId - The ID of the user requesting projects
 * @returns Array of projects
 */
export async function getAllProjects(userId: string): Promise<ProjectWithId[]> {
  // check permission - admin only
  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const projectsSnapshot = await db.collection("projects").get();

  const projects: ProjectWithId[] = [];

  projectsSnapshot.forEach((doc) => {
    const data = doc.data();
    projects.push({
      id: doc.id,
      ...data,
    } as ProjectWithId);
  });

  return projects;
}

/**
 * Deletes a project
 * @param userId - The ID of the user deleting the project
 * @param projectId - The ID of the project to delete
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  // check permission
  const canDelete = await hasPermission(userId, PROJECT_PERMISSIONS.DELETE_PROJECT);
  if (!canDelete) {
    throw new Error("Unauthorized: You don't have permission to delete projects");
  }

  // get the project to check ownership
  const projectDoc = await db.collection("projects").doc(projectId).get();

  if (!projectDoc.exists) {
    throw new Error("Project not found");
  }

  const projectInfo = projectDoc.data();
  if (!projectInfo) {
    throw new Error("Project data is empty");
  }

  // only the project mentor or an admin can delete the project
  const isAdmin = await hasPermission(userId, PROJECT_PERMISSIONS.MANAGE_APPLICATIONS);
  if (projectInfo.mentorId !== userId && !isAdmin) {
    throw new Error("Unauthorized: You can only delete your own projects");
  }

  // remove project from user's lists
  await db.collection("users").doc(projectInfo.mentorId).update({
    activeProjects: admin.firestore.FieldValue.arrayRemove(projectId),
    archivedProjects: admin.firestore.FieldValue.arrayRemove(projectId),
    updatedAt: new Date().toISOString(),
  });

  // delete project document
  await db.collection("projects").doc(projectId).delete();
}
