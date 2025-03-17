// src/services/studentService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
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