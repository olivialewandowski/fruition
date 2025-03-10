/**
 * Test script for Firestore triggers
 *
 * This script can be run with ts-node to manually test the Firestore triggers.
 * It uses the Firebase emulator, so make sure it's running before executing this script.
 *
 * Usage:
 * 1. Start the Firebase emulator: firebase emulators:start
 * 2. Run this script: npx ts-node src/tests/triggerTest.ts
 * or npx ts-node functions/src/tests/triggerTest.ts
 */

import * as admin from "firebase-admin";
// Import firebase-functions-test with dynamic import to avoid namespace issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const functionsTest = require("firebase-functions-test");
import { TeamMember } from "../types/project";

console.log("Starting Firestore triggers test...");
console.log("Make sure the Firebase emulator is running!");

// Set environment variables for the emulator
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST = "localhost:5001";

// Initialize Firebase Admin SDK
const app = admin.initializeApp({
  projectId: "fruition-test",
});

const db = admin.firestore();

// Initialize Firebase Functions Test SDK for v2
const testEnv = functionsTest({
  projectId: "fruition-test",
});

// Import the triggers
import {
  onUserCreateOrUpdate,
  onProjectCreate,
  onApplicationUpdate,
  onPositionCreate,
  onProjectUpdate,
  onApplicationCreate,
} from "../triggers/firestoreTriggers";

// Sample test data
const testUser = {
  id: "user1",
  email: "test@example.com",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  role: "student",
  major: "Computer Science",
  year: "Junior",
  university: "university1", // Using university consistently
  interests: ["AI", "Machine Learning", "Web Development"],
  projectPreferences: {
    savedProjects: [],
  },
  activeProjects: [],
  createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  lastActive: admin.firestore.Timestamp.fromDate(new Date()),
};

const testFaculty = {
  id: "faculty1",
  email: "faculty@example.com",
  displayName: "Faculty User",
  role: "faculty",
  department: "department1",
  title: "Professor",
  university: "university1", // Using university consistently
  createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  lastActive: admin.firestore.Timestamp.fromDate(new Date()),
};

const testProject = {
  id: "project1",
  title: "Test Project",
  description: "This is a test project for research",
  facultyId: "faculty1",
  mentorId: "faculty1",
  departmentId: "department1",
  department: "department1",
  university: "university1", // Added university field for consistency
  universityId: "university1", // Kept for backward compatibility
  isActive: true,
  status: "active",
  createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  keywords: ["AI", "Machine Learning"],
  teamMembers: [],
};

const testApplication = {
  studentId: testUser.id,
  studentName: "Test User",
  projectId: "project1",
  positionId: "position1",
  interestStatement: "I am very interested in this project because it aligns with my research interests.",
  status: "pending",
  submittedAt: admin.firestore.Timestamp.fromDate(new Date()),
  updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  studentInfo: {
    major: "Computer Science",
    year: "Junior",
  },
};

