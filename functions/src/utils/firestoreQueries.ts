import { db } from "../config/firebase";
import {
  ProjectWithId,
  PositionWithId,
  User,
} from "../types";
import { Timestamp } from "firebase-admin/firestore";

type ProjectWithPositions = ProjectWithId & {
  positions: PositionWithId[]
};

/**
 * Get all active projects with their positions
 * @returns Array of projects with positions
 */
export async function getAllActiveProjectsWithPositions(): Promise<ProjectWithPositions[]> {
  const projectsSnapshot = await db.collection("projects")
    .where("isActive", "==", true)
    .where("status", "==", "active")
    .get();

  const projectsWithPositions = await Promise.all(
    projectsSnapshot.docs.map(async (doc) => {
      const project = { id: doc.id, ...doc.data() } as ProjectWithId;

      // Get positions for this project
      const positionsSnapshot = await doc.ref.collection("positions").get();
      const positions = positionsSnapshot.docs.map(
        (posDoc) => ({ id: posDoc.id, ...posDoc.data() }) as PositionWithId
      );

      return { ...project, positions };
    })
  );

  return projectsWithPositions;
}

/**
 * Get projects matching student interests
 * @param studentId - The student's ID
 * @returns Array of matching projects
 */
export async function getProjectsMatchingStudentInterests(studentId: string): Promise<ProjectWithId[]> {
  // Get student data
  const studentDoc = await db.collection("users").doc(studentId).get();
  if (!studentDoc.exists) {
    throw new Error("Student not found");
  }

  const studentData = studentDoc.data() as User;
  const interests = studentData.interests || [];

  if (interests.length === 0) {
    // If no interests, return all active projects
    const projectsSnapshot = await db.collection("projects")
      .where("isActive", "==", true)
      .where("status", "==", "active")
      .limit(20)
      .get();

    return projectsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ProjectWithId
    );
  }

  // Get projects from the same department first
  let departmentProjects: ProjectWithId[] = [];

  // Only query by department if it exists
  if (studentData.department) {
    const departmentProjectsSnapshot = await db.collection("projects")
      .where("isActive", "==", true)
      .where("status", "==", "active")
      .where("department", "==", studentData.department)
      .limit(10)
      .get();

    departmentProjects = departmentProjectsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ProjectWithId
    );
  }

  // If we have enough department projects, return them
  if (departmentProjects.length >= 10) {
    return departmentProjects;
  }

  // Otherwise, get projects matching interests
  // Note: This requires a composite index on projects collection
  const matchingProjectsSnapshot = await db.collection("projects")
    .where("isActive", "==", true)
    .where("status", "==", "active")
    .limit(20 - departmentProjects.length)
    .get();

  // Filter projects by interests manually (since we can't use array-contains-any with other conditions)
  const matchingProjects = matchingProjectsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as ProjectWithId)
    .filter((project) => {
      // Check if any project keywords match student interests
      const projectKeywords = project.keywords || [];
      return projectKeywords.some((keyword) => interests.includes(keyword));
    });

  // Combine department projects and interest-matching projects
  const projectIds = new Set(departmentProjects.map((p) => p.id));
  const combinedProjects = [
    ...departmentProjects,
    ...matchingProjects.filter((p) => !projectIds.has(p.id)),
  ];

  return combinedProjects;
}

/**
 * Get all projects a student has applied to
 * @param studentId - The student's ID
 * @returns Array of projects with application status
 */
export async function getStudentApplicationProjects(studentId: string): Promise<
  (ProjectWithId & {
    position: PositionWithId,
    applicationStatus: string,
    applicationId: string,
    appliedAt: Timestamp
  })[]
> {
  const result: (ProjectWithId & {
    position: PositionWithId,
    applicationStatus: string,
    applicationId: string,
    appliedAt: Timestamp
  })[] = [];

  // Get all projects
  const projectsSnapshot = await db.collection("projects").get();

  // For each project, check positions and applications
  for (const projectDoc of projectsSnapshot.docs) {
    const project = { id: projectDoc.id, ...projectDoc.data() } as ProjectWithId;
    const positionsSnapshot = await projectDoc.ref.collection("positions").get();

    for (const positionDoc of positionsSnapshot.docs) {
      const position = { id: positionDoc.id, ...positionDoc.data() } as PositionWithId;

      // Check if student has applied to this position
      const applicationsSnapshot = await positionDoc.ref
        .collection("applications")
        .where("studentId", "==", studentId)
        .get();

      if (!applicationsSnapshot.empty) {
        const applicationDoc = applicationsSnapshot.docs[0];
        const applicationData = applicationDoc.data();

        result.push({
          ...project,
          position,
          applicationStatus: applicationData.status,
          applicationId: applicationDoc.id,
          appliedAt: applicationData.submittedAt,
        });
      }
    }
  }

  // Sort by application date (newest first)
  return result.sort((a, b) => b.appliedAt.toMillis() - a.appliedAt.toMillis());
}

/**
 * Get all projects a student has saved
 * @param studentId - The student's ID
 * @returns Array of saved projects
 */
