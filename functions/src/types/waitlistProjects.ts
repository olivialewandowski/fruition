// functions/src/types/waitlistProjects.ts

/**
 * Represents a waitlist project entry
 */
export interface WaitlistProject {
    title: string;
    description: string;
    qualifications: string;
    positionType: string;
    userEmail?: string;
    createdAt: string;
  }

/**
   * Represents a waitlist project entry with its document ID
   */
export interface WaitlistProjectWithId extends WaitlistProject {
    id: string;
  }
