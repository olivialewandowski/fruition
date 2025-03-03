import * as admin from "firebase-admin";
import * as firebaseTesting from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { DocumentData } from "firebase-admin/firestore";
import {
  addToArray,
  removeFromArray,
  addUserToProjectTeam,
  removeUserFromProjectTeam,
  saveProjectForStudent,
  removeSavedProjectForStudent,
} from "../utils/firestoreArrays";
import {
  BatchManager,
  createBatchManager,
  deleteCollection,
  migrateCollection,
} from "../utils/firestoreBatch";
import {
  updateProjectApplicationCount,
  updateApplicationStatus,
  transferPosition,
  runTransaction,
  createApplication,
} from "../utils/firestoreTransactions";
import {
  validateUser,
  validateProject,
  validateApplication,
  validateDepartment,
  validateUniversity,
  sanitizeInput,
  validateAndSanitize,
} from "../utils/firestoreValidation";
import {
  getAllActiveProjectsWithPositions,
  getProjectsMatchingStudentInterests,
  getStudentApplicationProjects,
  getStudentSavedProjects,
  getFacultyProjectsWithApplications,
  searchProjects,
  getUniversityStats,
} from "../utils/firestoreQueries";

// Add these interfaces at the top of the file
interface TeamMember {
  userId: string;
  name: string;
  title: string;
  joinedDate: admin.firestore.Timestamp;
}

interface MigrationDoc {
  value: number;
  migrated?: boolean;
}

// Test project ID for Firebase emulator
const PROJECT_ID = "fruition-test";

// Initialize the Firebase Testing Environment
let testEnv: firebaseTesting.RulesTestEnvironment;
let adminApp: admin.app.App;
let adminDb: admin.firestore.Firestore;

// Mock the Firebase Admin SDK for unit tests
jest.mock("../config/firebase", () => {
  return {
    get db() {
      return adminDb;
    },
  };
});

// Sample test data
const testUser = {
  id: "user1",
  email: "test@example.com",
  displayName: "Test User",
  role: "student",
  major: "Computer Science",
  year: "Junior",
  university: "university1",
  interests: ["AI", "Machine Learning", "Web Development"],
  projectPreferences: {
    savedProjects: [],
  },
};

const testFaculty = {
  id: "faculty1",
  email: "faculty@example.com",
  displayName: "Faculty User",
  role: "faculty",
  department: "department1",
  title: "Professor",
  university: "university1",
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
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
  keywords: ["AI", "Machine Learning"],
  teamMembers: [],
};

const testPosition = {
  id: "position1",
  title: "Research Assistant",
  description: "Help with research tasks",
  projectId: "project1",
  isOpen: true,
  filledPositions: 0,
  maxPositions: 2,
};

const testApplication = {
  studentId: "user1",
  studentName: "Test User",
  projectId: "project1",
  positionId: "position1",
  interestStatement: "I am very interested in this project because it aligns with my research interests.",
  status: "pending",
  submittedAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
  studentInfo: {
    major: "Computer Science",
    year: "Junior",
  },
};

// Setup and teardown functions
beforeAll(async () => {
  // Initialize the testing environment
  testEnv = await firebaseTesting.initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8"),
    },
  });

  // Initialize admin app
  adminApp = admin.initializeApp({
    projectId: PROJECT_ID,
  }, "admin-app");

  adminDb = adminApp.firestore();

  // Set the admin database to use the emulator
  adminDb.settings({
    host: "localhost:8080",
    ssl: false,
  });
});

afterAll(async () => {
  // Add a small delay to ensure all operations are complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Clean up the testing environment
  await testEnv.cleanup();

  // Clean up the admin app
  await adminApp.delete();

  // Close any remaining connections
  await new Promise((resolve) => setTimeout(resolve, 500));
});

