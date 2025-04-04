// src/triggers/firestoreTriggers.ts
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { Project } from "../types/project";
import { User } from "../types/user";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get Firestore instance
const db = admin.firestore();
// Shortcuts for common Firestore operations
const FieldValue = admin.firestore.FieldValue;

/**
 * FIX: Replace serverTimestamp() with a regular Date
 * This fixes the "Cannot read properties of undefined (reading 'now')" error
 */
function getSafeTimestamp() {
  return new Date(); // Using regular Date object instead of serverTimestamp
}

/**
 * Trigger that runs when a new project is created
 * - Creates notifications for relevant students
 * - Updates project counters
 */
export const onProjectCreate = onDocumentCreated("projects/{projectId}", async (event) => {
  const projectId = event.params.projectId;
  const projectData = event.data?.data() as Project | undefined;

  if (!projectData) {
    logger.log("No project data found in event");
    return;
  }

  try {
    logger.log(`Project created: ${projectId} by mentor ${projectData.mentorId}`);

    // Add to project counter in the system stats
    try {
      // Get the stats document
      const statsRef = db.collection("system").doc("stats");
      const statsDoc = await statsRef.get();

      // Use safe timestamp instead of serverTimestamp
      const now = getSafeTimestamp();

      if (statsDoc.exists) {
        // Update existing stats
        await statsRef.update({
          totalProjects: FieldValue.increment(1),
          updatedAt: now,
        });
      } else {
        // Create stats document if it doesn't exist
        await statsRef.set({
          totalProjects: 1,
          totalUsers: 0,
          totalApplications: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
      logger.log("Updated system stats counter");
    } catch (error) {
      logger.error(`Error updating project counter: ${error}`);
    }

    // Create notifications for relevant students
    try {
      // Get students with matching interests
      const matchingStudents = await db.collection("users")
        .where("role", "==", "student")
        .limit(50)
        .get();

      if (matchingStudents.empty) {
        logger.log("No matching students found for notifications");
        return;
      }

      // Create notifications for matching students with relevant interests
      const batch = db.batch();

      // Extract keywords from project data
      const projectKeywords = projectData.keywords || [];
      const projectDepartment = projectData.department || "";

      logger.log(`Project keywords: ${projectKeywords.join(", ")}`);
      logger.log(`Project department: ${projectDepartment}`);

      let notificationCount = 0;
      matchingStudents.docs.forEach((doc) => {
        const studentData = doc.data();
        const studentInterests = studentData.interests || [];

        // Check if there's any overlap between project keywords and student interests
        const hasMatchingInterests = projectKeywords.length === 0 ||
          projectKeywords.some((keyword: string) =>
            studentInterests.some((interest: string) =>
              interest.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(interest.toLowerCase())
            )
          );

        // Create notification if interests match or if student is in the same department
        if (hasMatchingInterests || studentData.department === projectDepartment) {
          const notificationRef = db.collection("notifications").doc();
          batch.set(notificationRef, {
            userId: doc.id,
            type: "new_project",
            title: "New Project Matching Your Interests",
            message: `A new project "${projectData.title}" was posted that matches your interests.`,
            projectId,
            read: false,
            createdAt: getSafeTimestamp(), // Use safe timestamp
            tabContext: "discover", // Add tab context for UI notifications
          });
          notificationCount++;
        }
      });

      if (notificationCount > 0) {
        await batch.commit();
        logger.log(`Created ${notificationCount} notifications for new project`);
      } else {
        logger.log("No relevant notifications to create");
      }
    } catch (notifyError) {
      logger.error(`Error creating notifications: ${notifyError}`);
    }
  } catch (error) {
    logger.error(`Error in onProjectCreate trigger: ${error}`);
  }
});

/**
 * Trigger that runs when a project is updated
 * Handles status changes and other project updates
 */
export const onProjectUpdate = onDocumentUpdated("projects/{projectId}", async (event) => {
  const projectId = event.params.projectId;
  const beforeData = event.data?.before.data() as Project | undefined;
  const afterData = event.data?.after.data() as Project | undefined;

  if (!beforeData || !afterData) {
    logger.log("Missing before or after data in project update event");
    return;
  }

  try {
    logger.log(`Project updated: ${projectId}`);

    // Check if status changed
    if (beforeData.status !== afterData.status) {
      logger.log(`Project status changed from ${beforeData.status} to ${afterData.status}`);

      // Handle status change from active to archived or vice versa
      if (afterData.mentorId) {
        const userRef = db.collection("users").doc(afterData.mentorId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data() as User;

          // Handle archiving
          if (beforeData.status === "active" && afterData.status === "archived") {
            const activeProjects = userData.activeProjects || [];
            const archivedProjects = userData.archivedProjects || [];

            // Remove from active and add to archived
            if (activeProjects.includes(projectId) && !archivedProjects.includes(projectId)) {
              await userRef.update({
                activeProjects: activeProjects.filter((id) => id !== projectId),
                archivedProjects: [...archivedProjects, projectId],
                updatedAt: getSafeTimestamp(), // Use safe timestamp
              });
              logger.log(`Moved project from active to archived for user ${afterData.mentorId}`);
            }
          } else if (beforeData.status === "archived" && afterData.status === "active") {
            // Handle unarchiving
            const activeProjects = userData.activeProjects || [];
            const archivedProjects = userData.archivedProjects || [];

            // Remove from archived and add to active
            if (archivedProjects.includes(projectId) && !activeProjects.includes(projectId)) {
              await userRef.update({
                archivedProjects: archivedProjects.filter((id) => id !== projectId),
                activeProjects: [...activeProjects, projectId],
                updatedAt: getSafeTimestamp(), // Use safe timestamp
              });
              logger.log(`Moved project from archived to active for user ${afterData.mentorId}`);
            }
          }
        }
      }
    }

    // If project title or description changed, update related collections
    if (beforeData.title !== afterData.title || beforeData.description !== afterData.description) {
      logger.log("Project content changed, updating related records");

      // Update positions associated with this project
      const positionsQuery = await db.collection("positions")
        .where("projectId", "==", projectId)
        .get();

      if (!positionsQuery.empty) {
        const batch = db.batch();

        positionsQuery.docs.forEach((positionDoc) => {
          batch.update(positionDoc.ref, {
            projectTitle: afterData.title || "",
            projectDescription: afterData.description || "",
            updatedAt: getSafeTimestamp(), // Use safe timestamp
          });
        });

        await batch.commit();
        logger.log(`Updated ${positionsQuery.size} positions with new project details`);
      }
    }
  } catch (error) {
    logger.error(`Error in onProjectUpdate trigger: ${error}`);
  }
});

/**
 * Trigger that runs when a position is created
 * Updates related project metadata and notifies relevant students
 */
export const onPositionCreate = onDocumentCreated("positions/{positionId}", async (event) => {
  const positionId = event.params.positionId;
  const positionData = event.data?.data();

  if (!positionData) {
    logger.log("No position data found in event");
    return;
  }

  try {
    logger.log(`Position created: ${positionId} for project ${positionData.projectId}`);

    // Increment position count on the project
    if (positionData.projectId) {
      const projectRef = db.collection("projects").doc(positionData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data() as Project;

        // Use safe timestamp
        const now = getSafeTimestamp();

        // Update position count
        const updateData: Record<string, unknown> = {
          updatedAt: now,
        };

        // Add positionCount field if it doesn't exist or increment it
        if (typeof projectData.positionCount !== "number") {
          updateData.positionCount = 1;
        } else {
          updateData.positionCount = FieldValue.increment(1);
        }

        await projectRef.update(updateData);
        logger.log(`Updated position count for project ${positionData.projectId}`);

        // If this is the first position, update the project with position details
        if (!projectData.positionCount || projectData.positionCount === 0) {
          await projectRef.update({
            mainPositionId: positionId,
            updatedAt: now,
          });
          logger.log(`Set main position ID for project ${positionData.projectId}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Error in onPositionCreate trigger: ${error}`);
  }
});

/**
 * Trigger that runs when a user is created or updated
 * Sets default values and ensures consistency
 */
export const onUserCreateOrUpdate = onDocumentCreated("users/{userId}", async (event) => {
  const userId = event.params.userId;
  const userData = event.data?.data() as User | undefined;

  if (!userData) {
    logger.log("No user data found in event");
    return;
  }

  try {
    logger.log(`User document created or updated: ${userId}`);

    // Set default values if not present
    const updates: Record<string, unknown> = {};
    let needsUpdate = false;

    // Use safe timestamp
    const now = getSafeTimestamp();

    if (!userData.createdAt) {
      updates.createdAt = now;
      needsUpdate = true;
    }

    updates.updatedAt = now;
    needsUpdate = true;

    if (!userData.role) {
      // Determine default role based on email domain
      if (userData.email && userData.email.endsWith(".edu")) {
        updates.role = "faculty";
      } else {
        updates.role = "student";
      }
      needsUpdate = true;
    }

    if (!userData.activeProjects) {
      updates.activeProjects = [];
      needsUpdate = true;
    }

    if (!userData.archivedProjects) {
      updates.archivedProjects = [];
      needsUpdate = true;
    }

    // Only update if needed
    if (needsUpdate) {
      await db.collection("users").doc(userId).update(updates);
      logger.log(`Updated user ${userId} with default values`);
    }

    // Create welcome notification
    const notificationRef = db.collection("notifications").doc();
    await notificationRef.set({
      userId,
      type: "welcome",
      title: "Welcome to Fruition!",
      message: "Thank you for joining our research-matching platform.",
      read: false,
      createdAt: now,
      tabContext: "dashboard", // Add tab context for UI notifications
    });
    logger.log(`Created welcome notification for user ${userId}`);

    // Update system stats
    try {
      const statsRef = db.collection("system").doc("stats");
      const statsDoc = await statsRef.get();

      if (statsDoc.exists) {
        await statsRef.update({
          totalUsers: FieldValue.increment(1),
          updatedAt: now,
        });
      } else {
        await statsRef.set({
          totalProjects: 0,
          totalUsers: 1,
          totalApplications: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
      logger.log("Updated user count in system stats");
    } catch (statsError) {
      logger.error(`Error updating user count in stats: ${statsError}`);
    }
  } catch (error) {
    logger.error(`Error in onUserCreateOrUpdate trigger: ${error}`);
  }
});

/**
 * Trigger that runs when an application is created
 * Updates project application counts and creates notifications
 */
export const onApplicationCreate = onDocumentCreated("applications/{applicationId}", async (event) => {
  const applicationId = event.params.applicationId;
  const applicationData = event.data?.data();

  if (!applicationData) {
    logger.log("No application data found in event");
    return;
  }

  try {
    logger.log(`Application created: ${applicationId} for project ${applicationData.projectId}`);

    // Use safe timestamp
    const now = getSafeTimestamp();

    // Update application count on the project
    if (applicationData.projectId) {
      const projectRef = db.collection("projects").doc(applicationData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data() as Project;

        // Update application count
        const updateData: Record<string, unknown> = {
          updatedAt: now,
        };

        // Add applicationCount field if it doesn't exist or increment it
        if (typeof projectData.applicationCount !== "number") {
          updateData.applicationCount = 1;
        } else {
          updateData.applicationCount = FieldValue.increment(1);
        }

        await projectRef.update(updateData);
        logger.log(`Updated application count for project ${applicationData.projectId}`);
      }
    }

    // Update the user's applied projects in multiple places for redundancy
    if (applicationData.studentId && applicationData.projectId) {
      try {
        // Update in users collection
        const userRef = db.collection("users").doc(applicationData.studentId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          // Update appliedProjects array
          await userRef.update({
            appliedProjects: FieldValue.arrayUnion(applicationData.projectId),
            updatedAt: now,
          });

          // Update projectPreferences.appliedProjects if it exists
          const userData = userDoc.data() || {};
          if (userData.projectPreferences) {
            await userRef.update({
              "projectPreferences.appliedProjects": FieldValue.arrayUnion(applicationData.projectId),
              "updatedAt": now,
            });
          } else {
            // Create projectPreferences if it doesn't exist
            await userRef.update({
              projectPreferences: {
                appliedProjects: [applicationData.projectId],
                savedProjects: [],
                rejectedProjects: [],
              },
              updatedAt: now,
            });
          }

          logger.log(`Updated user's applied projects: ${applicationData.studentId}`);
        }

        // Also update in userData collection for redundancy
        const userDataRef = db.collection("userData").doc(applicationData.studentId);
        const userDataDoc = await userDataRef.get();

        if (userDataDoc.exists) {
          await userDataRef.update({
            appliedProjects: FieldValue.arrayUnion(applicationData.projectId),
            updatedAt: now,
          });
        } else {
          // Create userData document if it doesn't exist
          await userDataRef.set({
            userId: applicationData.studentId,
            appliedProjects: [applicationData.projectId],
            createdAt: now,
            updatedAt: now,
          });
        }

        logger.log(`Updated userData's applied projects: ${applicationData.studentId}`);
      } catch (userError) {
        logger.error(`Error updating user's applied projects: ${userError}`);
      }
    }

    // Create notification for project owner
    if (applicationData.projectId && applicationData.studentId) {
      // Get project details
      const projectRef = db.collection("projects").doc(applicationData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data() as Project;
        const mentorId = projectData.mentorId;

        if (mentorId) {
          // Get student details
          const studentRef = db.collection("users").doc(applicationData.studentId);
          const studentDoc = await studentRef.get();

          if (studentDoc.exists) {
            const studentData = studentDoc.data() as User;
            const studentName = `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim();

            // Create notification for mentor
            const notificationRef = db.collection("notifications").doc();
            await notificationRef.set({
              userId: mentorId,
              type: "new_application",
              title: "New Application",
              message: `${studentName} has applied to your project "${projectData.title}".`,
              projectId: applicationData.projectId,
              applicationId,
              studentId: applicationData.studentId,
              read: false,
              createdAt: now,
              tabContext: "applications", // Add tab context for UI notifications
            });
            logger.log(`Created notification for mentor ${mentorId}`);
          }
        }
      }
    }

    // Create notification for student
    if (applicationData.studentId && applicationData.projectId) {
      // Get project details
      const projectRef = db.collection("projects").doc(applicationData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data() as Project;

        // Create notification for student
        const notificationRef = db.collection("notifications").doc();
        await notificationRef.set({
          userId: applicationData.studentId,
          type: "application_submitted",
          title: "Application Submitted",
          message: `Your application for "${projectData.title}" has been submitted successfully.`,
          projectId: applicationData.projectId,
          applicationId,
          read: false,
          createdAt: now,
          tabContext: "applied", // Add tab context for UI notifications
        });
        logger.log(`Created notification for student ${applicationData.studentId}`);
      }
    }

    // Update system stats
    try {
      const statsRef = db.collection("system").doc("stats");
      await statsRef.update({
        totalApplications: FieldValue.increment(1),
        updatedAt: now,
      });
      logger.log("Updated application count in system stats");
    } catch (statsError) {
      logger.error(`Error updating application count in stats: ${statsError}`);
    }
  } catch (error) {
    logger.error(`Error in onApplicationCreate trigger: ${error}`);
  }
});

/**
 * Trigger that runs when an application status changes
 * Notifies the student and updates related records
 */
export const onApplicationUpdate = onDocumentUpdated("applications/{applicationId}", async (event) => {
  const applicationId = event.params.applicationId;
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!beforeData || !afterData) {
    logger.log("Missing before or after data in application update event");
    return;
  }

  // Only proceed if status has changed
  if (beforeData.status === afterData.status) {
    return;
  }

  try {
    logger.log(
      `Application status changed from ${beforeData.status} to ${afterData.status} for ${applicationId}`
    );

    // Use safe timestamp
    const now = getSafeTimestamp();

    // Create notification for student
    if (afterData.studentId && afterData.projectId) {
      // Get project details
      const projectRef = db.collection("projects").doc(afterData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data() as Project;

        // Generate appropriate message based on status
        let message = "";
        let notificationType = "application_update";

        switch (afterData.status) {
        case "accepted":
          message = `Your application for "${projectData.title}" has been accepted! 
          You can now proceed with the next steps.`;
          notificationType = "application_accepted";
          break;
        case "rejected":
          message = `Your application for "${projectData.title}" was not selected at this time.`;
          notificationType = "application_rejected";
          break;
        case "hired":
          message = `Congratulations! You've been hired for "${projectData.title}"!`;
          notificationType = "application_hired";
          break;
        default:
          message = `Your application for "${projectData.title}" status has been updated to ${afterData.status}.`;
        }

        // Create notification
        const notificationRef = db.collection("notifications").doc();
        await notificationRef.set({
          userId: afterData.studentId,
          type: notificationType,
          title: `Application ${afterData.status.charAt(0).toUpperCase() + afterData.status.slice(1)}`,
          message: message,
          projectId: afterData.projectId,
          applicationId,
          read: false,
          createdAt: now,
          tabContext: "applied", // Add tab context for UI notifications
        });
        logger.log(`Created notification for student ${afterData.studentId}`);

        // If application was accepted, add student to project team
        if (afterData.status === "accepted" && beforeData.status !== "accepted") {
          // Get student details
          const studentRef = db.collection("users").doc(afterData.studentId);
          const studentDoc = await studentRef.get();

          if (studentDoc.exists) {
            const studentData = studentDoc.data() as User;
            const studentName = `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim();

            // Add to project team members
            const teamMember = {
              userId: afterData.studentId,
              name: studentName,
              role: afterData.positionTitle || "Team Member",
              joinedAt: now,
            };

            // Update project
            await projectRef.update({
              teamMembers: FieldValue.arrayUnion(teamMember),
              updatedAt: now,
            });
            logger.log(`Added student ${afterData.studentId} to project team`);

            // Add project to student's active projects
            await studentRef.update({
              activeProjects: FieldValue.arrayUnion(afterData.projectId),
              updatedAt: now,
            });
            logger.log("Added project to student's active projects");
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Error in onApplicationUpdate trigger: ${error}`);
  }
});
