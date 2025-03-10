// src/services/directProjectService.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { Project } from "../types/project";
import { Position } from "../types/position";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Create a project using a cloud function
 * This bypasses client-side restrictions and delegates validation to the server
 * 
 * @param projectData The project data to create
 * @param positionData The position data to create
 * @returns Promise resolving to the created project ID
 */
export const createProjectDirect = async (
  projectData: Partial<Project>, 
  positionData: Partial<Position>
): Promise<string> => {
  try {
    console.log('Initiating direct project creation');
    
    const functions = getFunctions();
    const createProjectFn = httpsCallable(functions, 'createProjectDirect');
    
    // Include client timestamp for debugging
    const requestData = {
      projectData: {
        ...projectData,
        clientTimestamp: new Date().toISOString()
      },
      positionData: {
        ...positionData,
        clientTimestamp: new Date().toISOString()
      }
    };
    
    console.log('Sending data to createProjectDirect function:', JSON.stringify(requestData, null, 2));
    
    const result = await createProjectFn(requestData);
    
    // The result.data should contain { projectId: string, success: boolean }
    const responseData = result.data as { 
      projectId: string;
      success: boolean;
      message?: string;
    };
    
    console.log('Result from createProjectDirect:', responseData);
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Project creation failed');
    }
    
    // Also update the user's activeProjects array locally to ensure UI updates properly
    // This is a safeguard in case the cloud function didn't update it
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          let userData = userDoc.data();
          let activeProjects = userData.activeProjects || [];
          
          // Make sure activeProjects is an array
          if (!Array.isArray(activeProjects)) {
            activeProjects = [];
          }
          
          // Only update if project ID is not already in activeProjects
          if (!activeProjects.includes(responseData.projectId)) {
            console.log(`Adding project ${responseData.projectId} to user's active projects`);
            await updateDoc(userRef, {
              activeProjects: arrayUnion(responseData.projectId),
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    } catch (localUpdateError) {
      console.warn('Could not update local activeProjects, but project was created:', localUpdateError);
      // Continue with project creation, don't throw here as the project was created
    }
    
    return responseData.projectId;
  } catch (error) {
    console.error('Error calling createProjectDirect function:', error);
    // Rethrow with more descriptive message
    throw new Error(`Project creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};