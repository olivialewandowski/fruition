// src/services/studentService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
import { Application } from "../types/application";
import { Project } from "../types/project";
import { Position } from "../types/position";

// Get applications for the current student
export const getStudentApplications = async (): Promise<(Application & { project: Project, position: Position })[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log("Getting applications for student:", user.uid);
    
    // Array to store all applications
    let allApplications: (Application & { project: Project, position: Position })[] = [];
    
    // 1. Query applications for this student from the top-level applications collection
    const applicationsQuery = query(
      collection(db, "applications"), 
      where("studentId", "==", user.uid)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    console.log(`Found ${applicationsSnapshot.size} applications in top-level collection for student:`, user.uid);
    
    // Process applications from top-level
    if (!applicationsSnapshot.empty) {
      const topLevelApplicationsPromises = applicationsSnapshot.docs.map(async (appDoc) => {
        try {
          const applicationData = appDoc.data() as Application;
          
          // Get position data
          const positionRef = doc(db, "positions", applicationData.positionId);
          const positionDoc = await getDoc(positionRef);
          
          if (!positionDoc.exists()) {
            console.warn(`Position ${applicationData.positionId} not found for application ${appDoc.id}`);
            return null;
          }
          
          const positionData = positionDoc.data() as Position;
          
          // Get project data
          const projectRef = doc(db, "projects", positionData.projectId);
          const projectDoc = await getDoc(projectRef);
          
          if (!projectDoc.exists()) {
            console.warn(`Project ${positionData.projectId} not found for application ${appDoc.id}`);
            return null;
          }
          
          const projectData = projectDoc.data() as Project;
          
          // Return combined data
          return {
            ...applicationData,
            id: appDoc.id,
            project: {
              ...projectData,
              id: projectDoc.id
            },
            position: {
              ...positionData,
              id: positionDoc.id
            }
          };
        } catch (err) {
          console.error(`Error processing application ${appDoc.id}:`, err);
          return null;
        }
      });
      
      const topLevelApplications = await Promise.all(topLevelApplicationsPromises);
      allApplications = [...allApplications, ...topLevelApplications.filter(Boolean) as any[]];
    }
    
    // 2. Now check for applications in project/position subcollections
    // First get all projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    console.log(`Checking ${projectsSnapshot.size} projects for applications in subcollections`);
    
    // For each project, check positions and applications
    const projectPromises = projectsSnapshot.docs.map(async (projectDoc) => {
      const projectData = projectDoc.data() as Project;
      const projectId = projectDoc.id;
      
      // Get all positions for this project
      const positionsSnapshot = await getDocs(collection(db, "projects", projectId, "positions"));
      
      // For each position, check applications
      const positionPromises = positionsSnapshot.docs.map(async (positionDoc) => {
        const positionData = positionDoc.data() as Position;
        const positionId = positionDoc.id;
        
        // Query applications for this student in this position
        const positionApplicationsQuery = query(
          collection(db, "projects", projectId, "positions", positionId, "applications"),
          where("studentId", "==", user.uid)
        );
        
        const positionApplicationsSnapshot = await getDocs(positionApplicationsQuery);
        
        // Map each application to the expected format
        return positionApplicationsSnapshot.docs.map(appDoc => {
          const applicationData = appDoc.data() as Application;
          
          return {
            ...applicationData,
            id: appDoc.id,
            project: {
              ...projectData,
              id: projectId
            },
            position: {
              ...positionData,
              id: positionId
            }
          };
        });
      });
      
      // Flatten positions results
      const positionResults = await Promise.all(positionPromises);
      return positionResults.flat();
    });
    
    const subcollectionApplications = (await Promise.all(projectPromises)).flat();
    console.log(`Found ${subcollectionApplications.length} applications in subcollections for student:`, user.uid);
    
    // Combine applications, removing duplicates by ID
    allApplications = [...allApplications, ...subcollectionApplications];
    
    // Remove duplicates by application ID
    const uniqueApplications = Array.from(
      new Map(allApplications.map(app => [app.id, app])).values()
    );
    
    console.log(`Total unique applications found for student ${user.uid}: ${uniqueApplications.length}`);
    
    // Sort by submitted date (newest first)
    return uniqueApplications.sort((a, b) => {
      // Handle different possible types for submittedAt
      const getTimeValue = (value: any): number => {
        if (!value) return 0;
        if (typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
          // Handle Firestore Timestamp
          return value.toDate().getTime();
        } else if (value instanceof Date) {
          // Handle Date object
          return value.getTime();
        } else {
          // Handle string or any other type by trying to create a Date
          try {
            return new Date(value).getTime();
          } catch (e) {
            return 0;
          }
        }
      };
      
      return getTimeValue(b.submittedAt) - getTimeValue(a.submittedAt);
    });
  } catch (error) {
    console.error("Error getting student applications:", error);
    throw error;
  }
};

