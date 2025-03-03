import * as functions from "firebase-functions";
import { db } from "../config/firebase";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { Project } from "../types/project";
import { User } from "../types/user";
import { Application } from "../types/position";

/**
 * Trigger that runs when a new user is created
 * - Creates a welcome notification
 * - Updates university stats if user has a university
 */
export const onUserCreate = functions
  .firestore.document("users/{userId}")
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userData = snapshot.data() as User;

    try {
      // Create welcome notification
      await db.collection("notifications").add({
        userId,
        type: "welcome",
        title: "Welcome to Fruition!",
        message: "Thank you for joining our research-matching platform.",
        read: false,
        createdAt: Timestamp.now(),
      });

      // If user has a university, update university stats
      if (userData.university) {
        const universityRef = db.collection("universities").doc(userData.university);

        // Check if userId is valid before using it in arrayUnion
        if (userId) {
          if (userData.role === "student") {
            await universityRef.update({
              studentCount: FieldValue.increment(1),
              studentIds: FieldValue.arrayUnion(userId),
            });
            console.log(`Added student ${userId} to university ${userData.university}`);
          } else if (userData.role === "faculty") {
            await universityRef.update({
              facultyCount: FieldValue.increment(1),
              facultyIds: FieldValue.arrayUnion(userId),
            });
            console.log(`Added faculty ${userId} to university ${userData.university}`);
          }
        } else {
          console.error("Invalid userId in onUserCreate trigger");
        }
      } else {
        console.log("User has no university assigned");
      }
    } catch (error) {
      console.error("Error in onUserCreate trigger:", error);
    }
  });

/**
 * Trigger that runs when a project is created
 * - Updates department project count
 * - Creates notifications for relevant students
 */
export const onProjectCreate = functions
  .firestore.document("projects/{projectId}")
  .onCreate(async (snapshot, context) => {
    const projectId = context.params.projectId;
    const projectData = snapshot.data() as Project;

    try {
      // Update department project count
      if (projectData.department) {
        await db.collection("departments").doc(projectData.department).update({
          projectCount: FieldValue.increment(1),
        });
      }

      // Get students with matching interests
      // Note: We're using keywords from the project to match with student interests
      const matchingStudents = await db.collection("users")
        .where("role", "==", "student")
        .limit(50)
        .get();

      // Create notifications for matching students with relevant interests
      const batch = db.batch();
      // Extract keywords from project data with proper typing
      const projectKeywords = (projectData as Project & { keywords: string[] }).keywords || [];

      matchingStudents.docs.forEach((doc) => {
        const studentData = doc.data();
        const studentInterests = studentData.interests || [];

        // Check if there's any overlap between project keywords and student interests
        const hasMatchingInterests = projectKeywords.some((keyword: string) =>
          studentInterests.some((interest: string) =>
            interest.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(interest.toLowerCase())
          )
        );

        // Create notification if interests match or if student is in the same department
        if (hasMatchingInterests || studentData.department === projectData.department) {
          const notificationRef = db.collection("notifications").doc();
          batch.set(notificationRef, {
            userId: doc.id,
            type: "new_project",
            title: "New Project Matching Your Interests",
            message: `A new project "${projectData.title}" was posted that matches your interests.`,
            projectId,
            read: false,
            createdAt: Timestamp.now(),
          });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("Error in onProjectCreate trigger:", error);
    }
  });

/**
 * Trigger that runs when an application status changes
 * - Notifies the student
 * - Updates position filled count if accepted
 */
export const onApplicationUpdate = functions
  .firestore.document(
    "projects/{projectId}/positions/{positionId}/applications/{applicationId}"
  )
  .onUpdate(async (change, context) => {
    const { projectId, positionId, applicationId } = context.params;
    const beforeData = change.before.data() as Application;
    const afterData = change.after.data() as Application;

    // Only proceed if status has changed
    if (beforeData.status === afterData.status) {
      return;
    }

    try {
      // Get project and position details
      const projectDoc = await db.collection("projects").doc(projectId).get();
      const positionDoc = await db.collection("projects")
        .doc(projectId)
        .collection("positions")
        .doc(positionId)
        .get();

      if (!projectDoc.exists || !positionDoc.exists) {
        console.error("Project or position not found");
        return;
      }

      const project = projectDoc.data() as Project;

      // Create notification for student
      await db.collection("notifications").add({
        userId: afterData.studentId,
        type: "application_update",
        title: `Application ${afterData.status.charAt(0).toUpperCase() + afterData.status.slice(1)}`,
        message: `Your application for "${project.title}" has been ${afterData.status}.`,
        projectId,
        positionId,
        applicationId,
        read: false,
        createdAt: Timestamp.now(),
      });

      // If application was accepted, add student to project team
      if (afterData.status === "accepted" && beforeData.status !== "accepted") {
        // Get student details
        const studentDoc = await db.collection("users").doc(afterData.studentId).get();

        if (studentDoc.exists) {
          const student = studentDoc.data() as User;

          // Add student to project team
          await db.collection("projects").doc(projectId).update({
            teamMembers: FieldValue.arrayUnion({
              userId: afterData.studentId,
              name: `${student.firstName} ${student.lastName}`,
              title: positionDoc.data()?.title || "Research Assistant",
              joinedDate: Timestamp.now(),
            }),
          });

          // Add project to student's active projects
          await db.collection("users").doc(afterData.studentId).update({
            activeProjects: FieldValue.arrayUnion(projectId),
          });
        }
      }
    } catch (error) {
      console.error("Error in onApplicationUpdate trigger:", error);
    }
  });
