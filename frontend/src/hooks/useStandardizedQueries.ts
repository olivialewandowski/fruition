'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStudentApplications, 
  getStudentTopProjects, 
  getMaxTopProjects,
  toggleTopProject,
  removeTopProject,
} from '@/services/studentService';
import { getUserProjects } from '@/services/clientProjectService';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types/user';
import { getSampleProjects } from '@/services/projectsService';
import { ConnectProject } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Central query keys for consistent cache management
 * Each key function returns an array that uniquely identifies the query
 */
export const QueryKeys = {
  studentApplications: (userId?: string) => ['studentApplications', userId],
  studentTopProjects: (userId?: string) => ['studentTopProjects', userId],
  maxTopProjects: (userId?: string) => ['maxTopProjects', userId],
  userProjects: (userId?: string, tabType?: string) => ['userProjects', userId, tabType],
  userSkills: (userId?: string) => ['userSkills', userId],
  recommendedProjects: (userId?: string) => ['recommendedProjects', userId],
  applicationsData: (userId?: string, timeRange?: string) => ['applicationsData', userId, timeRange],
  topChoices: (userId?: string) => ['topChoices', userId],
  metricsData: (userId?: string) => ['metricsData', userId],
  activityFeed: (userId?: string) => ['activityFeed', userId],
};

/**
 * Hook to get current user with fallbacks
 * Returns a consistent userId that's never undefined
 */
export const useCurrentUser = () => {
  const auth = getAuth();
  const { user } = useAuth();
  // Always return the uid to avoid null checks everywhere
  return { userId: user?.uid || auth.currentUser?.uid || '', user };
};

/**
 * Hook to fetch student applications
 * Standardized pattern with consistent error handling
 */
export function useStudentApplications() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.studentApplications(userId),
    queryFn: async () => {
      try {
        return await getStudentApplications();
      } catch (error) {
        console.error('Error fetching student applications:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch student top projects
 */
export function useStudentTopProjects() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.studentTopProjects(userId),
    queryFn: async () => {
      try {
        return await getStudentTopProjects();
      } catch (error) {
        console.error('Error fetching student top projects:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch max top projects allowed
 */
export function useMaxTopProjects() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.maxTopProjects(userId),
    queryFn: async () => {
      try {
        return await getMaxTopProjects();
      } catch (error) {
        console.error('Error fetching max top projects:', error);
        return 3; // Default fallback value
      }
    },
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour (this rarely changes)
  });
}

/**
 * Hook to fetch user projects by tab type
 */
export function useUserProjects(tabType: 'active' | 'archived') {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.userProjects(userId, tabType),
    queryFn: async () => {
      try {
        return await getUserProjects(tabType);
      } catch (error) {
        console.error(`Error fetching ${tabType} projects:`, error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to toggle a project's top status
 * Uses mutation with proper query invalidation
 */
export function useToggleTopProject() {
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      try {
        return await toggleTopProject(projectId);
      } catch (error) {
        console.error('Error toggling top project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices(userId) });
    },
  });
}

/**
 * Hook to remove a project from top projects
 */
export function useRemoveTopProject() {
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      try {
        return await removeTopProject(projectId);
      } catch (error) {
        console.error('Error removing top project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // After success, invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices(userId) });
    },
  });
}

/**
 * Hook to fetch user skills
 */
export function useUserSkills(overrideUserId?: string) {
  const { userId: currentUserId } = useCurrentUser();
  const userId = overrideUserId || currentUserId;
  
  return useQuery({
    queryKey: QueryKeys.userSkills(userId),
    queryFn: async () => {
      try {
        if (!userId) return [];
        
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return [];
        
        const userData = userDoc.data() as User;
        return userData.skills || [];
      } catch (error) {
        console.error('Error fetching user skills:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch recommended projects based on user skills
 */
export function useRecommendedProjects(overrideUserId?: string) {
  const { userId: currentUserId } = useCurrentUser();
  const userId = overrideUserId || currentUserId;
  const { data: userSkills } = useUserSkills(userId);
  
  return useQuery({
    queryKey: QueryKeys.recommendedProjects(userId),
    queryFn: async () => {
      try {
        if (!userSkills || userSkills.length === 0) return [];
        
        // Get sample projects (this would be replaced with a real API call)
        const projects = await getSampleProjects();
        
        // Find projects that match the user's skills
        return findProjectsWithMatchingSkills(projects, userSkills as string[]);
      } catch (error) {
        console.error('Error fetching recommended projects:', error);
        return [];
      }
    },
    enabled: !!userId && !!userSkills && userSkills.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Helper function to find projects with matching skills
 */
function findProjectsWithMatchingSkills(projects: ConnectProject[], skills: string[]): ConnectProject[] {
  if (!skills || skills.length === 0) return [];
  
  // Projects with skills that match the user's skills
  const matchingProjects = projects.filter(project => {
    if (!project.skills || project.skills.length === 0) return false;
    
    // Check for skill matches
    return project.skills.some(projectSkill => 
      skills.some(userSkill => 
        userSkill.toLowerCase().includes(projectSkill.toLowerCase()) || 
        projectSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  });
  
  // Sort by number of matching skills (most matches first)
  return matchingProjects.sort((a, b) => {
    const aMatches = a.skills ? countMatchingSkills(a.skills, skills) : 0;
    const bMatches = b.skills ? countMatchingSkills(b.skills, skills) : 0;
    return bMatches - aMatches;
  });
}

/**
 * Helper function to count matching skills
 */
function countMatchingSkills(projectSkills: string[], userSkills: string[]): number {
  let count = 0;
  
  for (const projectSkill of projectSkills) {
    for (const userSkill of userSkills) {
      if (
        projectSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
        userSkill.toLowerCase().includes(projectSkill.toLowerCase())
      ) {
        count++;
        break; // Count each project skill only once
      }
    }
  }
  
  return count;
} 