// Get projects the student is a member of
export const getStudentProjects = async (): Promise<Project[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get user document to check participating projects
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    const participatingProjectIds = userData.participatingProjects || [];
    
    if (participatingProjectIds.length === 0) {
      return [];
    }
    
    // Get projects the student is participating in
    const projects: Project[] = [];
    
    for (const projectId of participatingProjectIds) {
      const projectRef = doc(db, "projects", projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        projects.push({
          id: projectDoc.id,
          ...projectDoc.data()
        } as Project);
      }
    }
    
    return projects;
  } catch (error) {
    console.error("Error getting student projects:", error);
    throw error;
  }
};

// Get materials for a project the student is a member of
export const getStudentProjectMaterials = async (projectId: string): Promise<any[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // First check if the student is a member of this project
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const participatingProjectIds = userData.participatingProjects || [];
    
    if (!participatingProjectIds.includes(projectId)) {
      throw new Error("You are not a member of this project");
    }
    
    // Get materials for the project
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

// Get project team members for a project the student is a member of
export const getStudentProjectTeamMembers = async (projectId: string): Promise<any[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // First check if the student is a member of this project
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const participatingProjectIds = userData.participatingProjects || [];
    
    if (!participatingProjectIds.includes(projectId)) {
      throw new Error("You are not a member of this project");
    }
    
    // Get project to access team members
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    const projectData = projectDoc.data();
    const teamMembers = projectData.teamMembers || [];
    
    // Get detailed user data for each team member
    const teamMembersData = await Promise.all(
      teamMembers.map(async (member: any) => {
        try {
          const memberRef = doc(db, "users", member.id);
          const memberDoc = await getDoc(memberRef);
          
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            
            return {
              id: memberDoc.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              email: memberData.email,
              department: memberData.department,
              university: memberData.university,
              role: member.role,
              joinedDate: member.joinedDate,
            };
          }
          
          // If user doc doesn't exist, return basic info
          return {
            id: member.id,
            firstName: member.name?.split(' ')[0] || '',
            lastName: member.name?.split(' ').slice(1).join(' ') || '',
            email: member.email || '',
            role: member.role,
            joinedDate: member.joinedDate,
          };
        } catch (error) {
          console.error(`Error fetching team member ${member.id}:`, error);
          
          // Return basic info if there's an error
          return {
            id: member.id,
            firstName: member.name?.split(' ')[0] || '',
            lastName: member.name?.split(' ').slice(1).join(' ') || '',
            email: member.email || '',
            role: member.role,
            joinedDate: member.joinedDate,
          };
        }
      })
    );
    
    return teamMembersData;
  } catch (error) {
    console.error(`Error getting team members for project ${projectId}:`, error);
    throw error;
  }
};

// ========= Top Projects Management Functions =========

/**
 * Get the top projects for the current student
 * @returns Array of project IDs marked as top projects
 */
