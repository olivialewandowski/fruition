// services/waitlistProjectsService.ts

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
   * Adds a new project to the waitlistprojects collection via API
   * @param projectData - The project data to add
   * @return The document ID of the created project
   */
export async function addProjectToWaitlist(projectData: ProjectData): Promise<string> {
  try {
    // Instead of immediately saving, we'll just return a success
    // The actual saving will happen in the WaitlistDialog with the user's email
    console.log("Project data staged for submission:", projectData);

    // Return a temporary ID - actual saving happens when user completes registration
    return "temp-" + Date.now();
  } catch (error) {
    console.error("Error staging project for waitlist:", error);
    throw error;
  }
}