// Test functions
async function runTests() {
  console.log("Starting trigger tests...");

  try {
    // Clear the database
    await clearDatabase();

    // Set up initial data
    await setupInitialData();

    // Test onUserCreateOrUpdate trigger (replaces onUserCreate)
    await testUserCreateTrigger();

    // Test onProjectCreate trigger
    await testProjectCreateTrigger();

    // Test onPositionCreate trigger
    await testPositionCreateTrigger();

    // Test onProjectUpdate trigger
    await testProjectUpdateTrigger();

    // Test onApplicationCreate trigger
    await testApplicationCreateTrigger();

    // Test onApplicationUpdate trigger
    await testApplicationUpdateTrigger();

    console.log("All trigger tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Clean up
    testEnv.cleanup();
    await app.delete();
  }
}

async function clearDatabase() {
  console.log("Clearing database...");

  const collections = await db.listCollections();
  for (const collection of collections) {
    const snapshot = await db.collection(collection.id).get();
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

async function setupInitialData() {
  console.log("Setting up initial data...");

  // Create university
  await db.collection("universities").doc("university1").set({
    name: "Test University",
    domain: "test.edu",
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
    studentCount: 0,
    facultyCount: 0,
    studentIds: [],
    facultyIds: [],
  });

  // Create department
  await db.collection("departments").doc("department1").set({
    name: "Computer Science",
    description: "CS Department",
    facultyCount: 0,
    projectCount: 0,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  });

  // Create faculty user
  await db.collection("users").doc(testFaculty.id).set(testFaculty);

  // Create position
  await db.collection("projects").doc(testProject.id)
    .collection("positions").doc("position1").set({
      title: "Research Assistant",
      description: "Help with research tasks",
      projectId: testProject.id,
      isOpen: true,
      filledPositions: 0,
      maxPositions: 2,
    });

  // Create some student users with matching interests for notifications test
  await db.collection("users").doc("student2").set({
    email: "student2@example.com",
    displayName: "Student Two",
    firstName: "Student",
    lastName: "Two",
    role: "student",
    department: "department1",
    university: "university1", // Using university consistently
    interests: ["AI", "Machine Learning"],
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    lastActive: admin.firestore.Timestamp.fromDate(new Date()),
  });
}

async function testUserCreateTrigger() {
  console.log("\nTesting onUserCreateOrUpdate trigger...");

  // Create the actual document first
  await db.collection("users").doc(testUser.id).set(testUser);

  // For v2 Firestore triggers, we need to use the v2 test SDK
  // The onDocumentCreated function is called with a single event object
  const wrappedOnUserCreateOrUpdate = testEnv.wrap(onUserCreateOrUpdate);

  // Create the test event with the right structure for v2
  const testDocSnapshot = await db.collection("users").doc(testUser.id).get();
  const testEvent = {
    data: testDocSnapshot,
    params: { userId: testUser.id },
  };

  // Call the function with the event object
  await wrappedOnUserCreateOrUpdate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check that a welcome notification was created
  const notificationsSnapshot = await db.collection("notifications")
    .where("userId", "==", testUser.id)
    .where("type", "==", "welcome")
    .get();

  if (!notificationsSnapshot.empty) {
    console.log("✅ Welcome notification created");
  } else {
    console.error("❌ Welcome notification not created");
    // Check if there are any notifications at all
    const allNotifications = await db.collection("notifications").get();
    console.log("Total notifications:", allNotifications.size);
  }

  // Check that system stats were updated
  const statsDoc = await db.collection("system").doc("stats").get();
  if (statsDoc.exists && statsDoc.data()?.totalUsers > 0) {
    console.log("✅ System stats updated");
  } else {
    console.error("❌ System stats not updated");
  }
}

async function testProjectCreateTrigger() {
  console.log("\nTesting onProjectCreate trigger...");

  // Create the actual document first
  await db.collection("projects").doc(testProject.id).set(testProject);

  // Wrap the function
  const wrappedOnProjectCreate = testEnv.wrap(onProjectCreate);

  // Create the test event with the right structure for v2
  const testDocSnapshot = await db.collection("projects").doc(testProject.id).get();
  const testEvent = {
    data: testDocSnapshot,
    params: { projectId: testProject.id },
  };

  // Call the function with the event object
  await wrappedOnProjectCreate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check that notifications were created for matching students
  // Wait a moment for the notifications to be created
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const notificationsSnapshot = await db.collection("notifications")
    .where("type", "==", "new_project")
    .where("projectId", "==", testProject.id)
    .get();

  if (!notificationsSnapshot.empty) {
    console.log("✅ Project notifications created");
  } else {
    console.error("❌ Project notifications not created");
    // Check if there are any notifications at all
    const allNotifications = await db.collection("notifications").get();
    console.log("Total notifications:", allNotifications.size);

    // Debug: Check if we have students with matching interests
    const students = await db.collection("users")
      .where("role", "==", "student")
      .get();
    console.log("Total students:", students.size);
    students.forEach((doc) => {
      console.log("Student:", doc.id, doc.data().interests);
    });
  }

  // Check that system stats were updated
  const statsDoc = await db.collection("system").doc("stats").get();
  if (statsDoc.exists && statsDoc.data()?.totalProjects > 0) {
    console.log("✅ System stats updated for projects");
  } else {
    console.error("❌ System stats not updated for projects");
  }
}

async function testPositionCreateTrigger() {
  console.log("\nTesting onPositionCreate trigger...");

  // Create a new position
  const positionData = {
    title: "Student Researcher",
    projectId: testProject.id,
    qualifications: "Experience with Python and data analysis",
    hoursPerWeek: 10,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  };

  const positionRef = await db.collection("positions").add(positionData);

  // Wrap the function
  const wrappedOnPositionCreate = testEnv.wrap(onPositionCreate);

  // Create the test event
  const testDocSnapshot = await positionRef.get();
  const testEvent = {
    data: testDocSnapshot,
    params: { positionId: positionRef.id },
  };

  // Call the function
  await wrappedOnPositionCreate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if position count was updated on the project
  const projectDoc = await db.collection("projects").doc(testProject.id).get();
  const projectData = projectDoc.data();

  if (projectData && projectData.positionCount && projectData.positionCount > 0) {
    console.log("✅ Project position count updated");
  } else {
    console.error("❌ Project position count not updated");
  }

  // Check if mainPositionId was set
  if (projectData && projectData.mainPositionId) {
    console.log("✅ Project main position ID set");
  } else {
    console.error("❌ Project main position ID not set");
  }
}

async function testProjectUpdateTrigger() {
  console.log("\nTesting onProjectUpdate trigger...");

  // First get current state
  const projectRef = db.collection("projects").doc(testProject.id);
  const beforeDoc = await projectRef.get();

  // Update the project status
  await projectRef.update({
    status: "archived",
    isActive: false,
  });

  const afterDoc = await projectRef.get();

  // Wrap the function
  const wrappedOnProjectUpdate = testEnv.wrap(onProjectUpdate);

  // Create the test event
  const testEvent = {
    data: {
      before: beforeDoc,
      after: afterDoc,
    },
    params: { projectId: testProject.id },
  };

  // Call the function
  await wrappedOnProjectUpdate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if the project was moved to archived projects for the faculty
  const facultyDoc = await db.collection("users").doc(testFaculty.id).get();
  const facultyData = facultyDoc.data();

  if (facultyData && facultyData.archivedProjects && facultyData.archivedProjects.includes(testProject.id)) {
    console.log("✅ Project moved to faculty's archived projects");
  } else {
    console.error("❌ Project not moved to faculty's archived projects");
  }
}

async function testApplicationCreateTrigger() {
  console.log("\nTesting onApplicationCreate trigger...");

  // Create an application
  const applicationData = {
    ...testApplication,
    status: "incoming", // Use incoming instead of pending
  };

  const applicationRef = await db.collection("applications").add(applicationData);

  // Wrap the function
  const wrappedOnApplicationCreate = testEnv.wrap(onApplicationCreate);

  // Create the test event
  const testDocSnapshot = await applicationRef.get();
  const testEvent = {
    data: testDocSnapshot,
    params: { applicationId: applicationRef.id },
  };

  // Call the function
  await wrappedOnApplicationCreate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if application count was updated on the project
  const projectDoc = await db.collection("projects").doc(testProject.id).get();
  const projectData = projectDoc.data();

  if (projectData && projectData.applicationCount && projectData.applicationCount > 0) {
    console.log("✅ Project application count updated");
  } else {
    console.error("❌ Project application count not updated");
  }

  // Check if notification was created for the mentor
  const notificationsSnapshot = await db.collection("notifications")
    .where("type", "==", "new_application")
    .where("projectId", "==", testProject.id)
    .get();

  if (!notificationsSnapshot.empty) {
    console.log("✅ Mentor notification created for application");
  } else {
    console.error("❌ Mentor notification not created for application");
  }
}

async function testApplicationUpdateTrigger() {
  console.log("\nTesting onApplicationUpdate trigger...");

  // Application path
  const applicationRef = db.collection("applications").doc("application1");

  // Create an application
  await applicationRef.set(testApplication);

  // Get the "before" snapshot
  const beforeSnapshot = await applicationRef.get();

  // Update the application status
  await applicationRef.update({ status: "reviewing" });

  // Get the "after" snapshot
  const afterSnapshot = await applicationRef.get();

  // Wrap the function
  const wrappedOnApplicationUpdate = testEnv.wrap(onApplicationUpdate);

  // Create the test event with the right structure for v2 onDocumentUpdated
  const updateEvent = {
    data: {
      before: beforeSnapshot,
      after: afterSnapshot,
    },
    params: {
      applicationId: "application1",
    },
  };

  // Call the function with the event
  await wrappedOnApplicationUpdate(updateEvent);

  // Check that a notification was created
  const notificationsSnapshot = await db.collection("notifications")
    .where("userId", "==", testUser.id)
    .where("type", "==", "application_update")
    .where("applicationId", "==", "application1")
    .get();

  if (!notificationsSnapshot.empty) {
    console.log("✅ Application update notification created");
  } else {
    console.error("❌ Application update notification not created");
  }

  // Now test with an accepted application
  // Update to accepted status
  await applicationRef.update({ status: "accepted" });

  // Get the new "after" snapshot
  const acceptedSnapshot = await applicationRef.get();

  // Create the update event for accepted status
  const acceptEvent = {
    data: {
      before: afterSnapshot,
      after: acceptedSnapshot,
    },
    params: {
      applicationId: "application1",
    },
  };

  // Call the function with the accept event
  await wrappedOnApplicationUpdate(acceptEvent);

  // Check that the student was added to the project team
  const updatedProjectDoc = await db.collection("projects").doc(testProject.id).get();
  const projectData = updatedProjectDoc.data();

  if (projectData?.teamMembers.some((member: TeamMember) => member.userId === testUser.id)) {
    console.log("✅ Student added to project team");
  } else {
    console.error("❌ Student not added to project team");
  }

  // Check that the project was added to the student's active projects
  const userDoc = await db.collection("users").doc(testUser.id).get();
  const userData = userDoc.data();

  if (userData?.activeProjects && userData.activeProjects.includes(testProject.id)) {
    console.log("✅ Project added to student's active projects");
  } else {
    console.error("❌ Project not added to student's active projects");
  }
}

// Run the tests
runTests().catch(console.error);