export const getStudentTopProjects = async (): Promise<string[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get user document to retrieve top projects
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log("User document does not exist for", user.uid);
      return [];
    }
    
    // Extract top projects
    const userData = userDoc.data();
    let topProjects = userData?.projectPreferences?.topProjects || [];
    
    // Ensure it's an array
    if (!Array.isArray(topProjects)) {
      console.warn("Top projects is not an array:", topProjects);
      topProjects = [];
    }
    
    // Get all student applications to filter out rejected ones
    const applications = await getStudentApplications();
    if (applications.length > 0) {
      // Create a map of project ID to application status
      const applicationStatusMap = new Map();
      applications.forEach(app => {
        applicationStatusMap.set(app.project.id, app.status);
      });
      
      // Filter out projects with rejected/closed applications
      topProjects = topProjects.filter((projectId: string) => {
        const status = applicationStatusMap.get(projectId);
        // Keep only if application is still active (not rejected or closed)
        return !status || !['rejected', 'closed', 'cancelled', 'declined', 'deleted'].includes(status);
      });
      
      // If we had to filter out some top projects, update the user document
      const originalLength = userData?.projectPreferences?.topProjects?.length || 0;
      if (originalLength > topProjects.length) {
        console.log(`Removed ${originalLength - topProjects.length} rejected applications from top projects`);
        await updateDoc(userRef, {
          "projectPreferences.topProjects": topProjects
        });
      }
    }
    
    return topProjects;
  } catch (error) {
    console.error("Error getting student top projects:", error);
    return [];
  }
};

/**
 * Get the maximum number of top projects allowed for the student
 * This is calculated as 5% of the total applications
 * @returns The maximum number of top projects allowed (minimum 1)
 */
export const getMaxTopProjects = async (): Promise<number> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get user document to check applied projects
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return 1; // Default to 1 if no user data
    }
    
    const userData = userDoc.data();
    const appliedCount = userData.projectPreferences?.appliedProjects?.length || 0;
    
    // Calculate 5% of applications (rounded up), minimum 1
    return Math.max(1, Math.ceil(appliedCount * 0.05));
  } catch (error) {
    console.error("Error calculating max top projects:", error);
    return 1; // Default to 1 on error
  }
};

/**
 * Add a project to the student's top projects list
 * @param projectId The ID of the project to mark as top
 * @returns True if successful, throws error otherwise
 */
export const addTopProject = async (projectId: string): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get current top projects
    const topProjects = await getStudentTopProjects();
    const maxAllowed = await getMaxTopProjects();
    
    // Check if already at max limit
    if (topProjects.length >= maxAllowed) {
      throw new Error(`You can only mark ${maxAllowed} projects as top choices (5% of your applications)`);
    }
    
    // Check if project is already in top projects
    if (topProjects.includes(projectId)) {
      return true; // Already in top projects
    }
    
    // Update user document
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      "projectPreferences.topProjects": arrayUnion(projectId)
    });
    
    // Find and update the application document
    const applicationsQuery = query(
      collection(db, "applications"),
      where("studentId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    if (!applicationsSnapshot.empty) {
      const batch = writeBatch(db);
      
      applicationsSnapshot.docs.forEach(appDoc => {
        batch.update(appDoc.ref, { isTopChoice: true });
      });
      
      await batch.commit();
    }
    
    return true;
  } catch (error) {
    console.error("Error adding top project:", error);
    throw error;
  }
};

/**
 * Remove a project from the student's top projects list
 * @param projectId The ID of the project to remove from top list
 * @returns True if successful, throws error otherwise
 */
export const removeTopProject = async (projectId: string): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Update user document
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      "projectPreferences.topProjects": arrayRemove(projectId)
    });
    
    // Find and update the application document
    const applicationsQuery = query(
      collection(db, "applications"),
      where("studentId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    if (!applicationsSnapshot.empty) {
      const batch = writeBatch(db);
      
      applicationsSnapshot.docs.forEach(appDoc => {
        batch.update(appDoc.ref, { isTopChoice: false });
      });
      
      await batch.commit();
    }
    
    return true;
  } catch (error) {
    console.error("Error removing top project:", error);
    throw error;
  }
};

/**
 * Check if a project is in the student's top list
 * @param projectId The ID of the project to check
 * @returns True if project is in top list, false otherwise
 */
