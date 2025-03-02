import * as admin from 'firebase-admin';
import * as firebaseTesting from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { 
  addToArray, 
  removeFromArray,
  addUserToProjectTeam,
  removeUserFromProjectTeam,
  saveProjectForStudent,
  removeSavedProjectForStudent
} from '../utils/firestoreArrays';
import { 
  BatchManager, 
  createBatchManager,
  deleteCollection,
  migrateCollection
} from '../utils/firestoreBatch';
import {
  updateProjectApplicationCount,
  updateApplicationStatus,
  transferPosition,
  runTransaction,
  createApplication
} from '../utils/firestoreTransactions';
import {
  validateUser,
  validateProject,
  validateApplication,
  validateDepartment,
  validateUniversity,
  sanitizeInput,
  validateAndSanitize
} from '../utils/firestoreValidation';
import {
  getAllActiveProjectsWithPositions,
  getProjectsMatchingStudentInterests,
  getStudentApplicationProjects,
  getStudentSavedProjects,
  getFacultyProjectsWithApplications,
  searchProjects,
  getUniversityStats
} from '../utils/firestoreQueries';

// Test project ID for Firebase emulator
const PROJECT_ID = 'fruition-test';

// Initialize the Firebase Testing Environment
let testEnv: firebaseTesting.RulesTestEnvironment;
let adminApp: admin.app.App;
let adminDb: admin.firestore.Firestore;

// Mock the Firebase Admin SDK for unit tests
jest.mock('../config/firebase', () => {
  return {
    get db() {
      return adminDb;
    }
  };
});

// Sample test data
const testUser = {
  id: 'user1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'student',
  major: 'Computer Science',
  year: 'Junior',
  university: 'university1',
  interests: ['AI', 'Machine Learning', 'Web Development'],
  projectPreferences: {
    savedProjects: []
  }
};

const testFaculty = {
  id: 'faculty1',
  email: 'faculty@example.com',
  displayName: 'Faculty User',
  role: 'faculty',
  department: 'department1',
  title: 'Professor',
  university: 'university1'
};

const testProject = {
  id: 'project1',
  title: 'Test Project',
  description: 'This is a test project for research',
  facultyId: 'faculty1',
  mentorId: 'faculty1',
  departmentId: 'department1',
  department: 'department1',
  universityId: 'university1',
  isActive: true,
  status: 'active',
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
  keywords: ['AI', 'Machine Learning'],
  teamMembers: []
};

const testPosition = {
  id: 'position1',
  title: 'Research Assistant',
  description: 'Help with research tasks',
  projectId: 'project1',
  isOpen: true,
  filledPositions: 0,
  maxPositions: 2
};

const testApplication = {
  studentId: 'user1',
  studentName: 'Test User',
  projectId: 'project1',
  positionId: 'position1',
  interestStatement: 'I am very interested in this project because it aligns with my research interests.',
  status: 'pending',
  submittedAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now(),
  studentInfo: {
    major: 'Computer Science',
    year: 'Junior'
  }
};

// Setup and teardown functions
beforeAll(async () => {
  // Initialize the testing environment
  testEnv = await firebaseTesting.initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
    }
  });

  // Initialize admin app
  adminApp = admin.initializeApp({
    projectId: PROJECT_ID
  }, 'admin-app');
  
  adminDb = adminApp.firestore();
  
  // Set the admin database to use the emulator
  adminDb.settings({
    host: 'localhost:8080',
    ssl: false
  });
});

afterAll(async () => {
  // Add a small delay to ensure all operations are complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clean up the testing environment
  await testEnv.cleanup();
  
  // Clean up the admin app
  await adminApp.delete();
  
  // Close any remaining connections
  await new Promise(resolve => setTimeout(resolve, 500));
});

