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
  onUserCreate,
  onProjectCreate,
  onApplicationUpdate,
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
  university: "university1",
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
  university: "university1",
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
  universityId: "university1",
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

    // Test onUserCreate trigger
    await testUserCreateTrigger();

    // Test onProjectCreate trigger
    await testProjectCreateTrigger();

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
    university: "university1",
    interests: ["AI", "Machine Learning"],
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    lastActive: admin.firestore.Timestamp.fromDate(new Date()),
  });
}

async function testUserCreateTrigger() {
  console.log("\nTesting onUserCreate trigger...");

  // Create the actual document first
  await db.collection("users").doc(testUser.id).set(testUser);

  // For v2 Firestore triggers, we need to use the v2 test SDK
  // The onDocumentCreated function is called with a single event object
  const wrappedOnUserCreate = testEnv.wrap(onUserCreate);

  // Create the test event with the right structure for v2
  const testDocSnapshot = await db.collection("users").doc(testUser.id).get();
  const testEvent = {
    data: testDocSnapshot,
    params: { userId: testUser.id },
  };

  // Call the function with the event object
  await wrappedOnUserCreate(testEvent);

  // Wait a moment for async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check that the university was updated
  const universityDoc = await db.collection("universities").doc("university1").get();
  const universityData = universityDoc.data();

  if (universityData?.studentCount === 1 && universityData?.studentIds.includes(testUser.id)) {
    console.log("✅ University student count updated");
  } else {
    console.error("❌ University student count not updated");
    console.log("University data:", universityData);
  }

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

  // Check that the department project count was updated
  const departmentDoc = await db.collection("departments").doc("department1").get();
  const departmentData = departmentDoc.data();

  if (departmentData?.projectCount === 1) {
    console.log("✅ Department project count updated");
  } else {
    console.error("❌ Department project count not updated");
    console.log("Department data:", departmentData);
  }

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
}

async function testApplicationUpdateTrigger() {
  console.log("\nTesting onApplicationUpdate trigger...");

  // Application path
  const applicationRef = db.collection("projects")
    .doc(testProject.id)
    .collection("positions")
    .doc("position1")
    .collection("applications")
    .doc("application1");

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
      projectId: testProject.id,
      positionId: "position1",
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
      projectId: testProject.id,
      positionId: "position1",
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
