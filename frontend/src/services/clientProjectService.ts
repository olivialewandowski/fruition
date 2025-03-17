// src/services/clientProjectService.ts (updated)
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  getDocs,
  where,
  writeBatch,
  runTransaction,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { getAuth } from "firebase/auth";
import { Position } from "../types/position";
import { Project, ProjectWithId, convertToProjectWithId } from "../types/project";
import { Application } from "../types/application";
import { User } from "../types/user";

/**
 * Create a new project with position in the client
 * This interacts directly with Firestore while ensuring data consistency
 * 
 * @param projectData - The project data
 * @param positionData - The position data
 * @returns The created project ID
 */
export const createClientProject = async (
  projectData: Partial<Project>, 
  positionData: Partial<Position>
): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log(`Creating project for user ${user.uid}`);
    
    // Use a transaction to ensure data consistency
    return await runTransaction(db, async (transaction) => {
      // First, ensure the user has a role assigned
      const userRef = doc(db, "users", user.uid);
      const userDoc = await transaction.get(userRef);
      
      // Prepare user data if needed
      if (!userDoc.exists() || !userDoc.data()?.role) {
        transaction.update(userRef, {
          role: "faculty", // Default role for project creation
          updatedAt: serverTimestamp()
        });
        console.log("Updated user with faculty role (transaction)");
      }
      
      // Create the project with required fields
      const projectWithUser = {
        ...projectData,
        mentorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: projectData.status || "active",
        isActive: projectData.status === "active" ? true : false,
        teamMembers: projectData.teamMembers || [],
      };
      
      // Create the project document
      const projectsCollectionRef = collection(db, "projects");
      const projectRef = doc(projectsCollectionRef);
      transaction.set(projectRef, projectWithUser);
      const projectId = projectRef.id;
      
      // Add the position with a reference to the project
      const positionWithProject = {
        ...positionData,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const positionsCollectionRef = collection(db, "positions");
      const positionRef = doc(positionsCollectionRef);
      transaction.set(positionRef, positionWithProject);
      
      // Update user's active projects
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let activeProjects = userData.activeProjects || [];
        
        // Make sure activeProjects is an array
        if (!Array.isArray(activeProjects)) {
          activeProjects = [];
        }
        
        // Add the new project to the active projects array if not already there
        if (!activeProjects.includes(projectId)) {
          activeProjects.push(projectId);
          transaction.update(userRef, {
            activeProjects: activeProjects,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // If the user document doesn't exist yet, create it with this project
        transaction.set(userRef, {
          uid: user.uid,
          email: user.email,
          activeProjects: [projectId],
          archivedProjects: [],
          role: "faculty",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log(`Created project ${projectId} for user ${user.uid}`);
      return projectId;
    });
  } catch (error) {
    console.error("Error creating project from client:", error);
    throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fallback method that uses batched writes when transactions aren't working
 * This is a more reliable approach for some Firestore configurations
 * 
 * @param projectData - The project data
 * @param positionData - The position data
 * @returns The created project ID
 */
export const createClientProjectBatched = async (
  projectData: Partial<Project>, 
  positionData: Partial<Position>
): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log(`Creating project (batched) for user ${user.uid}`);
    
    // Start a batch
    const batch = writeBatch(db);
    
    // Get user document first
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Create the project document
    const projectRef = doc(collection(db, "projects"));
    const projectId = projectRef.id;
    
    // Create the project with required fields
    const projectWithUser = {
      ...projectData,
      mentorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: projectData.status || "active",
      isActive: projectData.status === "active" ? true : false,
      teamMembers: projectData.teamMembers || [],
    };
    
    batch.set(projectRef, projectWithUser);
    
    // Add the position with a reference to the project
    const positionWithProject = {
      ...positionData,
      projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const positionRef = doc(collection(db, "positions"));
    batch.set(positionRef, positionWithProject);
    
    // If user exists, update their active projects
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let activeProjects = userData.activeProjects || [];
      
      // Make sure activeProjects is an array
      if (!Array.isArray(activeProjects)) {
        activeProjects = [];
      }
      
      // Add project to user's active projects if not already there
      if (!activeProjects.includes(projectId)) {
        activeProjects.push(projectId);
        batch.update(userRef, {
          activeProjects: activeProjects,
          updatedAt: serverTimestamp()
        });
      }
      
      // If user doesn't have a role, set it
      if (!userData.role) {
        batch.update(userRef, {
          role: "faculty",
          updatedAt: serverTimestamp()
        });
      }
    } else {
      // If user document doesn't exist, create it
      batch.set(userRef, {
        uid: user.uid,
        email: user.email,
        activeProjects: [projectId],
        archivedProjects: [],
        role: "faculty",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // Commit the batch write
    await batch.commit();
    
    console.log(`Created project ${projectId} for user ${user.uid} (batched)`);
    return projectId;
  } catch (error) {
    console.error("Error creating project from client (batched):", error);
    throw new Error(`Failed to create project (batched): ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get project by ID
export const getProjectById = async (projectId: string): Promise<ProjectWithId | null> => {
  try {
    console.log(`Fetching project with ID: ${projectId}`);
    
    if (!projectId) {
      console.error('Invalid project ID: undefined or empty');
      return null;
    }
    
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      console.log(`Project ${projectId} not found in Firestore`);
      return null;
    }
    
    const projectData = projectDoc.data();
    console.log(`Successfully retrieved project: ${projectId}`);
    
    // Use the utility function to ensure all required fields are present
    return convertToProjectWithId({
      ...projectData,
      id: projectDoc.id
    });
  } catch (error) {
    console.error(`Error getting project ${projectId}:`, error);
    console.error(`Error details:`, error instanceof Error ? error.message : 'Unknown error');
    return null; // Return null instead of throwing
  }
};

/**
 * Client-side function to get user projects
 * @param status - The status of projects to fetch (active, archived, applied)
 * @returns Array of projects
 */
export const getUserProjects = async (
  status: 'active' | 'archived' | 'applied' = 'active'
): Promise<ProjectWithId[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    console.log("==== DEBUGGING getUserProjects ====");
    console.log(`Status: ${status}`);
    console.log(`User: ${user ? user.uid : 'No user found'}`);
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }
    
    // Get the user document to find project IDs
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    console.log(`User document exists: ${userDoc.exists()}`);
    
    if (!userDoc.exists()) {
      console.log('User document not found in Firestore');
      return [];
    }
    
    const userData = userDoc.data();
    console.log('User data retrieved:', userData);
    console.log('Role:', userData.role);
    console.log('Active Projects in user data:', userData.activeProjects);
    
    // Determine which project IDs to fetch based on status
    let projectIds: string[] = [];
    
    if (status === 'active') {
      projectIds = userData.activeProjects || [];
      console.log(`Found ${projectIds.length} active project IDs:`, projectIds);
      
      // For faculty/admin users
      if (userData.role === 'faculty' || userData.role === 'admin') {
        console.log('User is faculty/admin, querying projects where user is mentor');
        
        try {
          // Query for projects where the user is the mentor
          const mentorProjectsQuery = query(
            collection(db, "projects"), 
            where("mentorId", "==", user.uid)
          );
          
          const mentorProjectsSnapshot = await getDocs(mentorProjectsQuery);
          console.log(`Found ${mentorProjectsSnapshot.docs.length} projects where user is mentor`);
          
          // Log each project found
          mentorProjectsSnapshot.docs.forEach(doc => {
            console.log(`Project ${doc.id}: ${doc.data().title} (status: ${doc.data().status})`);
          });
          
          const mentorProjects: ProjectWithId[] = [];
          
          mentorProjectsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const projectStatus = String(data.status || 'active'); // Default to active
            
            // Handle projects based on status
            if (status === 'active') {
              // For active tab, include all projects that aren't archived
              if (projectStatus !== 'archived') {
                const project = convertToProjectWithId({
                  ...data,
                  id: doc.id
                });
                mentorProjects.push(project);
                console.log(`Added active project to results: ${doc.id}`);
              } else {
                console.log(`Skipped archived project: ${doc.id}`);
              }
            } else if (status === 'archived') {
              // For archived tab, only include archived projects
              if (projectStatus === 'archived') {
                const project = convertToProjectWithId({
                  ...data,
                  id: doc.id
                });
                mentorProjects.push(project);
                console.log(`Added archived project to results: ${doc.id}`);
              } else {
                console.log(`Skipped non-archived project: ${doc.id}`);
              }
            } else {
              // For other status types (like 'applied')
              console.log(`Adding project ${doc.id} to other category`);
              const project = convertToProjectWithId({
                ...data,
                id: doc.id
              });
              mentorProjects.push(project);
            }
          });
          
          console.log(`After filtering, found ${mentorProjects.length} ${status} mentor projects`);
          
          // Return these projects if we found any
          if (mentorProjects.length > 0) {
            return mentorProjects;
          }
        } catch (err) {
          console.error('Error querying mentor projects:', err);
        }
      }
    } else if (status === 'archived') {
      projectIds = userData.archivedProjects || [];
      console.log(`Found ${projectIds.length} archived project IDs:`, projectIds);
    } else if (status === 'applied') {
      // Fix for handling undefined projectPreferences
      projectIds = (userData.projectPreferences?.appliedProjects || []);
      console.log(`Found ${projectIds.length} applied project IDs:`, projectIds);
    }
    
    if (projectIds.length === 0) {
      console.log(`No ${status} project IDs found for user ${user.uid}`);
      return [];
    }
    
    // Fetch each project individually to avoid Firestore limitations
    const projects: ProjectWithId[] = [];
    
    for (const projectId of projectIds) {
      try {
        if (!projectId) {
          console.log('Skipping undefined or empty project ID');
          continue;
        }
        
        console.log(`Fetching project ${projectId}`);
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          console.log(`Retrieved project ${projectId}: ${projectData.title}`);
          
          // Use the utility function to ensure all required fields are present
          const project = convertToProjectWithId({
            ...projectData,
            id: projectDoc.id
          });
          
          projects.push(project);
          console.log(`Added project ${projectId} to results`);
        } else {
          console.log(`Project ${projectId} not found in Firestore`);
        }
      } catch (err) {
        console.error(`Error fetching project ${projectId}:`, err);
      }
    }
    
    console.log(`Successfully fetched ${projects.length} projects based on user's project IDs`);
    return projects;
  } catch (error) {
    console.error('Error in getUserProjects:', error);
    return []; // Return empty array instead of throwing
  }
};

// Update project
export const updateProject = async (
  projectId: string, 
  projectData: Partial<Project>
): Promise<Partial<Project>> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Ensure the user is the project owner or an admin
    const projectDataFromDB = projectDoc.data();
    const isFaculty = projectDataFromDB.facultyId === user.uid || projectDataFromDB.mentorId === user.uid;
    
    if (!isFaculty) {
      // You would typically check if the user is an admin here
      throw new Error("You don't have permission to update this project");
    }
    
    // Update the project
    const updateData = {
      ...projectData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(projectRef, updateData);
    
    return updateData;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    throw error;
  }
};

// Archive/unarchive project
export const archiveProject = async (projectId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Ensure the user is the project owner or an admin
    const projectData = projectDoc.data();
    const isFaculty = projectData.facultyId === user.uid || projectData.mentorId === user.uid;
    
    if (!isFaculty) {
      // You would typically check if the user is an admin here
      throw new Error("You don't have permission to archive this project");
    }
    
    // Toggle archive status
    const isCurrentlyArchived = projectData.status === 'archived';
    const newStatus = isCurrentlyArchived ? 'active' : 'archived';
    
    // Update the project
    await updateDoc(projectRef, {
      status: newStatus,
      isActive: newStatus === 'active',
      updatedAt: serverTimestamp()
    });
    
    // Update user's active/archived projects
    const userRef = doc(db, "users", user.uid);
    
    if (isCurrentlyArchived) {
      // Moving from archived to active
      await updateDoc(userRef, {
        activeProjects: arrayUnion(projectId),
        archivedProjects: arrayRemove(projectId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Moving from active to archived
      await updateDoc(userRef, {
        activeProjects: arrayRemove(projectId),
        archivedProjects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`Error archiving project ${projectId}:`, error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Ensure the user is the project owner or an admin
    const projectData = projectDoc.data();
    const isFaculty = projectData.facultyId === user.uid || projectData.mentorId === user.uid;
    
    if (!isFaculty) {
      // You would typically check if the user is an admin here
      throw new Error("You don't have permission to delete this project");
    }
    
    // Use a batch to delete related documents
    const batch = writeBatch(db);
    
    // Delete positions and applications
    const positionsQuery = query(collection(db, "positions"), where("projectId", "==", projectId));
    const positionsSnapshot = await getDocs(positionsQuery);
    
    for (const positionDoc of positionsSnapshot.docs) {
      // Delete applications for this position
      const applicationsQuery = query(collection(db, "applications"), where("positionId", "==", positionDoc.id));
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      applicationsSnapshot.docs.forEach(appDoc => {
        batch.delete(appDoc.ref);
      });
      
      // Delete the position
      batch.delete(positionDoc.ref);
    }
    
    // Delete project materials
    const materialsQuery = query(collection(db, "materials"), where("projectId", "==", projectId));
    const materialsSnapshot = await getDocs(materialsQuery);
    
    for (const materialDoc of materialsSnapshot.docs) {
      // Delete from Storage
      if (materialDoc.data().storageRef) {
        try {
          const storageRef = ref(storage, materialDoc.data().storageRef);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue with deletion even if storage deletion fails
        }
      }
      
      // Delete from Firestore
      batch.delete(materialDoc.ref);
    }
    
    // Delete the project
    batch.delete(projectRef);
    
    // Remove from user's active/archived projects
    const userRef = doc(db, "users", user.uid);
    batch.update(userRef, {
      activeProjects: arrayRemove(projectId),
      archivedProjects: arrayRemove(projectId),
      updatedAt: serverTimestamp()
    });
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw error;
  }
};

// Get project positions
export const getProjectPositions = async (projectId: string): Promise<Position[]> => {
  try {
    const positionsQuery = query(collection(db, "positions"), where("projectId", "==", projectId));
    const positionsSnapshot = await getDocs(positionsQuery);
    
    return positionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Position[];
  } catch (error) {
    console.error(`Error getting positions for project ${projectId}:`, error);
    throw error;
  }
};

// Get project applications with defensive coding
export const getProjectApplications = async (projectId: string): Promise<Application[]> => {
  try {
    console.log(`Fetching applications for project: ${projectId}`);
    
    const positionsQuery = query(collection(db, "positions"), where("projectId", "==", projectId));
    const positionsSnapshot = await getDocs(positionsQuery);
    const positionIds = positionsSnapshot.docs.map(doc => doc.id);
    
    console.log(`Found ${positionIds.length} positions for this project`);
    
    const applications: Application[] = [];
    
    for (const positionId of positionIds) {
      try {
        console.log(`Fetching applications for position: ${positionId}`);
        
        const applicationsQuery = query(collection(db, "applications"), where("positionId", "==", positionId));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        
        console.log(`Found ${applicationsSnapshot.docs.length} applications for position ${positionId}`);
        
        // Add applications with defensive coding for missing fields
        applicationsSnapshot.docs.forEach(doc => {
          try {
            if (doc.exists()) {
              const rawData = doc.data();
              console.log(`Processing application ${doc.id}:`, rawData);
              
              // Create a sanitized version with default values for required fields
              const safeApplication: Application = {
                id: doc.id,
                projectId: projectId,
                positionId: positionId,
                studentId: rawData.studentId || 'unknown',
                studentName: rawData.studentName || 'Unknown Student',
                studentEmail: rawData.studentEmail || 'no-email@example.com',
                status: rawData.status || 'pending',
                submittedAt: rawData.submittedAt || new Date(),
                // Add any other required fields with defaults
              };
              
              // Merge the sanitized data with the raw data
              applications.push({
                ...rawData,
                ...safeApplication
              } as Application);
              
              console.log(`Successfully added application ${doc.id} to results`);
            }
          } catch (appErr) {
            console.error(`Error processing application ${doc.id}:`, appErr);
          }
        });
      } catch (posErr) {
        console.error(`Error fetching applications for position ${positionId}:`, posErr);
      }
    }
    
    // If no applications were found through positions, try direct project query as fallback
    if (applications.length === 0) {
      try {
        console.log(`No applications found through positions, trying direct project query for ${projectId}`);
        const directQuery = query(collection(db, "applications"), where("projectId", "==", projectId));
        const directSnapshot = await getDocs(directQuery);
        
        directSnapshot.docs.forEach(doc => {
          try {
            if (doc.exists()) {
              const rawData = doc.data();
              console.log(`Processing direct application ${doc.id}:`, rawData);
              
              // Create a sanitized version with default values for required fields
              const safeApplication: Application = {
                id: doc.id,
                projectId: projectId,
                positionId: rawData.positionId || 'unknown',
                studentId: rawData.studentId || 'unknown',
                studentName: rawData.studentName || 'Unknown Student',
                studentEmail: rawData.studentEmail || 'no-email@example.com',
                status: rawData.status || 'pending',
                submittedAt: rawData.submittedAt || new Date(),
              };
              
              applications.push({
                ...rawData,
                ...safeApplication
              } as Application);
              
              console.log(`Successfully added direct application ${doc.id} to results`);
            }
          } catch (appErr) {
            console.error(`Error processing direct application ${doc.id}:`, appErr);
          }
        });
      } catch (directErr) {
        console.error(`Error in direct project applications query:`, directErr);
      }
    }
    
    console.log(`Returning ${applications.length} total applications`);
    return applications;
  } catch (error) {
    console.error(`Error getting applications for project ${projectId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

// Update application status
export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'pending' | 'rejected' | 'accepted' | 'hired'
): Promise<void> => {
  try {
    const applicationRef = doc(db, "applications", applicationId);
    
    await updateDoc(applicationRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating application ${applicationId}:`, error);
    throw error;
  }
};

// Hire applicant
export const hireApplicant = async (
  projectId: string, 
  applicationId: string
): Promise<{ success: boolean; teamMember: User | null }> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get application
    const applicationRef = doc(db, "applications", applicationId);
    const applicationDoc = await getDoc(applicationRef);
    
    if (!applicationDoc.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationDoc.data();
    
    // Get student user
    const studentRef = doc(db, "users", applicationData.studentId);
    const studentDoc = await getDoc(studentRef);
    
    if (!studentDoc.exists()) {
      throw new Error("Student not found");
    }
    
    const studentData = studentDoc.data();
    
    // Get project
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Get position
    const positionRef = doc(db, "positions", applicationData.positionId);
    const positionDoc = await getDoc(positionRef);
    
    if (!positionDoc.exists()) {
      throw new Error("Position not found");
    }
    
    // Use a transaction to ensure all operations succeed
    return await runTransaction(db, async (transaction) => {
      // Update application status
      transaction.update(applicationRef, {
        status: 'hired',
        updatedAt: serverTimestamp()
      });
      
      // Update position filledPositions count
      const positionData = positionDoc.data();
      transaction.update(positionRef, {
        filledPositions: (positionData.filledPositions || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      // Add student to project team members
      transaction.update(projectRef, {
        teamMembers: arrayUnion({
          id: studentData.uid,
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: studentData.email,
          role: positionData.title || 'Team Member',
          joinedDate: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });
      
      // Add project to student's participating projects
      transaction.update(studentRef, {
        participatingProjects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
      
      // Create team member object
      const teamMember: User = {
        id: studentData.uid,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        department: studentData.department,
        university: studentData.university,
        projectRole: positionData.title || 'Team Member',
        status: 'active',
        joinedDate: new Date().toISOString(),
      };
      
      return { success: true, teamMember };
    });
  } catch (error) {
    console.error(`Error hiring applicant for application ${applicationId}:`, error);
    throw error;
  }
};

// Get project team members
export const getProjectTeamMembers = async (projectId: string): Promise<User[]> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    const projectData = projectDoc.data();
    const teamMembers = projectData.teamMembers || [];
    
    // Helper for handling timestamp values
    const formatTimestamp = (timestamp: any): string => {
      if (!timestamp) return new Date().toISOString();
      
      try {
        // Handle Firestore Timestamp
        if (typeof timestamp === 'object' && timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toISOString();
        } 
        // Handle Date object
        else if (timestamp instanceof Date) {
          return timestamp.toISOString();
        } 
        // Handle string or any other type
        else {
          return new Date(timestamp).toISOString();
        }
      } catch (e) {
        return new Date().toISOString();
      }
    };
    
    // Fetch detailed user data for each team member
    const teamMembersData: User[] = [];
    
    for (const member of teamMembers) {
      // Skip if member has no ID
      if (!member.id) continue;
      
      try {
        const userRef = doc(db, "users", member.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          teamMembersData.push({
            id: userDoc.id, // Ensure ID is set
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            department: userData.department,
            university: userData.university,
            projectRole: member.role,
            status: 'active',
            joinedDate: formatTimestamp(member.joinedDate),
            notes: userData.notes,
          });
        } else {
          // If user doc doesn't exist, still include with basic info
          teamMembersData.push({
            id: member.id, // Ensure ID is set
            firstName: member.name?.split(' ')[0] || '',
            lastName: member.name?.split(' ').slice(1).join(' ') || '',
            email: member.email || '',
            projectRole: member.role || 'Team Member',
            status: 'active',
            joinedDate: formatTimestamp(member.joinedDate),
          });
        }
      } catch (userError) {
        console.error(`Error fetching team member ${member.id}:`, userError);
        // Include with basic info even if there's an error
        teamMembersData.push({
          id: member.id, // Ensure ID is set
          firstName: member.name?.split(' ')[0] || '',
          lastName: member.name?.split(' ').slice(1).join(' ') || '',
          email: member.email || '',
          projectRole: member.role || 'Team Member',
          status: 'active',
          joinedDate: formatTimestamp(member.joinedDate),
        });
      }
    }
    
    return teamMembersData;
  } catch (error) {
    console.error(`Error getting team members for project ${projectId}:`, error);
    throw error;
  }
};

// Remove team member
export const removeTeamMember = async (projectId: string, userId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Get project
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Ensure the current user is the project owner or an admin
    const projectData = projectDoc.data();
    const isFaculty = projectData.facultyId === currentUser.uid || projectData.mentorId === currentUser.uid;
    
    if (!isFaculty) {
      // You would typically check if the user is an admin here
      throw new Error("You don't have permission to remove team members");
    }
    
    // Get teamMembers array
    const teamMembers = projectData.teamMembers || [];
    
    // Find the team member to remove
    const memberIndex = teamMembers.findIndex((member: any) => member.id === userId);
    
    if (memberIndex === -1) {
      throw new Error("Team member not found in project");
    }
    
    // Remove from teamMembers array
    teamMembers.splice(memberIndex, 1);
    
    // Use a transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      // Update project teamMembers
      transaction.update(projectRef, {
        teamMembers: teamMembers,
        updatedAt: serverTimestamp()
      });
      
      // Remove project from user's participatingProjects
      const userRef = doc(db, "users", userId);
      transaction.update(userRef, {
        participatingProjects: arrayRemove(projectId),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error(`Error removing team member ${userId} from project ${projectId}:`, error);
    throw error;
  }
};

// Update team member role
export const updateTeamMemberRole = async (
  projectId: string, 
  userId: string, 
  newRole: string
): Promise<void> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Get project
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    // Ensure the current user is the project owner or an admin
    const projectData = projectDoc.data();
    const isFaculty = projectData.facultyId === currentUser.uid || projectData.mentorId === currentUser.uid;
    
    if (!isFaculty) {
      // You would typically check if the user is an admin here
      throw new Error("You don't have permission to update team member roles");
    }
    
    // Get teamMembers array
    const teamMembers = projectData.teamMembers || [];
    
    // Find the team member to update
    const memberIndex = teamMembers.findIndex((member: any) => member.id === userId);
    
    if (memberIndex === -1) {
      throw new Error("Team member not found in project");
    }
    
    // Update the role
    teamMembers[memberIndex].role = newRole;
    
    // Update project
    await updateDoc(projectRef, {
      teamMembers: teamMembers,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error(`Error updating role for team member ${userId} in project ${projectId}:`, error);
    throw error;
  }
};

// Get project materials
export const getProjectMaterials = async (projectId: string): Promise<any[]> => {
  try {
    const materialsQuery = query(collection(db, "materials"), where("projectId", "==", projectId));
    const materialsSnapshot = await getDocs(materialsQuery);
    
    return materialsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting materials for project ${projectId}:`, error);
    throw error;
  }
};

// Upload project material
export const uploadProjectMaterial = async (
  projectId: string,
  file: File,
  name: string,
  description: string
): Promise<any> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Create a storage reference
    const storageRef = ref(storage, `projects/${projectId}/materials/${Date.now()}_${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Add to Firestore
    const materialRef = await addDoc(collection(db, "materials"), {
      projectId,
      name,
      description,
      fileUrl: downloadURL,
      storageRef: snapshot.ref.fullPath,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: user.displayName || user.email || 'Unknown',
      uploadedById: user.uid,
      uploadedAt: serverTimestamp(),
    });
    
    return {
      id: materialRef.id,
      name,
      description,
      fileUrl: downloadURL,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: user.displayName || user.email || 'Unknown',
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error uploading material for project ${projectId}:`, error);
    throw error;
  }
};

// Delete project material
export const deleteProjectMaterial = async (projectId: string, materialId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get material
    const materialRef = doc(db, "materials", materialId);
    const materialDoc = await getDoc(materialRef);
    
    if (!materialDoc.exists()) {
      throw new Error("Material not found");
    }
    
    // Delete from Storage if there's a reference
    if (materialDoc.data().storageRef) {
      const storageRef = ref(storage, materialDoc.data().storageRef);
      await deleteObject(storageRef);
    }
    
    // Delete from Firestore
    await deleteDoc(materialRef);
    
  } catch (error) {
    console.error(`Error deleting material ${materialId} from project ${projectId}:`, error);
    throw error;
  }
};