beforeEach(async () => {
  // Clear the database before each test
  await testEnv.clearFirestore();
  
  // Set up initial test data
  await adminDb.collection('users').doc(testUser.id).set(testUser);
  await adminDb.collection('users').doc(testFaculty.id).set(testFaculty);
  await adminDb.collection('projects').doc(testProject.id).set(testProject);
  await adminDb.collection('projects').doc(testProject.id)
    .collection('positions').doc(testPosition.id).set(testPosition);
  await adminDb.collection('universities').doc('university1').set({
    name: 'Test University',
    domain: 'test.edu',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    studentCount: 1,
    facultyCount: 1
  });
  await adminDb.collection('universities').doc('university1')
    .collection('departments').doc('department1').set({
      name: 'Computer Science',
      description: 'CS Department',
      facultyCount: 1,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
});

// Tests for firestoreArrays.ts
describe('Firestore Array Operations', () => {
  test('addToArray should add an item to an array field', async () => {
    await addToArray('users', testUser.id, 'interests', 'Data Science');
    
    const userDoc = await adminDb.collection('users').doc(testUser.id).get();
    const userData = userDoc.data();
    
    expect(userData?.interests).toContain('Data Science');
  });
  
  test('removeFromArray should remove an item from an array field', async () => {
    await removeFromArray('users', testUser.id, 'interests', 'AI');
    
    const userDoc = await adminDb.collection('users').doc(testUser.id).get();
    const userData = userDoc.data();
    
    expect(userData?.interests).not.toContain('AI');
  });
  
  test('addUserToProjectTeam should add a user to project team members', async () => {
    await addUserToProjectTeam(
      testProject.id,
      testUser.id,
      {
        name: 'Test User',
        title: 'Research Assistant',
        joinedDate: admin.firestore.Timestamp.now()
      }
    );
    
    const projectDoc = await adminDb.collection('projects').doc(testProject.id).get();
    const projectData = projectDoc.data();
    
    expect(projectData?.teamMembers.some((member: any) => member.userId === testUser.id)).toBe(true);
    
    const userDoc = await adminDb.collection('users').doc(testUser.id).get();
    const userData = userDoc.data();
    
    expect(userData?.activeProjects).toContain(testProject.id);
  });
  
  test('saveProjectForStudent should save a project for a student', async () => {
    await saveProjectForStudent(testUser.id, testProject.id);
    
    const userDoc = await adminDb.collection('users').doc(testUser.id).get();
    const userData = userDoc.data();
    
    expect(userData?.projectPreferences.savedProjects).toContain(testProject.id);
    
    // Check that a user action was created
    const actionsSnapshot = await adminDb.collection('userActions')
      .where('userId', '==', testUser.id)
      .where('projectId', '==', testProject.id)
      .where('action', '==', 'save')
      .get();
    
    expect(actionsSnapshot.empty).toBe(false);
  });
});

// Tests for firestoreBatch.ts
describe('Firestore Batch Operations', () => {
  test('BatchManager should create documents in a batch', async () => {
    const batchManager = new BatchManager();
    
    batchManager.create('testCollection', { name: 'Test 1' });
    batchManager.create('testCollection', { name: 'Test 2' });
    batchManager.create('testCollection', { name: 'Test 3' });
    
    await batchManager.commit();
    
    const snapshot = await adminDb.collection('testCollection').get();
    expect(snapshot.size).toBe(3);
  });
  
  test('BatchManager should update documents in a batch', async () => {
    // Create a document first
    const docRef = await adminDb.collection('testCollection').add({ name: 'Original' });
    
    const batchManager = new BatchManager();
    batchManager.update(docRef, { name: 'Updated' });
    await batchManager.commit();
    
    const docSnapshot = await docRef.get();
    expect(docSnapshot.data()?.name).toBe('Updated');
  });
  
  test('migrateCollection should update documents according to migration function', async () => {
    // Create test documents
    await adminDb.collection('testMigration').doc('doc1').set({ value: 1 });
    await adminDb.collection('testMigration').doc('doc2').set({ value: 2 });
    await adminDb.collection('testMigration').doc('doc3').set({ value: 3 });
    
    // Define migration function
    const migrationFn = (doc: any) => {
      return {
        ...doc,
        value: doc.value * 2,
        migrated: true
      };
    };
    
    await migrateCollection('testMigration', migrationFn);
    
    // Check that documents were migrated
    const snapshot = await adminDb.collection('testMigration').get();
    snapshot.forEach(doc => {
      const data = doc.data();
      expect(data.migrated).toBe(true);
      expect(data.value).toBe(parseInt(doc.id.replace('doc', '')) * 2);
    });
  });
});

// Tests for firestoreValidation.ts
describe('Firestore Validation', () => {
  test('validateUser should validate user data correctly', () => {
    const validUser = {
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'student',
      major: 'Computer Science',
      year: 'Junior'
    };
    
    const invalidUser = {
      email: 'invalid-email',
      role: 'invalid-role'
    };
    
    const validResult = validateUser(validUser);
    const invalidResult = validateUser(invalidUser);
    
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
  
  test('validateProject should validate project data correctly', () => {
    const validProject = {
      title: 'Test Project',
      description: 'This is a test project with a sufficiently long description to pass validation.',
      facultyId: 'faculty1',
      departmentId: 'department1',
      universityId: 'university1'
    };
    
    const invalidProject = {
      title: 'Test',
      description: 'Too short'
    };
    
    const validResult = validateProject(validProject);
    const invalidResult = validateProject(invalidProject);
    
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
  
  test('sanitizeInput should sanitize HTML in input strings', () => {
    const input = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(input);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });
  
  test('validateAndSanitize should validate and sanitize data', () => {
    const data = {
      name: 'Test <script>alert("XSS")</script>',
      description: 'Description <b>with HTML</b>'
    };
    
    const validationFn = () => ({ isValid: true, errors: [] });
    
    const result = validateAndSanitize(data, validationFn, ['name', 'description']);
    
    expect(result.sanitizedData.name).not.toContain('<script>');
    expect(result.sanitizedData.description).not.toContain('<b>');
  });
});

// Tests for firestoreTransactions.ts
describe('Firestore Transactions', () => {
  test('runTransaction should execute a transaction with retry logic', async () => {
    let attempts = 0;
    
    const transactionFn = async (transaction: admin.firestore.Transaction) => {
      attempts++;
      
      if (attempts < 2) {
        throw new Error('Simulated transaction failure');
      }
      
      const docRef = adminDb.collection('testTransactions').doc('doc1');
      transaction.set(docRef, { value: 'success' });
      
      return 'transaction-result';
    };
    
    const result = await runTransaction(transactionFn);
    
    expect(result).toBe('transaction-result');
    expect(attempts).toBe(2);
    
    const docSnapshot = await adminDb.collection('testTransactions').doc('doc1').get();
    expect(docSnapshot.data()?.value).toBe('success');
  });
  
  test('updateApplicationStatus should update application status and create user action', async () => {
    // Create test application
    const applicationRef = await adminDb.collection('applications').add(testApplication);
    
    await adminDb.runTransaction(async (transaction) => {
      await updateApplicationStatus(
        transaction,
        applicationRef,
        'reviewing',
        testFaculty.id,
        'Application looks promising'
      );
    });
    
    // Check that application was updated
    const applicationSnapshot = await applicationRef.get();
    const applicationData = applicationSnapshot.data();
    
    expect(applicationData?.status).toBe('reviewing');
    expect(applicationData?.statusHistory.length).toBeGreaterThan(0);
    expect(applicationData?.statusHistory[0].notes).toBe('Application looks promising');
    
    // Check that user action was created
    const actionsSnapshot = await adminDb.collection('userActions')
      .where('userId', '==', testApplication.studentId)
      .where('action', '==', 'apply')
      .get();
    
    expect(actionsSnapshot.empty).toBe(false);
  });
});

// Tests for firestoreQueries.ts
describe('Firestore Queries', () => {
  beforeEach(async () => {
    // Add an application for testing
    await adminDb.collection('projects')
      .doc(testProject.id)
      .collection('positions')
      .doc(testPosition.id)
      .collection('applications')
      .add(testApplication);
  });
  
  test('getAllActiveProjectsWithPositions should return active projects with positions', async () => {
    const projects = await getAllActiveProjectsWithPositions();
    
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].positions.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
    expect(projects[0].positions[0].id).toBe(testPosition.id);
  });
  
  test('getProjectsMatchingStudentInterests should return projects matching student interests', async () => {
    const projects = await getProjectsMatchingStudentInterests(testUser.id);
    
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
  });
  
  test('searchProjects should find projects matching search terms', async () => {
    const projects = await searchProjects('test project');
    
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].id).toBe(testProject.id);
  });
}); 