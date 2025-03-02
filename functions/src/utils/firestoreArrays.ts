import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Add an item to an array field in a document
 * @param collectionPath - The collection path
 * @param docId - The document ID
 * @param arrayField - The array field name
 * @param item - The item to add
 */
export async function addToArray(
  collectionPath: string,
  docId: string,
  arrayField: string,
  item: any
): Promise<void> {
  await db.collection(collectionPath).doc(docId).update({
    [arrayField]: FieldValue.arrayUnion(item)
  });
}

/**
 * Remove an item from an array field in a document
 * @param collectionPath - The collection path
 * @param docId - The document ID
 * @param arrayField - The array field name
 * @param item - The item to remove
 */
export async function removeFromArray(
  collectionPath: string,
  docId: string,
  arrayField: string,
  item: any
): Promise<void> {
  await db.collection(collectionPath).doc(docId).update({
    [arrayField]: FieldValue.arrayRemove(item)
  });
}

/**
 * Add a user to a project's team members
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param userData - The user data to add
 */
export async function addUserToProjectTeam(
  projectId: string,
  userId: string,
  userData: {
    name: string;
    title: string;
    joinedDate: FirebaseFirestore.Timestamp;
  }
): Promise<void> {
  const teamMember = {
    userId,
    ...userData
  };
  
  await db.collection('projects').doc(projectId).update({
    teamMembers: FieldValue.arrayUnion(teamMember)
  });
  
  // Also add project to user's active projects
  await db.collection('users').doc(userId).update({
    activeProjects: FieldValue.arrayUnion(projectId)
  });
}

/**
 * Remove a user from a project's team members
 * @param projectId - The project ID
 * @param userId - The user ID
 */
export async function removeUserFromProjectTeam(
  projectId: string,
  userId: string
): Promise<void> {
  // Get the project document
  const projectDoc = await db.collection('projects').doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error('Project not found');
  }
  
  const projectData = projectDoc.data();
  if (!projectData) {
    throw new Error('Project data is empty');
  }
  
  // Find the team member to remove
  const teamMembers = projectData.teamMembers || [];
  const updatedTeamMembers = teamMembers.filter(
    (member: { userId: string }) => member.userId !== userId
  );
  
  // Update the project with the new team members array
  await db.collection('projects').doc(projectId).update({
    teamMembers: updatedTeamMembers
  });
  
  // Remove project from user's active projects and add to archived projects
  await db.collection('users').doc(userId).update({
    activeProjects: FieldValue.arrayRemove(projectId),
    archivedProjects: FieldValue.arrayUnion(projectId)
  });
}

/**
 * Save a project for a student
 * @param studentId - The student ID
 * @param projectId - The project ID
 */
export async function saveProjectForStudent(
  studentId: string,
  projectId: string
): Promise<void> {
  await db.collection('users').doc(studentId).update({
    'projectPreferences.savedProjects': FieldValue.arrayUnion(projectId)
  });
  
  // Also log this action
  await db.collection('userActions').add({
    userId: studentId,
    projectId,
    action: 'save',
    timestamp: new Date()
  });
}

/**
 * Remove a saved project for a student
 * @param studentId - The student ID
 * @param projectId - The project ID
 */
export async function removeSavedProjectForStudent(
  studentId: string,
  projectId: string
): Promise<void> {
  await db.collection('users').doc(studentId).update({
    'projectPreferences.savedProjects': FieldValue.arrayRemove(projectId)
  });
  
  // Also log this action
  await db.collection('userActions').add({
    userId: studentId,
    projectId,
    action: 'remove_save',
    timestamp: new Date()
  });
}

/**
 * Add a faculty member to a department
 * @param universityId - The university ID
 * @param departmentId - The department ID
 * @param facultyId - The faculty ID
 */
export async function addFacultyToDepartment(
  universityId: string,
  departmentId: string,
  facultyId: string
): Promise<void> {
  // Add faculty to department
  await db.collection('universities')
    .doc(universityId)
    .collection('departments')
    .doc(departmentId)
    .update({
      facultyIds: FieldValue.arrayUnion(facultyId),
      facultyCount: FieldValue.increment(1)
    });
  
  // Update faculty's department
  await db.collection('users').doc(facultyId).update({
    department: departmentId
  });
}

/**
 * Remove a faculty member from a department
 * @param universityId - The university ID
 * @param departmentId - The department ID
 * @param facultyId - The faculty ID
 */
export async function removeFacultyFromDepartment(
  universityId: string,
  departmentId: string,
  facultyId: string
): Promise<void> {
  // Remove faculty from department
  await db.collection('universities')
    .doc(universityId)
    .collection('departments')
    .doc(departmentId)
    .update({
      facultyIds: FieldValue.arrayRemove(facultyId),
      facultyCount: FieldValue.increment(-1)
    });
  
  // Clear faculty's department
  await db.collection('users').doc(facultyId).update({
    department: null
  });
} 