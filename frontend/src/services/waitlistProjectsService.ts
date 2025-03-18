// services/waitlistProjectsService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Interface for project data input
 */
export interface ProjectData {
  title: string;
  description: string;
  qualifications: string;
  positionType: string;
}

/**
 * Adds a new project directly to Firestore (Production-ready version)
 */
export async function addProjectToWaitlist(project: ProjectData): Promise<string> {
  try {
    console.log("Adding project to waitlistprojects collection");
    
    // Add environment info to help with debugging
    const env = process.env.NODE_ENV || 'development';
    
    // Create a production-ready data object
    const projectData = {
      ...project,
      createdAt: new Date().toISOString(), // Use ISO string for better cross-platform compatibility
      status: 'pending',
      source: 'landing_page',
      environment: env,
      clientTimestamp: new Date().toISOString()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'waitlistprojects'), projectData);
    
    console.log("Project added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    // Enhanced error logging
    console.error('Error adding project to waitlist:', error);
    
    // Try to provide more details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}