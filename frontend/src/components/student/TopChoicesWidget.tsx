import React, { useState, useEffect, useCallback } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  getStudentTopProjects, 
  removeTopProject, 
  getMaxTopProjects,
  getStudentApplications
} from '@/services/studentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

/**
 * A standalone widget for managing top project choices
 * Can be imported and used anywhere in the application
 */
const TopChoicesWidget: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topProjects, setTopProjects] = useState<Array<{id: string, title: string}>>([]);
  const [maxTopProjects, setMaxTopProjects] = useState(1);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Refetch data when needed
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get list of top project IDs
      const topProjectIds = await getStudentTopProjects();
      
      // Get max allowed top projects
      const maxAllowed = await getMaxTopProjects();
      setMaxTopProjects(maxAllowed);
      
      // Get all applications to find project details
      const applications = await getStudentApplications();
      
      // Map top project IDs to their details from applications
      const projectsWithDetails = topProjectIds.map(id => {
        const matchingApp = applications.find(app => app.project.id === id);
        return {
          id,
          title: matchingApp ? matchingApp.project.title : `Project ${id.substring(0, 6)}...`
        };
      });
      
      setTopProjects(projectsWithDetails);
    } catch (err) {
      console.error('Error loading top projects:', err);
      setError('Failed to load your top choices');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load top projects data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle removing a project from top choices
  const handleRemoveTopProject = async (projectId: string) => {
    if (!user || isRemoving) return;
    
    setIsRemoving(projectId);
    
    try {
      await removeTopProject(projectId);
      
      // Update local state
      setTopProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Show success message
      toast.success('Project removed from top choices');
      
      // Refresh user data in the auth context
      await refreshUserData();
    } catch (err) {
      console.error('Error removing top project:', err);
      
      // Show detailed error message if available
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to remove project from top choices';
      
      toast.error(errorMessage);
      
      // Refresh data to ensure UI is in sync with backend
      fetchData();
    } finally {
      setIsRemoving(null);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-500 text-center py-2">
          {error}
          <button 
            onClick={() => fetchData()}
            className="block mx-auto mt-2 text-sm text-purple-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - don't show widget if no top choices and no available slots
  if (topProjects.length === 0 && maxTopProjects === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" role="region" aria-labelledby="top-choices-heading">
      <div className="border-b border-gray-200 px-4 py-3 bg-yellow-50">
        <h3 id="top-choices-heading" className="text-lg font-medium text-gray-900 flex items-center">
          <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" aria-hidden="true" />
          Your Top Choices
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Using {topProjects.length} of {maxTopProjects} available slots
        </p>
      </div>
      
      <div className="p-4">
        {topProjects.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>You haven't selected any top choice projects yet.</p>
            <p className="text-sm mt-2">
              Mark projects as top choices to indicate your highest interest to faculty.
            </p>
            <Link
              href="/development/dashboard?tab=applied"
              className="mt-4 inline-block text-purple-600 hover:text-purple-800 text-sm font-medium"
              aria-label="Go to Applied Projects to select top choices"
            >
              Go to Applied Projects
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100" aria-label="Your top choice projects">
            {topProjects.map(project => (
              <li key={project.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <StarIconSolid className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{project.title}</span>
                </div>
                <button
                  onClick={() => handleRemoveTopProject(project.id)}
                  disabled={isRemoving === project.id}
                  className={`text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors ${
                    isRemoving === project.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Remove from top choices"
                  aria-label={`Remove ${project.title} from top choices`}
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Students can mark up to 5% of their applications as top choices.
            Faculty will see these applications as high priority.
          </p>
          <Link
            href="/development/dashboard?tab=applied"
            className="mt-2 inline-block text-purple-600 hover:text-purple-800 text-sm font-medium"
            aria-label="Go to Applied Projects tab to manage your top choices"
          >
            Manage Top Choices
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopChoicesWidget); 