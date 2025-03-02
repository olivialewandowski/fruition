import { db } from "../config/firebase";
import { User, UserWithId } from "../types/user";
import { Project, ProjectWithId } from "../types/project";
import { 
  Position, PositionWithId,
  Application, ApplicationWithId
} from "../types/position";
import { University, UniversityWithId, Department, DepartmentWithId } from "../types/university";
import { UserAction, UserActionWithId } from "../types/userAction";
import { MaterialFile } from "../types/onboardingMaterial";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

/**
 * Generic type for Firestore documents with ID
 */
type WithId<T> = T & { id: string };

/**
 * Generic function to convert Firestore document to typed object with ID
 */
function convertDoc<T>(doc: FirebaseFirestore.DocumentSnapshot): WithId<T> | null {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as WithId<T>;
}

/**
 * Generic function to convert Firestore query snapshot to array of typed objects with ID
 */
function convertCollection<T>(snapshot: FirebaseFirestore.QuerySnapshot): WithId<T>[] {
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<T>));
}

// ==================== USER OPERATIONS ====================

/**
 * Create a new user
 */
export async function createUser(userId: string, userData: Omit<User, 'createdAt' | 'lastActive'>): Promise<void> {
  const now = Timestamp.now();
  
  await db.collection("users").doc(userId).set({
    ...userData,
    createdAt: now,
    lastActive: now,
    activeProjects: [],
    archivedProjects: []
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserWithId | null> {
  const doc = await db.collection("users").doc(userId).get();
  return convertDoc<User>(doc);
}

/**
 * Update user data
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  await db.collection("users").doc(userId).update({
    ...userData,
    lastActive: Timestamp.now()
  });
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  await db.collection("users").doc(userId).delete();
}

/**
 * Get users by university
 */
export async function getUsersByUniversity(universityId: string, role?: string): Promise<UserWithId[]> {
  let query = db.collection("users").where("university", "==", universityId);
  
  if (role) {
    query = query.where("role", "==", role);
  }
  
  const snapshot = await query.get();
  return convertCollection<User>(snapshot);
}

// ==================== UNIVERSITY OPERATIONS ====================

/**
 * Create a new university
 */
export async function createUniversity(universityData: Omit<University, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = Timestamp.now();
  
  const docRef = await db.collection("universities").add({
    ...universityData,
    createdAt: now,
    updatedAt: now
  });
  
  return docRef.id;
}

/**
 * Get university by ID
 */
export async function getUniversityById(universityId: string): Promise<UniversityWithId | null> {
  const doc = await db.collection("universities").doc(universityId).get();
  return convertDoc<University>(doc);
}

/**
 * Update university data
 */
export async function updateUniversity(universityId: string, universityData: Partial<University>): Promise<void> {
  await db.collection("universities").doc(universityId).update({
    ...universityData,
    updatedAt: Timestamp.now()
  });
}

/**
 * Delete university
 */
export async function deleteUniversity(universityId: string): Promise<void> {
  await db.collection("universities").doc(universityId).delete();
}

/**
 * Add user to university
 */
export async function addUserToUniversity(universityId: string, userId: string, role: string): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  const universityRef = db.collection("universities").doc(universityId);
  
  // Update user's university
  await userRef.update({
    university: universityId,
    role: role
  });
  
  // Add user to appropriate university field based on role
  if (role === "student") {
    await universityRef.update({
      studentIds: FieldValue.arrayUnion(userId)
    });
  } else if (role === "faculty") {
    await universityRef.update({
      facultyIds: FieldValue.arrayUnion(userId)
    });
  } else if (role === "admin") {
    await universityRef.update({
      adminIds: FieldValue.arrayUnion(userId)
    });
  }
}

// ==================== DEPARTMENT OPERATIONS ====================

/**
 * Create a new department
 */
export async function createDepartment(
  universityId: string, 
  departmentData: Omit<Department, 'createdAt' | 'updatedAt' | 'facultyCount'>
): Promise<string> {
  const now = Timestamp.now();
  
  const docRef = await db.collection("universities")
    .doc(universityId)
    .collection("departments")
    .add({
      ...departmentData,
      facultyCount: 0,
      createdAt: now,
      updatedAt: now
    });
  
  return docRef.id;
}

/**
 * Get department by ID
 */
export async function getDepartmentById(
  universityId: string, 
  departmentId: string
): Promise<DepartmentWithId | null> {
  const doc = await db.collection("universities")
    .doc(universityId)
    .collection("departments")
    .doc(departmentId)
    .get();
  
  return convertDoc<Department>(doc);
}

/**
 * Get all departments for a university
 */
export async function getDepartmentsByUniversity(universityId: string): Promise<DepartmentWithId[]> {
  const snapshot = await db.collection("universities")
    .doc(universityId)
    .collection("departments")
    .get();
  
  return convertCollection<Department>(snapshot);
}

// ==================== PROJECT OPERATIONS ====================

/**
 * Create a new project
 */
export async function createProject(projectData: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = Timestamp.now();
  
  const docRef = await db.collection("projects").add({
    ...projectData,
    createdAt: now,
    updatedAt: now,
    teamMembers: []
  });
  
  // Add project to mentor's activeProjects
  await db.collection("users").doc(projectData.mentorId).update({
    activeProjects: FieldValue.arrayUnion(docRef.id)
  });
  
  return docRef.id;
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<ProjectWithId | null> {
  const doc = await db.collection("projects").doc(projectId).get();
  return convertDoc<Project>(doc);
}

/**
 * Update project data
 */
export async function updateProject(projectId: string, projectData: Partial<Project>): Promise<void> {
  await db.collection("projects").doc(projectId).update({
    ...projectData,
    updatedAt: Timestamp.now()
  });
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const projectDoc = await db.collection("projects").doc(projectId).get();
  const projectData = projectDoc.data() as Project;
  
  if (projectData) {
    // Remove project from mentor's activeProjects
    await db.collection("users").doc(projectData.mentorId).update({
      activeProjects: FieldValue.arrayRemove(projectId)
    });
  }
  
  await db.collection("projects").doc(projectId).delete();
}

/**
 * Get projects by mentor
 */
export async function getProjectsByMentor(mentorId: string): Promise<ProjectWithId[]> {
  const snapshot = await db.collection("projects")
    .where("mentorId", "==", mentorId)
    .get();
  
  return convertCollection<Project>(snapshot);
}

/**
 * Get active projects
 */
export async function getActiveProjects(): Promise<ProjectWithId[]> {
  const snapshot = await db.collection("projects")
    .where("isActive", "==", true)
    .get();
  
  return convertCollection<Project>(snapshot);
}

/**
 * Add user to project team
 */
export async function addUserToProject(
  projectId: string, 
  userId: string, 
  name: string, 
  title: string
): Promise<void> {
  const now = Timestamp.now();
  
  // Add user to project's teamMembers
  await db.collection("projects").doc(projectId).update({
    teamMembers: FieldValue.arrayUnion({
      userId,
      name,
      title,
      joinedDate: now
    })
  });
  
  // Add project to user's activeProjects
  await db.collection("users").doc(userId).update({
    activeProjects: FieldValue.arrayUnion(projectId)
  });
}

/**
 * Remove user from project team
 */
export async function removeUserFromProject(projectId: string, userId: string): Promise<void> {
  const projectDoc = await db.collection("projects").doc(projectId).get();
  const projectData = projectDoc.data() as Project;
  
  if (projectData && projectData.teamMembers) {
    // Find and remove the team member
    const updatedTeamMembers = projectData.teamMembers.filter(
      member => member.userId !== userId
    );
    
    // Update the project
    await db.collection("projects").doc(projectId).update({
      teamMembers: updatedTeamMembers
    });
    
    // Remove project from user's activeProjects and add to archivedProjects
    await db.collection("users").doc(userId).update({
      activeProjects: FieldValue.arrayRemove(projectId),
      archivedProjects: FieldValue.arrayUnion(projectId)
    });
  }
}

// ==================== POSITION OPERATIONS ====================

/**
 * Create a new position
 */
export async function createPosition(
  projectId: string, 
  positionData: Omit<Position, 'projectId' | 'filledPositions'>
): Promise<string> {
  const positionWithProject = {
    ...positionData,
    projectId,
    filledPositions: 0
  };
  
  const docRef = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .add(positionWithProject);
  
  return docRef.id;
}

/**
 * Get position by ID
 */
export async function getPositionById(
  projectId: string, 
  positionId: string
): Promise<PositionWithId | null> {
  const doc = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .get();
  
  return convertDoc<Position>(doc);
}

/**
 * Get positions by project
 */
export async function getPositionsByProject(projectId: string): Promise<PositionWithId[]> {
  const snapshot = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .get();
  
  return convertCollection<Position>(snapshot);
}

/**
 * Update position data
 */
export async function updatePosition(
  projectId: string, 
  positionId: string, 
  positionData: Partial<Position>
): Promise<void> {
  await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .update(positionData);
}

/**
 * Delete position
 */
export async function deletePosition(projectId: string, positionId: string): Promise<void> {
  await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .delete();
}

// ==================== APPLICATION OPERATIONS ====================

/**
 * Create a new application
 */
export async function createApplication(
  projectId: string, 
  positionId: string, 
  applicationData: Omit<Application, 'submittedAt' | 'updatedAt' | 'status'>
): Promise<string> {
  const now = Timestamp.now();
  
  const applicationWithDefaults = {
    ...applicationData,
    status: "pending",
    submittedAt: now,
    updatedAt: now
  };
  
  const docRef = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .collection("applications")
    .add(applicationWithDefaults);
  
  // Add to user's applied projects
  await db.collection("users").doc(applicationData.studentId).update({
    "projectPreferences.appliedProjects": FieldValue.arrayUnion(projectId)
  });
  
  // Create a user action for this application
  await createUserAction({
    userId: applicationData.studentId,
    projectId,
    action: "apply",
    timestamp: now
  });
  
  return docRef.id;
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  projectId: string, 
  positionId: string, 
  applicationId: string
): Promise<ApplicationWithId | null> {
  const doc = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .collection("applications")
    .doc(applicationId)
    .get();
  
  if (!doc.exists) return null;
  
  return {
    ...(doc.data() as Application),
    id: doc.id,
    projectId,
    positionId
  } as ApplicationWithId;
}

/**
 * Get applications by position
 */
export async function getApplicationsByPosition(
  projectId: string, 
  positionId: string
): Promise<ApplicationWithId[]> {
  const snapshot = await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .collection("applications")
    .get();
  
  return snapshot.docs.map(doc => ({
    ...(doc.data() as Application),
    id: doc.id,
    projectId,
    positionId
  } as ApplicationWithId));
}

/**
 * Get applications by student
 */
export async function getApplicationsByStudent(studentId: string): Promise<ApplicationWithId[]> {
  // This requires a custom index on applications subcollection
  const applications: ApplicationWithId[] = [];
  
  // Get all projects
  const projectsSnapshot = await db.collection("projects").get();
  
  // For each project, get positions and applications
  for (const projectDoc of projectsSnapshot.docs) {
    const projectId = projectDoc.id;
    const positionsSnapshot = await projectDoc.ref.collection("positions").get();
    
    for (const positionDoc of positionsSnapshot.docs) {
      const positionId = positionDoc.id;
      const applicationsSnapshot = await positionDoc.ref
        .collection("applications")
        .where("studentId", "==", studentId)
        .get();
      
      applicationsSnapshot.docs.forEach(appDoc => {
        applications.push({
          ...(appDoc.data() as Application),
          id: appDoc.id,
          projectId,
          positionId
        } as ApplicationWithId);
      });
    }
  }
  
  return applications;
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  projectId: string, 
  positionId: string, 
  applicationId: string, 
  status: Application["status"],
  notes?: string
): Promise<void> {
  const now = Timestamp.now();
  const updateData: any = {
    status,
    updatedAt: now
  };
  
  if (notes) {
    updateData.notes = notes;
  }
  
  await db.collection("projects")
    .doc(projectId)
    .collection("positions")
    .doc(positionId)
    .collection("applications")
    .doc(applicationId)
    .update(updateData);
  
  // If accepted, increment filledPositions
  if (status === "accepted") {
    await db.collection("projects")
      .doc(projectId)
      .collection("positions")
      .doc(positionId)
      .update({
        filledPositions: FieldValue.increment(1)
      });
  }
}

// ==================== USER ACTION OPERATIONS ====================

/**
 * Create a new user action
 */
export async function createUserAction(actionData: UserAction): Promise<string> {
  const docRef = await db.collection("userActions").add(actionData);
  
  return docRef.id;
}

/**
 * Get user actions by user
 */
export async function getUserActionsByUser(userId: string): Promise<UserActionWithId[]> {
  const snapshot = await db.collection("userActions")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();
  
  return convertCollection<UserAction>(snapshot);
}

/**
 * Get user actions by project
 */
export async function getUserActionsByProject(projectId: string): Promise<UserActionWithId[]> {
  const snapshot = await db.collection("userActions")
    .where("projectId", "==", projectId)
    .orderBy("timestamp", "desc")
    .get();
  
  return convertCollection<UserAction>(snapshot);
}

// ==================== ONBOARDING MATERIALS OPERATIONS ====================

/**
 * Add onboarding material
 */
export async function addOnboardingMaterial(
  projectId: string, 
  materialData: Omit<MaterialFile, 'materialId' | 'uploadedAt'>
): Promise<string> {
  const now = Timestamp.now();
  
  const docRef = await db.collection("projects")
    .doc(projectId)
    .collection("onboardingMaterials")
    .add({
      ...materialData,
      uploadedAt: now
    });
  
  // Update the document with its own ID
  await docRef.update({
    materialId: docRef.id
  });
  
  return docRef.id;
}

/**
 * Get onboarding materials by project
 */
export async function getOnboardingMaterialsByProject(projectId: string): Promise<MaterialFile[]> {
  const snapshot = await db.collection("projects")
    .doc(projectId)
    .collection("onboardingMaterials")
    .get();
  
  return snapshot.docs.map(doc => doc.data() as MaterialFile);
}

/**
 * Delete onboarding material
 */
export async function deleteOnboardingMaterial(projectId: string, materialId: string): Promise<void> {
  await db.collection("projects")
    .doc(projectId)
    .collection("onboardingMaterials")
    .doc(materialId)
    .delete();
} 