export async function getStudentSavedProjects(studentId: string): Promise<ProjectWithId[]> {
  // Get student data
  const studentDoc = await db.collection("users").doc(studentId).get();
  if (!studentDoc.exists) {
    throw new Error("Student not found");
  }

  const studentData = studentDoc.data() as User;
  const savedProjectIds = studentData.projectPreferences?.savedProjects || [];

  if (savedProjectIds.length === 0) {
    return [];
  }

  // Get all saved projects
  // Note: Firestore has a limit of 10 items in 'in' queries, so we may need to batch
  const savedProjects: ProjectWithId[] = [];

  // Process in batches of 10
  for (let i = 0; i < savedProjectIds.length; i += 10) {
    const batch = savedProjectIds.slice(i, i + 10);
    const batchSnapshot = await db.collection("projects")
      .where("__name__", "in", batch)
      .get();

    savedProjects.push(
      ...batchSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ProjectWithId)
    );
  }

  return savedProjects;
}

/**
 * Get all faculty projects with applications
 * @param facultyId - The faculty member's ID
 * @returns Array of projects with applications
 */
export async function getFacultyProjectsWithApplications(facultyId: string): Promise<
  (ProjectWithId & {
    positions: (PositionWithId & {
      applications: {
        id: string,
        studentName: string,
        status: string,
        submittedAt: Timestamp
      }[]
    })[]
  })[]
> {
  // Get all projects for this faculty
  const projectsSnapshot = await db.collection("projects")
    .where("mentorId", "==", facultyId)
    .get();

  const projectsWithApplications = await Promise.all(
    projectsSnapshot.docs.map(async (projectDoc) => {
      const project = { id: projectDoc.id, ...projectDoc.data() } as ProjectWithId;

      // Get positions for this project
      const positionsSnapshot = await projectDoc.ref.collection("positions").get();
      const positions = await Promise.all(
        positionsSnapshot.docs.map(async (positionDoc) => {
          const position = { id: positionDoc.id, ...positionDoc.data() } as PositionWithId;

          // Get applications for this position
          const applicationsSnapshot = await positionDoc.ref.collection("applications").get();
          const applications = applicationsSnapshot.docs.map((appDoc) => {
            const appData = appDoc.data();
            return {
              id: appDoc.id,
              studentName: appData.studentName,
              status: appData.status,
              submittedAt: appData.submittedAt,
            };
          });

          return { ...position, applications };
        })
      );

      return { ...project, positions };
    })
  );

  return projectsWithApplications;
}

/**
 * Search projects by keywords
 * @param query - The search query
 * @returns Array of matching projects
 */
export async function searchProjects(query: string): Promise<ProjectWithId[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  // Normalize query
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter((term) => term.length > 2);

  if (queryTerms.length === 0) {
    return [];
  }

  // Get all active projects
  const projectsSnapshot = await db.collection("projects")
    .where("isActive", "==", true)
    .where("status", "==", "active")
    .get();

  // Filter projects by search terms
  const matchingProjects = projectsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as ProjectWithId)
    .filter((project) => {
      const title = project.title.toLowerCase();
      const description = project.description.toLowerCase();
      const department = project.department ? project.department.toLowerCase() : "";

      // Check if any search term is in the title, description, or department
      return queryTerms.some((term) =>
        title.includes(term) ||
        description.includes(term) ||
        department.includes(term)
      );
    });

  return matchingProjects;
}

/**
 * Get university statistics
 * @param universityId - The university ID
 * @returns University statistics
 */
export async function getUniversityStats(universityId: string): Promise<{
  studentCount: number;
  facultyCount: number;
  projectCount: number;
  applicationCount: number;
  departmentStats: Record<string, {
    name: string;
    projectCount: number;
    facultyCount: number;
  }>;
}> {
  // Get university document
  const universityDoc = await db.collection("universities").doc(universityId).get();
  if (!universityDoc.exists) {
    throw new Error("University not found");
  }

  // Get counts from university document
  const universityData = universityDoc.data() || {};
  const studentCount = universityData.studentCount || 0;
  const facultyCount = universityData.facultyCount || 0;

  // Get all projects for this university
  const projectsSnapshot = await db.collection("projects")
    .where("universityId", "==", universityId)
    .get();

  const projectCount = projectsSnapshot.size;

  // Get department stats
  const departmentsSnapshot = await db.collection("universities")
    .doc(universityId)
    .collection("departments")
    .get();

  const departmentStats: Record<string, {
    name: string;
    projectCount: number;
    facultyCount: number;
  }> = {};

  departmentsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    departmentStats[doc.id] = {
      name: data.name,
      projectCount: data.projectCount || 0,
      facultyCount: data.facultyCount || 0,
    };
  });

  // Count all applications
  let applicationCount = 0;

  for (const projectDoc of projectsSnapshot.docs) {
    const positionsSnapshot = await projectDoc.ref.collection("positions").get();

    for (const positionDoc of positionsSnapshot.docs) {
      const applicationsSnapshot = await positionDoc.ref.collection("applications").get();
      applicationCount += applicationsSnapshot.size;
    }
  }

  return {
    studentCount,
    facultyCount,
    projectCount,
    applicationCount,
    departmentStats,
  };
}
