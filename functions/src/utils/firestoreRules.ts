import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate Firestore security rules
 * @param outputPath - The output path for the rules file
 */
export async function generateFirestoreRules(
  outputPath: string = path.join(__dirname, '../../firestore.rules')
): Promise<void> {
  const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isFaculty() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'faculty';
    }
    
    function isStudent() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isProjectOwner(projectId) {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/projects/$(projectId)) &&
        get(/databases/$(database)/documents/projects/$(projectId)).data.facultyId == request.auth.uid;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();
      
      // User's private data subcollection
      match /privateData/{document=**} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
    }
    
    // Universities collection
    match /universities/{universityId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Departments subcollection
      match /departments/{departmentId} {
        allow read: if true;
        allow write: if isAdmin() || 
          (isFaculty() && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.universityId == universityId);
      }
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if true;
      allow create: if isFaculty();
      allow update: if isAdmin() || isProjectOwner(projectId);
      allow delete: if isAdmin() || isProjectOwner(projectId);
      
      // Project applications subcollection
      match /applications/{applicationId} {
        allow read: if isAdmin() || 
          isProjectOwner(projectId) || 
          (isStudent() && resource.data.studentId == request.auth.uid);
        allow create: if isStudent();
        allow update: if isAdmin() || 
          isProjectOwner(projectId) || 
          (isStudent() && resource.data.studentId == request.auth.uid && 
           resource.data.status == 'pending' && request.resource.data.status == 'pending');
        allow delete: if isAdmin() || isProjectOwner(projectId);
      }
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if isAdmin() || 
        (isFaculty() && resource.data.projectId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.projects) || 
        (isStudent() && resource.data.studentId == request.auth.uid);
      allow create: if isStudent();
      allow update: if isAdmin() || 
        (isFaculty() && resource.data.projectId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.projects) || 
        (isStudent() && resource.data.studentId == request.auth.uid && 
         resource.data.status == 'pending' && request.resource.data.status == 'pending');
      allow delete: if isAdmin();
    }
    
    // User actions collection
    match /userActions/{actionId} {
      allow read: if isAdmin() || 
        (isSignedIn() && resource.data.userId == request.auth.uid) || 
        (isFaculty() && resource.data.projectId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.projects);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Immutable
    }
    
    // Onboarding materials collection
    match /onboardingMaterials/{materialId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // System settings collection
    match /settings/{settingId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
`;

  fs.writeFileSync(outputPath, rules);
  console.log(`Firestore rules written to ${outputPath}`);
}

/**
 * Deploy Firestore security rules
 * @param rulesFilePath - The path to the rules file
 */
export async function deployFirestoreRules(
  rulesFilePath: string = path.join(__dirname, '../../firestore.rules')
): Promise<void> {
  try {
    // This function would use the Firebase Admin SDK to deploy rules
    // Note: In a real implementation, you would use the Firebase CLI or REST API
    // as the Admin SDK doesn't directly support rules deployment
    console.log(`Deploying Firestore rules from ${rulesFilePath}`);
    console.log('Note: In a production environment, use the Firebase CLI to deploy rules:');
    console.log('firebase deploy --only firestore:rules');
    
    // Read the rules file
    const rules = fs.readFileSync(rulesFilePath, 'utf8');
    console.log('Rules to deploy:');
    console.log(rules);
    
    // In a real implementation, you would use the Firebase Management API
    // or execute a child process to run the Firebase CLI
  } catch (error) {
    console.error('Error deploying Firestore rules:', error);
    throw error;
  }
}

/**
 * Validate Firestore security rules
 * @param rulesFilePath - The path to the rules file
 * @returns Whether the rules are valid
 */
export async function validateFirestoreRules(
  rulesFilePath: string = path.join(__dirname, '../../firestore.rules')
): Promise<boolean> {
  try {
    // This function would validate the rules syntax
    // Note: In a real implementation, you would use the Firebase CLI or REST API
    console.log(`Validating Firestore rules from ${rulesFilePath}`);
    
    // Read the rules file
    const rules = fs.readFileSync(rulesFilePath, 'utf8');
    
    // Basic validation - check for matching braces
    const openBraces = (rules.match(/{/g) || []).length;
    const closeBraces = (rules.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.error('Rules validation failed: Mismatched braces');
      return false;
    }
    
    // Check for required sections
    if (!rules.includes('service cloud.firestore')) {
      console.error('Rules validation failed: Missing service declaration');
      return false;
    }
    
    if (!rules.includes('match /databases/{database}/documents')) {
      console.error('Rules validation failed: Missing root match statement');
      return false;
    }
    
    console.log('Rules validation passed');
    return true;
  } catch (error) {
    console.error('Error validating Firestore rules:', error);
    return false;
  }
} 