beforeEach(async () => {
  // Clear the database before each test
  await testEnv.clearFirestore();

  // Set up initial test data
  await adminDb.collection("users").doc(testUser.id).set(testUser);
  await adminDb.collection("users").doc(testFaculty.id).set(testFaculty);
  await adminDb.collection("projects").doc(testProject.id).set(testProject);
  await adminDb.collection("projects").doc(testProject.id)
    .collection("positions").doc(testPosition.id).set(testPosition);
  await adminDb.collection("universities").doc("university1").set({
    name: "Test University",
    domain: "test.edu",
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    studentCount: 1,
    facultyCount: 1,
  });
  await adminDb.collection("universities").doc("university1")
    .collection("departments").doc("department1").set({
      name: "Computer Science",
      description: "CS Department",
      facultyCount: 1,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
});

// Tests for firestoreArrays.ts
describe("Firestore Array Operations", () => {
  test("addToArray should add an item to an array field", async () => {
    await addToArray("users", testUser.id, "interests", "Data Science");

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.interests).toContain("Data Science");
  });

  test("removeFromArray should remove an item from an array field", async () => {
    await removeFromArray("users", testUser.id, "interests", "AI");

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.interests).not.toContain("AI");
  });

  test("addUserToProjectTeam should add a user to project team members", async () => {
    await addUserToProjectTeam(
      testProject.id,
      testUser.id,
      {
        name: "Test User",
        title: "Research Assistant",
        joinedDate: admin.firestore.Timestamp.now(),
      }
    );

    const projectDoc = await adminDb.collection("projects").doc(testProject.id).get();
    const projectData = projectDoc.data();

    expect(projectData?.teamMembers.some((member: TeamMember) => member.userId === testUser.id)).toBe(true);

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.activeProjects).toContain(testProject.id);
  });

  test("removeUserFromProjectTeam should remove a user from project team members", async () => {
    // First add the user
    await addUserToProjectTeam(
      testProject.id,
      testUser.id,
      {
        name: "Test User",
        title: "Research Assistant",
        joinedDate: admin.firestore.Timestamp.now(),
      }
    );

    // Then remove them
    await removeUserFromProjectTeam(testProject.id, testUser.id);

    const projectDoc = await adminDb.collection("projects").doc(testProject.id).get();
    const projectData = projectDoc.data();

    expect(projectData?.teamMembers.some((member: TeamMember) => member.userId === testUser.id)).toBe(false);

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.activeProjects).not.toContain(testProject.id);
  });

  test("saveProjectForStudent should save a project for a student", async () => {
    await saveProjectForStudent(testUser.id, testProject.id);

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.projectPreferences.savedProjects).toContain(testProject.id);

    // Check that a user action was created
    const actionsSnapshot = await adminDb.collection("userActions")
      .where("userId", "==", testUser.id)
      .where("projectId", "==", testProject.id)
      .where("action", "==", "save")
      .get();

    expect(actionsSnapshot.empty).toBe(false);
  });

  test("removeSavedProjectForStudent should remove a saved project for a student", async () => {
    // First save the project
    await saveProjectForStudent(testUser.id, testProject.id);

    // Then remove it
    await removeSavedProjectForStudent(testUser.id, testProject.id);

    const userDoc = await adminDb.collection("users").doc(testUser.id).get();
    const userData = userDoc.data();

    expect(userData?.projectPreferences.savedProjects).not.toContain(testProject.id);

    // Check that a remove_save action was created
    const actionsSnapshot = await adminDb.collection("userActions")
      .where("userId", "==", testUser.id)
      .where("projectId", "==", testProject.id)
      .where("action", "==", "remove_save")
      .get();

    expect(actionsSnapshot.empty).toBe(false);
  });
});