export const isTopProject = async (projectId: string): Promise<boolean> => {
  try {
    const topProjects = await getStudentTopProjects();
    return topProjects.includes(projectId);
  } catch (error) {
    console.error("Error checking if project is top choice:", error);
    return false;
  }
};

/**
 * Toggle a project's status in the student's top projects list
 * If it's currently a top project, remove it; otherwise add it
 * @param projectId The ID of the project to toggle
 * @returns True if the project is now a top choice, false if it was removed
 */
export const toggleTopProject = async (projectId: string): Promise<boolean> => {
  try {
    // First check if project is currently a top project
    const isCurrentlyTop = await isTopProject(projectId);
    
    if (isCurrentlyTop) {
      // If it's already a top project, remove it
      return !(await removeTopProject(projectId));
    } else {
      // If not a top project, check the application status before adding
      const applications = await getStudentApplications();
      const application = applications.find(app => app.project.id === projectId);
      
      // Don't allow adding rejected/closed applications as top choices
      if (application && ['rejected', 'closed', 'cancelled', 'declined', 'deleted'].includes(application.status)) {
        console.warn(`Cannot add ${projectId} as top choice because status is ${application.status}`);
        throw new Error(`Cannot mark a ${application.status} application as a top choice`);
      }
      
      // Add it as a top project
      return await addTopProject(projectId);
    }
  } catch (error) {
    console.error("Error toggling top project status:", error);
    throw error;
  }
};

/**
 * Handle all necessary updates when an application is rejected
 * This ensures a consistent state across the database
 * 
 * @param applicationId The ID of the rejected application
 * @param projectId The ID of the project
 * @returns A promise that resolves when all updates are complete
 */
export const handleApplicationRejection = async (applicationId: string, projectId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log(`Handling rejection for application ${applicationId} on project ${projectId}`);
    
    // Use a batch write for atomicity
    const batch = writeBatch(db);
    
    // 1. Update application status to rejected
    const applicationRef = doc(db, "applications", applicationId);
    batch.update(applicationRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    // 2. Get user document to check if this project is in top choices
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const topProjects = userData.projectPreferences?.topProjects || [];
      
      // If project is in top choices, remove it
      if (Array.isArray(topProjects) && topProjects.includes(projectId)) {
        console.log(`Removing rejected project ${projectId} from top choices`);
        
        const updatedTopProjects = topProjects.filter(id => id !== projectId);
        
        batch.update(userRef, {
          "projectPreferences.topProjects": updatedTopProjects,
          updatedAt: serverTimestamp()
        });
      }
      
      // 3. Add to rejectedProjects array if not already there
      const rejectedProjects = userData.projectPreferences?.rejectedProjects || [];
      
      if (!Array.isArray(rejectedProjects) || !rejectedProjects.includes(projectId)) {
        batch.update(userRef, {
          "projectPreferences.rejectedProjects": arrayUnion(projectId),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // 4. Also update the project/positions subcollection application if it exists
    try {
      // Find the application in positions subcollection
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        const positions = await getDocs(collection(db, "projects", projectId, "positions"));
        
        for (const positionDoc of positions.docs) {
          const positionId = positionDoc.id;
          const applicationsQuery = query(
            collection(db, "projects", projectId, "positions", positionId, "applications"),
            where("studentId", "==", user.uid)
          );
          
          const applicationsSnapshot = await getDocs(applicationsQuery);
          
          if (!applicationsSnapshot.empty) {
            const subApplicationDoc = applicationsSnapshot.docs[0];
            batch.update(
              doc(db, "projects", projectId, "positions", positionId, "applications", subApplicationDoc.id),
              {
                status: 'rejected',
                updatedAt: serverTimestamp()
              }
            );
          }
        }
      }
    } catch (err) {
      console.warn("Could not update subcollection application:", err);
      // Continue with the batch - don't fail the entire operation
    }
    
    // 5. Commit all changes atomically
    await batch.commit();
    
    console.log(`Successfully processed application rejection for ${applicationId}`);
  } catch (error) {
    console.error("Error handling application rejection:", error);
    throw error;
  }
};