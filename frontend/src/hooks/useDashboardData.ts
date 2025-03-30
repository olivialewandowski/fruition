'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStudentApplications, 
  getStudentTopProjects, 
  getMaxTopProjects,
  toggleTopProject,
  removeTopProject,
} from '@/services/studentService';
import { getUserProjects } from '@/services/clientProjectService';
import { Application } from '@/types/application';
import { Project } from '@/types/project';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User } from '@/types/user';
import { getSampleProjects } from '@/services/projectsService';
import { ConnectProject } from '@/types/project';
import { getProjects } from '@/services/projectsService';
import { useAuth } from '@/contexts/AuthContext';

// Define centralized query keys for consistent cache management
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

// Helper function to get current user from context
const useCurrentUser = () => {
  const auth = getAuth();
  const { user } = useAuth();
  // Always return the uid to avoid null checks everywhere
  return { userId: user?.uid || auth.currentUser?.uid || '', user };
};

/**
 * Standardized hook for student applications
 */
export function useStudentApplications() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.studentApplications(userId),
    queryFn: () => getStudentApplications(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Standardized hook for student top projects
 */
export function useStudentTopProjects() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.studentTopProjects(userId),
    queryFn: () => getStudentTopProjects(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Standardized hook for max top projects
 */
export function useMaxTopProjects() {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.maxTopProjects(userId),
    queryFn: () => getMaxTopProjects(),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour (this rarely changes)
  });
}

/**
 * Standardized hook for user projects
 */
export function useUserProjects(tabType: 'active' | 'archived') {
  const { userId } = useCurrentUser();
  
  return useQuery({
    queryKey: QueryKeys.userProjects(userId, tabType),
    queryFn: () => getUserProjects(tabType),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Standardized hook for toggle top project with mutation
 */
export function useToggleTopProject() {
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  
  return useMutation({
    mutationFn: (projectId: string) => toggleTopProject(projectId),
    onSuccess: () => {
      // Use proper QueryKeys format for invalidation
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentApplications() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices() });
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
    mutationFn: (projectId: string) => removeTopProject(projectId),
    onSuccess: () => {
      // Use proper QueryKeys format for invalidation
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentApplications() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices() });
    },
  });
}

/**
 * Utility hook to get combined data for top projects with application details
 */
export function useTopProjectsWithDetails() {
  const applicationsQuery = useStudentApplications();
  const topProjectsQuery = useStudentTopProjects();
  
  const isLoading = applicationsQuery.isLoading || topProjectsQuery.isLoading;
  const error = applicationsQuery.error || topProjectsQuery.error;
  
  // Combine the data to get detailed top projects
  const topProjectsWithDetails = useMemo(() => {
    if (!applicationsQuery.data || !topProjectsQuery.data) return [];
    
    return topProjectsQuery.data.map(id => {
      const matchingApp = applicationsQuery.data.find(app => app.project.id === id);
      return {
        id,
        title: matchingApp ? matchingApp.project.title : `Project ${id.substring(0, 6)}...`,
        application: matchingApp
      };
    });
  }, [applicationsQuery.data, topProjectsQuery.data]);
  
  return {
    topProjectsWithDetails,
    isLoading,
    error,
    refetch: () => {
      applicationsQuery.refetch();
      topProjectsQuery.refetch();
    }
  };
}

/**
 * Hook to get eligible applications for top project selection
 */
export function useEligibleApplicationsForTopProjects() {
  const applicationsQuery = useStudentApplications();
  const topProjectsQuery = useStudentTopProjects();
  
  const eligibleApplications = useMemo(() => {
    if (!applicationsQuery.data || !topProjectsQuery.data) return [];
    
    return applicationsQuery.data.filter(app => 
      !topProjectsQuery.data.includes(app.project.id) && 
      ['pending', 'reviewing', 'interviewing', 'accepted'].includes(app.status)
    );
  }, [applicationsQuery.data, topProjectsQuery.data]);
  
  return {
    eligibleApplications,
    isLoading: applicationsQuery.isLoading || topProjectsQuery.isLoading,
    error: applicationsQuery.error || topProjectsQuery.error
  };
}

