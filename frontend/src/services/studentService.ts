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
    
    // Query applications for this student
    const applicationsQuery = query(
      collection(db, "applications"), 
      where("studentId", "==", user.uid)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    // Return empty array if no applications found
    if (applicationsSnapshot.empty) {
      console.log("No applications found for student:", user.uid);
      return [];
    }
    
    console.log(`Found ${applicationsSnapshot.size} applications for student:`, user.uid);
    
    // Build applications with project and position data
    const applicationsWithDetails = await Promise.all(
      applicationsSnapshot.docs.map(async (appDoc) => {
        const applicationData = appDoc.data() as Application;
        
        // Log the application data for debugging
        console.log("Application data:", applicationData);
        
        // Get position data
        const positionRef = doc(db, "positions", applicationData.positionId);
        const positionDoc = await getDoc(positionRef);
        
        if (!positionDoc.exists()) {
          throw new Error(`Position ${applicationData.positionId} not found`);
        }
        
        const positionData = positionDoc.data() as Position;
        
        // Get project data
        const projectRef = doc(db, "projects", positionData.projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (!projectDoc.exists()) {
          throw new Error(`Project ${positionData.projectId} not found`);
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
      })
    );
    
    // Sort by submitted date (newest first)
    return applicationsWithDetails.sort((a, b) => {
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
    
    // Get user document
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    return userData.projectPreferences?.topProjects || [];
  } catch (error) {
    console.error("Error getting student top projects:", error);
    throw error;
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
    const isCurrentlyTop = await isTopProject(projectId);
    
    if (isCurrentlyTop) {
      await removeTopProject(projectId);
      return false;
    } else {
      await addTopProject(projectId);
      return true;
    }
  } catch (error) {
    console.error("Error toggling top project status:", error);
    throw error;
  }
};