// Tests for firestoreBatch.ts
describe("Firestore Batch Operations", () => {
  test("BatchManager should create documents in a batch", async () => {
    const batchManager = new BatchManager();

    batchManager.create("testCollection", { name: "Test 1" });
    batchManager.create("testCollection", { name: "Test 2" });
    batchManager.create("testCollection", { name: "Test 3" });

    await batchManager.commit();

    const snapshot = await adminDb.collection("testCollection").get();
    expect(snapshot.size).toBe(3);
  });

  test("BatchManager should update documents in a batch", async () => {
    // Create a document first
    const docRef = await adminDb.collection("testCollection").add({ name: "Original" });

    const batchManager = new BatchManager();
    batchManager.update(docRef, { name: "Updated" });
    await batchManager.commit();

    const docSnapshot = await docRef.get();
    expect(docSnapshot.data()?.name).toBe("Updated");
  });

  test("createBatchManager should create a BatchManager instance", async () => {
    const batchManager = createBatchManager();
    expect(batchManager).toBeInstanceOf(BatchManager);

    // Test the created instance works
    batchManager.create("testCollection", { name: "Test" });
    await batchManager.commit();

    const snapshot = await adminDb.collection("testCollection").get();
    expect(snapshot.size).toBe(1);
  });

  test("migrateCollection should update documents according to migration function", async () => {
    // Create test documents
    await adminDb.collection("testMigration").doc("doc1").set({ value: 1 });
    await adminDb.collection("testMigration").doc("doc2").set({ value: 2 });
    await adminDb.collection("testMigration").doc("doc3").set({ value: 3 });

    // Define migration function
    const migrationFn = (doc: DocumentData): DocumentData => {
      const migrationDoc = doc as MigrationDoc;
      return {
        ...doc,
        value: migrationDoc.value * 2,
        migrated: true,
      };
    };

    await migrateCollection("testMigration", migrationFn);

    // Check that documents were migrated
    const snapshot = await adminDb.collection("testMigration").get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      expect(data.migrated).toBe(true);
      expect(data.value).toBe(parseInt(doc.id.replace("doc", "")) * 2);
    });
  });

  test("deleteCollection should remove all documents in a collection", async () => {
    // Create test documents
    await adminDb.collection("testDelete").doc("doc1").set({ value: 1 });
    await adminDb.collection("testDelete").doc("doc2").set({ value: 2 });
    await adminDb.collection("testDelete").doc("doc3").set({ value: 3 });

    // Delete the collection
    await deleteCollection("testDelete");

    // Verify collection is empty
    const snapshot = await adminDb.collection("testDelete").get();
    expect(snapshot.empty).toBe(true);
  });
});

