'use client';

import React, { useState } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useTopChoicesWidget } from '@/hooks/useDashboardData';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import DashboardCard from './common/DashboardCard';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { useAuth } from '@/contexts/AuthContext';

interface TopChoicesWidgetProps {
  className?: string;
  withDashboardCard?: boolean;
  title?: string;
}

/**
 * A widget for displaying and managing a student's top project choices
 * Compatible with the modular dashboard architecture
 */
const TopChoicesWidget: React.FC<TopChoicesWidgetProps> = ({ 
  className = '',
  withDashboardCard = true,
  title = 'Your Top Choices'
}) => {
  const { refreshUserData } = useAuth();
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedAdd, setExpandedAdd] = useState(false);
  
  // Use our centralized hook for data management
  const {
    topProjects,
    eligibleApplications,
    maxTopProjects,
    isLoading,
    isRemoving,
    error,
    removeTopProject,
    toggleTopProject,
    refetch
  } = useTopChoicesWidget();

  // Handle removing a project from top choices
  const handleRemoveTopProject = async (projectId: string) => {
    if (isRemoving) return;
    
    try {
      removeTopProject(projectId);
      toast.success('Project removed from top choices');
      await refreshUserData();
    } catch (err) {
      console.error('Error removing top project:', err);
      toast.error('Failed to remove project from top choices');
    }
  };

  // Handle adding a project to top choices
  const handleAddTopProject = async (projectId: string) => {
    if (isRemoving) return;
    
    if (topProjects.length >= maxTopProjects) {
      toast.error(`You can only mark ${maxTopProjects} projects as top choices`);
      return;
    }
    
    try {
      toggleTopProject(projectId);
      toast.success('Project added to top choices');
      await refreshUserData();
    } catch (err) {
      console.error('Error adding top project:', err);
      toast.error('Failed to add project to top choices');
    }
  };

  // Show 3 applications initially, or all if expanded
  const visibleApplications = expandedAdd
    ? eligibleApplications
    : eligibleApplications.slice(0, 3);

  const hasRemainingSlots = topProjects.length < maxTopProjects;
  const hasMoreToShow = eligibleApplications.length > 3;

  // Widget content component that can be used with or without the DashboardCard wrapper
  const TopChoicesContent = () => {
    // Loading skeleton
    if (isLoading) {
      return <DashboardWidgetSkeleton rows={2} hasHeader={false} />;
    }

    // Error state
    if (error) {
      return (
        <div className="text-red-500 text-center py-2">
          {error}
          <button 
            onClick={() => refetch()}
            className="block mx-auto mt-2 text-sm text-purple-600 hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }

    // Empty state - don't show widget if no top choices and no available slots
    if (topProjects.length === 0 && maxTopProjects === 0) {
      return null;
    }

    return (
      <>
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            Using {topProjects.length} of {maxTopProjects} available slots
          </p>
        </div>
        
        {topProjects.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>You haven't selected any top choice projects yet.</p>
            <p className="text-sm mt-2">
              Mark projects as top choices to indicate your highest interest to faculty.
            </p>
            {hasRemainingSlots && eligibleApplications.length > 0 ? (
              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <StarIconSolid className="h-4 w-4 mr-1" />
                Add Top Choices
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            {/* List of current top projects */}
            {topProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200"
              >
                <div className="flex items-center">
                  <StarIconSolid className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">{project.title}</span>
                </div>
                <button
                  onClick={() => handleRemoveTopProject(project.id)}
                  disabled={!!isRemoving}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Remove from top choices"
                >
                  {isRemoving ? (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <XMarkIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
            
            {/* Add more button */}
            {hasRemainingSlots && eligibleApplications.length > 0 && (
              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
              >
                {showAddSection ? 'Hide Options' : 'Add More'}
                {showAddSection ? (
                  <ChevronUpIcon className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                )}
              </button>
            )}
          </div>
        )}
        
        {/* Add section for selecting more top projects */}
        {showAddSection && eligibleApplications.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Select from your active applications:
            </h4>
            <div className="space-y-2">
              {visibleApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <StarIconOutline className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 line-clamp-1">{app.project.title}</span>
                  </div>
                  <button
                    onClick={() => handleAddTopProject(app.project.id)}
                    disabled={!!isRemoving}
                    className="text-purple-600 hover:text-purple-800 p-1"
                    aria-label="Add to top choices"
                  >
                    {isRemoving ? (
                      <div className="h-4 w-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    ) : (
                      <StarIconSolid className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
              
              {/* Show more/less button */}
              {hasMoreToShow && (
                <button
                  onClick={() => setExpandedAdd(!expandedAdd)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center mt-2"
                >
                  {expandedAdd ? 'Show Less' : `Show ${eligibleApplications.length - 3} More`}
                  {expandedAdd ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* View all applications link */}
        <div className="mt-4 text-center">
          <Link
            href="/development/match?tab=applied"
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            View All Applications
          </Link>
        </div>
      </>
    );
  };

  // Option to render with or without the dashboard card wrapper
  if (withDashboardCard) {
    return (
      <DashboardCard
        title={title}
        className={className}
        isLoading={isLoading}
      >
        <div className="flex items-center mb-2">
          <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" aria-hidden="true" />
          <span className="text-sm text-gray-700">Top Choices</span>
        </div>
        <TopChoicesContent />
      </DashboardCard>
    );
  }

  // Return direct content without card wrapper
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`} role="region" aria-labelledby="top-choices-heading">
      <div className="border-b border-gray-200 px-4 py-3 bg-yellow-50">
        <h3 id="top-choices-heading" className="text-lg font-medium text-gray-900 flex items-center">
          <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" aria-hidden="true" />
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Using {topProjects.length} of {maxTopProjects} available slots
        </p>
      </div>
      
      <div className="p-4">
        <TopChoicesContent />
      </div>
    </div>
  );
};

export default React.memo(TopChoicesWidget); 