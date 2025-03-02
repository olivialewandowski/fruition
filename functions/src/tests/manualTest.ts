/**
 * Manual test script for Firestore utilities
 * 
 * This script can be run with ts-node to manually test the Firestore utilities.
 * It uses the Firebase emulator, so make sure it's running before executing this script.
 * 
 * Usage:
 * 1. Start the Firebase emulator: firebase emulators:start
 * 2. Run this script: npx ts-node src/tests/manualTest.ts
 * 
 */

import * as admin from 'firebase-admin';
import { addToArray, saveProjectForStudent } from '../utils/firestoreArrays';
import { BatchManager } from '../utils/firestoreBatch';
import { validateUser, validateProject } from '../utils/firestoreValidation';
import { getAllActiveProjectsWithPositions } from '../utils/firestoreQueries';

// Set environment variables for the emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize Firebase Admin SDK
const app = admin.initializeApp({
  projectId: 'fruition-test'
});

const db = app.firestore();

// Sample test data
const testUser = {
  id: 'user1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'student',
  major: 'Computer Science',
  year: 'Junior',
  interests: ['AI', 'Machine Learning', 'Web Development'],
  projectPreferences: {
    savedProjects: []
  }
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

// Test functions
async function runTests() {
  console.log('Starting manual tests...');
  
  try {
    // Clear the database
    await clearDatabase();
    
    // Set up test data
    await setupTestData();
    
    // Test firestoreArrays.ts
    await testFirestoreArrays();
    
    // Test firestoreBatch.ts
    await testFirestoreBatch();
    
    // Test firestoreValidation.ts
    testFirestoreValidation();
    
    // Test firestoreQueries.ts
    await testFirestoreQueries();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    await app.delete();
  }
}

async function clearDatabase() {
  console.log('Clearing database...');
  
  const collections = await db.listCollections();
  for (const collection of collections) {
    const snapshot = await db.collection(collection.id).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}

async function setupTestData() {
  console.log('Setting up test data...');
  
  await db.collection('users').doc(testUser.id).set(testUser);
  await db.collection('projects').doc(testProject.id).set(testProject);
  
  // Add a position to the project
  await db.collection('projects').doc(testProject.id)
    .collection('positions').doc('position1').set({
      title: 'Research Assistant',
      description: 'Help with research tasks',
      projectId: testProject.id,
      isOpen: true,
      filledPositions: 0,
      maxPositions: 2
    });
}

async function testFirestoreArrays() {
  console.log('\nTesting firestoreArrays.ts...');
  
  // Test addToArray
  console.log('Testing addToArray...');
  await addToArray('users', testUser.id, 'interests', 'Data Science');
  
  const userDoc = await db.collection('users').doc(testUser.id).get();
  const userData = userDoc.data();
  
  if (userData?.interests.includes('Data Science')) {
    console.log('✅ addToArray test passed');
  } else {
    console.error('❌ addToArray test failed');
  }
  
  // Test saveProjectForStudent
  console.log('Testing saveProjectForStudent...');
  await saveProjectForStudent(testUser.id, testProject.id);
  
  const updatedUserDoc = await db.collection('users').doc(testUser.id).get();
  const updatedUserData = updatedUserDoc.data();
  
  if (updatedUserData?.projectPreferences.savedProjects.includes(testProject.id)) {
    console.log('✅ saveProjectForStudent test passed');
  } else {
    console.error('❌ saveProjectForStudent test failed');
  }
  
  // Check that a user action was created
  const actionsSnapshot = await db.collection('userActions')
    .where('userId', '==', testUser.id)
    .where('projectId', '==', testProject.id)
    .where('action', '==', 'save')
    .get();
  
  if (!actionsSnapshot.empty) {
    console.log('✅ User action creation test passed');
  } else {
    console.error('❌ User action creation test failed');
  }
}

async function testFirestoreBatch() {
  console.log('\nTesting firestoreBatch.ts...');
  
  // Test BatchManager
  console.log('Testing BatchManager...');
  const batchManager = new BatchManager();
  
  batchManager.create('testCollection', { name: 'Test 1' });
  batchManager.create('testCollection', { name: 'Test 2' });
  batchManager.create('testCollection', { name: 'Test 3' });
  
  await batchManager.commit();
  
  const snapshot = await db.collection('testCollection').get();
  if (snapshot.size === 3) {
    console.log('✅ BatchManager test passed');
  } else {
    console.error('❌ BatchManager test failed');
  }
}

function testFirestoreValidation() {
  console.log('\nTesting firestoreValidation.ts...');
  
  // Test validateUser
  console.log('Testing validateUser...');
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
  
  if (validResult.isValid && !invalidResult.isValid) {
    console.log('✅ validateUser test passed');
  } else {
    console.error('❌ validateUser test failed');
  }
  
  // Test validateProject
  console.log('Testing validateProject...');
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
  
  const validProjectResult = validateProject(validProject);
  const invalidProjectResult = validateProject(invalidProject);
  
  if (validProjectResult.isValid && !invalidProjectResult.isValid) {
    console.log('✅ validateProject test passed');
  } else {
    console.error('❌ validateProject test failed');
  }
}

async function testFirestoreQueries() {
  console.log('\nTesting firestoreQueries.ts...');
  
  // Test getAllActiveProjectsWithPositions
  console.log('Testing getAllActiveProjectsWithPositions...');
  const projects = await getAllActiveProjectsWithPositions();
  
  if (projects.length > 0 && projects[0].positions.length > 0) {
    console.log('✅ getAllActiveProjectsWithPositions test passed');
  } else {
    console.error('❌ getAllActiveProjectsWithPositions test failed');
  }
}

// Run the tests
runTests().catch(console.error); 