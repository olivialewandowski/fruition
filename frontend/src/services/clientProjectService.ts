// src/services/clientProjectService.ts
import { 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    updateDoc, 
    serverTimestamp,
    query,
    getDocs,
    where,
    writeBatch,
    runTransaction
  } from "firebase/firestore";
  import { db } from "../config/firebase";
  import { getAuth } from "firebase/auth";
  import { Position } from "../types/position";
  import { Project, ProjectWithId, convertToProjectWithId } from "../types/project";
  
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
        projectIds = userData.projectPreferences?.appliedProjects || [];
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
      throw error;
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