// Tests for firestoreValidation.ts
describe("Firestore Validation", () => {
  test("validateUser should validate user data correctly", () => {
    const validUser = {
      email: "test@example.com",
      displayName: "Test User",
      role: "student",
      major: "Computer Science",
      year: "Junior",
    };

    const invalidUser = {
      email: "invalid-email",
      role: "invalid-role",
    };

    const validResult = validateUser(validUser);
    const invalidResult = validateUser(invalidUser);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test("validateProject should validate project data correctly", () => {
    const validProject = {
      title: "Test Project",
      description: "This is a test project with a sufficiently long description to pass validation.",
      facultyId: "faculty1",
      departmentId: "department1",
      universityId: "university1",
    };

    const invalidProject = {
      title: "Test",
      description: "Too short",
    };

    const validResult = validateProject(validProject);
    const invalidResult = validateProject(invalidProject);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test("validateApplication should validate application data correctly", () => {
    const validApplication = {
      studentId: "student1",
      projectId: "project1",
      positionId: "position1",
      interestStatement: "I am very interested in this project because of my background in machine learning.",
      status: "pending",
      submittedAt: admin.firestore.Timestamp.now(),
      studentInfo: {
        major: "Computer Science",
        year: "Junior",
      },
    };

    const invalidApplication = {
      studentId: "",
      interestStatement: "too short",
    };

    const validResult = validateApplication(validApplication);
    const invalidResult = validateApplication(invalidApplication);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test("validateDepartment should validate department data correctly", () => {
    const validDepartment = {
      name: "Computer Science",
      description: "CS Department",
      facultyCount: 5,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const invalidDepartment = {
      name: "",
      facultyCount: -1,
    };

    const validResult = validateDepartment(validDepartment);
    const invalidResult = validateDepartment(invalidDepartment);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test("validateUniversity should validate university data correctly", () => {
    const validUniversity = {
      name: "Test University",
      domain: "test.edu",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      studentCount: 0,
      facultyCount: 0,
    };

    const invalidUniversity = {
      name: "",
      domain: "invalid",
    };

    const validResult = validateUniversity(validUniversity);
    const invalidResult = validateUniversity(invalidUniversity);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test("sanitizeInput should sanitize HTML in input strings", () => {
    const input = "<script>alert(\"XSS\")</script>";
    const sanitized = sanitizeInput(input);

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).toContain("&lt;script&gt;");
  });

  test("validateAndSanitize should validate and sanitize data", () => {
    const data = {
      name: "Test <script>alert(\"XSS\")</script>",
      description: "Description <b>with HTML</b>",
    };

    const validationFn = () => ({ isValid: true, errors: [] });

    const result = validateAndSanitize(data, validationFn, ["name", "description"]);

    expect(result.sanitizedData.name).not.toContain("<script>");
    expect(result.sanitizedData.description).not.toContain("<b>");
  });
});

// Tests for firestoreTransactions.ts
describe("Firestore Transactions", () => {
  test("updateProjectApplicationCount should update application counts", async () => {
    const projectRef = adminDb.collection("projects").doc(testProject.id);
    const positionRef = projectRef.collection("positions").doc(testPosition.id);

    await adminDb.runTransaction(async (transaction) => {
      await updateProjectApplicationCount(transaction, projectRef, 1);
    });

    const projectDoc = await projectRef.get();
    const positionDoc = await positionRef.get();
    const projectData = projectDoc.data();
    const positionData = positionDoc.data();

    expect(projectData?.totalApplications).toBe(1);
    expect(positionData?.applicationCount).toBe(1);
  });

  test("runTransaction should execute a transaction with retry logic", async () => {
    let attempts = 0;

    const transactionFn = async (transaction: admin.firestore.Transaction) => {
      attempts++;

      if (attempts < 2) {
        throw new Error("Simulated transaction failure");
      }

      const docRef = adminDb.collection("testTransactions").doc("doc1");
      transaction.set(docRef, { value: "success" });

      return "transaction-result";
    };

    const result = await runTransaction(transactionFn);

    expect(result).toBe("transaction-result");
    expect(attempts).toBe(2);

    const docSnapshot = await adminDb.collection("testTransactions").doc("doc1").get();
    expect(docSnapshot.data()?.value).toBe("success");
  });

  test("transferPosition should move a position to a different project", async () => {
    const sourceProjectRef = adminDb.collection("projects").doc(testProject.id);
    const targetProjectRef = adminDb.collection("projects").doc("targetProject");
    const positionRef = sourceProjectRef.collection("positions").doc(testPosition.id);

    // Create target project
    await targetProjectRef.set({
      ...testProject,
      id: "targetProject",
      title: "Target Project",
    });

    await adminDb.runTransaction(async (transaction) => {
      const sourceRef = adminDb.collection("projects").doc(testProject.id);
      const targetRef = adminDb.collection("projects").doc("targetProject");
      await transferPosition(transaction, sourceRef, targetRef, positionRef.id);
    });

    // Position should be moved to target project
    const oldPositionDoc = await positionRef.get();
    const newPositionDoc = await targetProjectRef.collection("positions").doc(testPosition.id).get();

    expect(oldPositionDoc.exists).toBe(false);
    expect(newPositionDoc.exists).toBe(true);
    expect(newPositionDoc.data()?.projectId).toBe("targetProject");
  });

  test("updateApplicationStatus should update application status and create user action", async () => {
    // Create test application
    const applicationRef = await adminDb.collection("applications").add(testApplication);

    await adminDb.runTransaction(async (transaction) => {
      await updateApplicationStatus(
        transaction,
        applicationRef,
        "reviewing",
        testFaculty.id,
        "Application looks promising"
      );
    });

    // Check that application was updated
    const applicationSnapshot = await applicationRef.get();
    const applicationData = applicationSnapshot.data();

    expect(applicationData?.status).toBe("reviewing");
    expect(applicationData?.statusHistory.length).toBeGreaterThan(0);
    expect(applicationData?.statusHistory[0].notes).toBe("Application looks promising");

    // Check that user action was created
    const actionsSnapshot = await adminDb.collection("userActions")
      .where("userId", "==", testApplication.studentId)
      .where("action", "==", "apply")
      .get();

    expect(actionsSnapshot.empty).toBe(false);
  });

  test("createApplication should create a new application", async () => {
    await adminDb.runTransaction(async (transaction) => {
      await createApplication(transaction, {
        studentId: testUser.id,
        projectId: testProject.id,
        positionId: testPosition.id,
        interestStatement: "I am interested in this position",
      });
    });

    const applicationsSnapshot = await adminDb.collection("projects")
      .doc(testProject.id)
      .collection("positions")
      .doc(testPosition.id)
      .collection("applications")
      .where("studentId", "==", testUser.id)
      .get();

    expect(applicationsSnapshot.empty).toBe(false);
    const applicationData = applicationsSnapshot.docs[0].data();
    expect(applicationData.status).toBe("pending");
    expect(applicationData.interestStatement).toBe("I am interested in this position");
  });
});

// Tests for firestoreQueries.ts
describe("Firestore Queries", () => {
  beforeEach(async () => {
    // Add an application for testing
    await adminDb.collection("projects")
      .doc(testProject.id)
      .collection("positions")
      .doc(testPosition.id)
      .collection("applications")
      .add(testApplication);
  });

  test("getAllActiveProjectsWithPositions should return active projects with positions", async () => {
    const projects = await getAllActiveProjectsWithPositions();

    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].positions.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
    expect(projects[0].positions[0].id).toBe(testPosition.id);
    expect(projects[0].positions[0].applications?.length).toBeGreaterThan(0);
  });

  test("getProjectsMatchingStudentInterests should return projects matching student interests", async () => {
    const projects = await getProjectsMatchingStudentInterests(testUser.id);

    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
  });

  test("searchProjects should find projects matching search terms", async () => {
    const projects = await searchProjects("test project");

    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
  });

  test("getStudentApplicationProjects should return projects student has applied to", async () => {
    const appliedProjects = await getStudentApplicationProjects(testUser.id);

    expect(appliedProjects.length).toBe(1);
    expect(appliedProjects[0].id).toBe(testProject.id);
    expect(appliedProjects[0].applicationStatus).toBe("pending");
  });

  test("getStudentSavedProjects should return projects saved by student", async () => {
    // First save a project for the student
    await saveProjectForStudent(testUser.id, testProject.id);

    const savedProjects = await getStudentSavedProjects(testUser.id);

    expect(savedProjects.length).toBe(1);
    expect(savedProjects[0].id).toBe(testProject.id);
  });

  test("getFacultyProjectsWithApplications should return faculty projects with applications", async () => {
    // Create an application for the test project
    await adminDb.collection("projects")
      .doc(testProject.id)
      .collection("positions")
      .doc(testPosition.id)
      .collection("applications")
      .add(testApplication);

    const projects = await getFacultyProjectsWithApplications(testFaculty.id);

    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
    expect(projects[0].positions[0].applications.length).toBeGreaterThan(0);
  });

  test("getUniversityStats should return university statistics", async () => {
    const stats = await getUniversityStats("university1");

    expect(stats).toEqual({
      studentCount: 1,
      facultyCount: 1,
      projectCount: 1,
      departmentCount: 1,
      activeProjectCount: 1,
    });
  });
});