/**
 * Update useUserSkills to use the centralized query keys
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
 * Update useRecommendedProjects to use the centralized query keys
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
 * Simple recommendation algorithm that matches student skills with project skills
 */
function findProjectsWithMatchingSkills(projects: ConnectProject[], skills: string[]): ConnectProject[] {
  if (!skills.length) return projects.slice(0, 3); // Return some default if no skills
  
  return projects
    .filter(project => {
      // Skip projects without skills
      if (!project.skills || project.skills.length === 0) return false;
      
      // Check for any skill overlap
      return project.skills.some(skill => 
        skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      // Count matching skills for ranking
      const aMatches = countMatchingSkills(a.skills || [], skills);
      const bMatches = countMatchingSkills(b.skills || [], skills);
      return bMatches - aMatches; // Higher matches first
    });
}

/**
 * Helper to count matching skills
 */
function countMatchingSkills(projectSkills: string[], userSkills: string[]): number {
  let matches = 0;
  for (const pSkill of projectSkills) {
    for (const uSkill of userSkills) {
      if (pSkill.toLowerCase().includes(uSkill.toLowerCase()) || 
          uSkill.toLowerCase().includes(pSkill.toLowerCase())) {
        matches++;
      }
    }
  }
  return matches;
}

/**
 * Modern React Query hook for applications data
 */
export function useApplicationsData(params: {
  userId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
}) {
  const { userId, timeRange = 'month', limit = 10 } = params;
  
  return useQuery({
    queryKey: QueryKeys.applicationsData(userId, timeRange),
    queryFn: async () => {
      // Calculate date range based on timeRange
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Query applications for this user within the date range
      const applicationsRef = collection(db, 'applications');
      const applicationsQuery = query(
        applicationsRef,
        where('studentId', '==', userId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(applicationsQuery);
      
      // Initialize data structures
      const applicationsByDate: Record<string, number> = {};
      const applicationsByStatus: Record<string, number> = {};
      const recentApplications: Array<{
        id: string;
        projectId: string;
        projectName: string;
        status: string;
        appliedAt: Date;
      }> = [];
      
      // Process each application
      querySnapshot.forEach((doc) => {
        // Properly type the application data
        const application = { id: doc.id, ...doc.data() } as any;
        
        // Safely convert Firebase timestamp to Date
        let date: Date;
        try {
          date = application.createdAt?.toDate() || new Date();
        } catch (e) {
          // Fallback if timestamp conversion fails
          console.warn('Invalid date in application document, using current date as fallback');
          date = new Date();
        }
        
        // Format date as YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        
        // Count applications by date
        applicationsByDate[dateStr] = (applicationsByDate[dateStr] || 0) + 1;
        
        // Count applications by status
        const status = application.status || 'pending';
        applicationsByStatus[status] = (applicationsByStatus[status] || 0) + 1;
        
        // Add to recent applications if within limit
        if (recentApplications.length < limit) {
          recentApplications.push({
            id: application.id,
            projectId: application.projectId,
            projectName: application.projectName || 'Unknown Project',
            status: status,
            appliedAt: date,
          });
        }
      });

      const result = {
        totalApplications: querySnapshot.size,
        applicationsByDate,
        applicationsByStatus,
        recentApplications,
      };
      
      // Format data for chart
      const sortedDates = Object.keys(applicationsByDate).sort();
      const formattedLabels = sortedDates.map(date => {
        const [year, month, day] = date.split('-');
        return `${month}/${day}`;
      });
      
      const chartData = {
        labels: formattedLabels,
        datasets: [
          {
            label: 'Applications',
            data: sortedDates.map(date => applicationsByDate[date]),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: true,
          },
        ],
      };
      
      return {
        data: result,
        chartData,
      };
    },
    // Keep fresh for 1 minute
    staleTime: 60 * 1000,
  });
}

/**
 * Comprehensive hook for the Top Choices Widget
 * Combines multiple queries and mutations for better data management
 */
export function useTopChoicesWidget() {
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  
  // Query for applications
  const applicationsQuery = useStudentApplications();
  
  // Query for top projects
  const topProjectsQuery = useStudentTopProjects();
  
  // Query for maximum allowed top projects
  const maxTopProjectsQuery = useMaxTopProjects();
  
  // Get loading and error states
  const isLoading = 
    applicationsQuery.isLoading || 
    topProjectsQuery.isLoading || 
    maxTopProjectsQuery.isLoading;
    
  const error = 
    applicationsQuery.error || 
    topProjectsQuery.error || 
    maxTopProjectsQuery.error;
  
  // Mutation for removing a top project
  const removeTopProjectMutation = useMutation({
    mutationFn: removeTopProject,
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      await queryClient.cancelQueries({ queryKey: QueryKeys.studentApplications(userId) });
      
      // Snapshot the previous value
      const previousTopProjects = queryClient.getQueryData(QueryKeys.studentTopProjects(userId));
      
      // Optimistically update the cache with the removal
      queryClient.setQueryData(
        QueryKeys.studentTopProjects(userId),
        (old: string[] = []) => old.filter(id => id !== projectId)
      );
      
      return { previousTopProjects };
    },
    onError: (err, projectId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTopProjects) {
        queryClient.setQueryData(
          QueryKeys.studentTopProjects(userId),
          context.previousTopProjects
        );
      }
      console.error('Error removing top project:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server state
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentApplications(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices(userId) });
    }
  });
  
  // Mutation for toggling a top project (add or remove)
  const toggleTopProjectMutation = useMutation({
    mutationFn: toggleTopProject,
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      await queryClient.cancelQueries({ queryKey: QueryKeys.studentApplications(userId) });
      
      // Snapshot the previous value
      const previousTopProjects = queryClient.getQueryData(QueryKeys.studentTopProjects(userId));
      
      // Check if it's already in the top projects
      const isCurrentlyTop = previousTopProjects 
        ? (previousTopProjects as string[]).includes(projectId)
        : false;
      
      // Optimistically update the cache
      if (isCurrentlyTop) {
        // If it's already a top project, remove it
        queryClient.setQueryData(
          QueryKeys.studentTopProjects(userId),
          (old: string[] = []) => old.filter(id => id !== projectId)
        );
      } else {
        // If it's not a top project, add it
        queryClient.setQueryData(
          QueryKeys.studentTopProjects(userId),
          (old: string[] = []) => [...old, projectId]
        );
      }
      
      return { previousTopProjects };
    },
    onError: (err, projectId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTopProjects) {
        queryClient.setQueryData(
          QueryKeys.studentTopProjects(userId),
          context.previousTopProjects
        );
      }
      console.error('Error toggling top project:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server state
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentTopProjects(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.studentApplications(userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.topChoices(userId) });
    }
  });
  
  // Calculate top projects with details
  const topProjectsWithDetails = useMemo(() => {
    if (!applicationsQuery.data || !topProjectsQuery.data) return [];
    
    return topProjectsQuery.data.map(id => {
      const matchingApp = applicationsQuery.data.find(app => app.project.id === id);
      return {
        id,
        title: matchingApp ? matchingApp.project.title : `Project ${id.substring(0, 6)}...`
      };
    });
  }, [applicationsQuery.data, topProjectsQuery.data]);
  
  // Get eligible applications (not already in top projects and with valid status)
  const eligibleApplications = useMemo(() => {
    if (!applicationsQuery.data || !topProjectsQuery.data) return [];
    
    return applicationsQuery.data.filter(app => 
      !topProjectsQuery.data.includes(app.project.id) && 
      ['pending', 'reviewing', 'interviewing', 'accepted'].includes(app.status)
    );
  }, [applicationsQuery.data, topProjectsQuery.data]);
  
  return {
    // Data
    topProjects: topProjectsWithDetails,
    applications: applicationsQuery.data || [],
    eligibleApplications,
    maxTopProjects: maxTopProjectsQuery.data || 0,
    
    // Status
    isLoading,
    isRemoving: removeTopProjectMutation.isPending || toggleTopProjectMutation.isPending,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    
    // Actions with enhanced mutation functions that return promises
    removeTopProject: (projectId: string, options?: any) => {
      return removeTopProjectMutation.mutateAsync(projectId, options);
    },
    toggleTopProject: (projectId: string, options?: any) => {
      return toggleTopProjectMutation.mutateAsync(projectId, options);
    },
    
    // Refetch with forced refetching
    refetch: () => {
      applicationsQuery.refetch({ throwOnError: true });
      topProjectsQuery.refetch({ throwOnError: true });
      maxTopProjectsQuery.refetch({ throwOnError: true });
    }
  };
}

