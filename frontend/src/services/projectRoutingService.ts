// src/services/projectRoutingService.ts
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to handle project routing based on user role
 * This ensures students are directed to their version of project pages
 * and faculty/admin users to their version
 */
export const useProjectRouting = (projectId: string | null | undefined) => {
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Don't do anything if loading or if no projectId
    if (loading || !projectId) return;
    
    // If user is a student but is on a faculty project page, redirect to student project page
    if (userData?.role === 'student' && window.location.pathname.includes(`/development/projects/${projectId}`)) {
      router.push(`/development/student/${projectId}`);
    }
    
    // If user is faculty/admin but is on a student project page, redirect to faculty project page
    if ((userData?.role === 'faculty' || userData?.role === 'admin') && 
        window.location.pathname.includes(`/development/student/${projectId}`)) {
      router.push(`/development/projects/${projectId}`);
    }
  }, [userData, projectId, loading, router]);
  
  return null;
};

/**
 * Helper function to get the correct project URL based on user role
 * Can be used when constructing links programmatically
 */
export const getProjectUrl = (projectId: string, userRole?: string): string => {
  if (userRole === 'student') {
    return `/development/student/${projectId}`;
  }
  
  return `/development/projects/${projectId}`;
};