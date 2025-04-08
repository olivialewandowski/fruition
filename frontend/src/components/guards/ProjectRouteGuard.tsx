// src/components/guards/ProjectRouteGuard.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProjectRouteGuardProps {
  projectId: string;
  children: React.ReactNode;
}

/**
 * A component that ensures users are directed to the appropriate project view
 * based on their role. Students use the student project view, while faculty
 * and admins use the faculty project view.
 */
const ProjectRouteGuard: React.FC<ProjectRouteGuardProps> = ({ projectId, children }) => {
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    
    const currentPath = window.location.pathname;
    const isStudentPath = currentPath.includes(`/development/student/${projectId}`);
    const isProjectPath = currentPath.includes(`/development/projects/${projectId}`);
    
    // Ensure students are on the student path
    if (userData?.role === 'student' && isProjectPath && !isStudentPath) {
      router.push(`/development/student/${projectId}`);
    }
    
    // Ensure faculty/admin are on the project path
    if ((userData?.role === 'faculty' || userData?.role === 'admin') && isStudentPath && !isProjectPath) {
      router.push(`/development/projects/${projectId}`);
    }
  }, [userData, projectId, loading, router]);
  
  // Show loading state while checking
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  // After checks, render children
  return <>{children}</>;
};

export default ProjectRouteGuard;