/**
 * Hook for fetching dashboard metrics
 * This hook provides data for the MetricsWidget
 */
export interface MetricItem {
  label: string;
  value: number | string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
  color?: 'blue' | 'violet' | 'green' | 'amber' | 'red' | 'gray';
}

export function useMetricsData(userId?: string) {
  // Query for applications (used to calculate metrics)
  const applicationsQuery = useStudentApplications();
  
  // For user projects count
  const activeProjectsQuery = useUserProjects('active');
  
  return useQuery({
    queryKey: QueryKeys.metricsData(userId || 'current'),
    queryFn: async () => {
      // Wait for applications data to be available
      if (!applicationsQuery.data) {
        return [];
      }
      
      // Calculate application metrics
      const totalApplications = applicationsQuery.data.length;
      
      // Count applications by status
      const statusCounts: Record<string, number> = {};
      applicationsQuery.data.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      
      // Generate metrics array
      const metrics: MetricItem[] = [
        { 
          label: 'Total Applications', 
          value: totalApplications,
          change: { value: 12.5, isPositive: true }, // Mock change value
          color: 'blue'
        },
        { 
          label: 'Accepted', 
          value: statusCounts['accepted'] || 0,
          change: { value: 8.7, isPositive: true },
          color: 'green'
        },
        { 
          label: 'Pending', 
          value: (statusCounts['pending'] || 0) + (statusCounts['reviewing'] || 0),
          change: { value: 5.2, isPositive: false },
          color: 'amber'
        }
      ];
      
      // Add active projects metric if available
      if (activeProjectsQuery.data) {
        metrics.push({
          label: 'Active Projects',
          value: activeProjectsQuery.data.length,
          color: 'violet',
          change: { value: 3.1, isPositive: true },
        });
      } else {
        // Fallback to completion rate if project data not available
        metrics.push({
          label: 'Completion Rate',
          value: '92',
          suffix: '%',
          color: 'violet',
          change: { value: 3.1, isPositive: true },
        });
      }
      
      return metrics;
    },
    // Only run this query when applications data is available
    enabled: !applicationsQuery.isLoading,
    // Applications data is the source of truth, so this can match its stale time
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Activity item type for activity feed
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string | Date;
  type: 'success' | 'view' | 'notification' | 'message' | 'document' | string;
  isRead?: boolean;
}

/**
 * Hook for fetching activity feed data
 * @param userId Optional user ID to fetch specific user data
 * @param maxItems Maximum number of items to return
 */
export const useActivityFeedData = (userId?: string, maxItems: number = 10) => {
  const queryClient = useQueryClient();
  
  // Query for activity feed data
  return useQuery({
    queryKey: [QueryKeys.activityFeed(userId), maxItems],
    queryFn: async () => {
      // Mock implementation - in a real app, this would call an API
      // This simulates fetching activities from an API
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulated activities data
      const activities: ActivityItem[] = [
        {
          id: '1',
          title: 'Application Accepted',
          description: 'Your application for Project Alpha was accepted',
          timestamp: '2 hours ago',
          type: 'success',
        },
        {
          id: '2',
          title: 'Project Viewed',
          description: 'Your Project Beta was viewed by 5 faculty members',
          timestamp: 'Yesterday',
          type: 'view',
        },
        {
          id: '3',
          title: 'New Message',
          description: 'Professor Smith sent you a message about your application',
          timestamp: '3 days ago',
          type: 'message',
        },
        {
          id: '4',
          title: 'Deadline Reminder',
          description: 'Project submission deadline is approaching in 5 days',
          timestamp: '4 days ago',
          type: 'notification',
        },
        {
          id: '5',
          title: 'Document Updated',
          description: 'Your project proposal document was updated',
          timestamp: 'Last week',
          type: 'document',
        },
      ].slice(0, maxItems);
      
      return activities;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 