'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../common/DashboardCard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRecommendedProjects, useUserSkills } from '@/hooks/useDashboardData';

export interface RecommendedProjectWidgetProps {
  userId?: string; // Made optional for backward compatibility
  className?: string;
  withDashboardCard?: boolean; // Option to render with or without the dashboard card wrapper
}

/**
 * Dashboard widget that shows recommended research projects based on user skills
 */
const RecommendedProjectWidget: React.FC<RecommendedProjectWidgetProps> = ({ 
  userId,
  className = '',
  withDashboardCard = true
}) => {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Get user skills and recommended projects using hooks
  const userSkillsQuery = useUserSkills(userId);
  const recommendedProjectsQuery = useRecommendedProjects(userId);
  
  const isLoading = userSkillsQuery.isLoading || recommendedProjectsQuery.isLoading;
  const recommendedProject = recommendedProjectsQuery.data?.[0] || null;
  const userSkills = userSkillsQuery.data || [];

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleViewDetails = () => {
    if (recommendedProject?.id) {
      // Navigate to project details page
      router.push(`/development/connect/projects/${recommendedProject.id}`);
    }
  };

  // Don't render during SSR
  if (!hasMounted) {
    return null;
  }

  // Content of the widget
  const widgetContent = (
    <>
      {!isLoading && !recommendedProject ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No recommended projects found.</p>
          <p className="text-sm text-gray-400 mt-1">Update your skills to see matching opportunities.</p>
        </div>
      ) : recommendedProject && (
        <div className="flex flex-col h-full">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{recommendedProject.title}</h3>
            <p className="text-sm text-gray-500">
              {recommendedProject.faculty} • {recommendedProject.department}
            </p>
          </div>
          
          <p className="text-gray-700 mb-4 text-sm line-clamp-3">{recommendedProject.description}</p>
          
          {recommendedProject.skills && recommendedProject.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
              {recommendedProject.skills.map((skill, index) => (
                <span 
                  key={index}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userSkills.some(userSkill => 
                      userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                      skill.toLowerCase().includes(userSkill.toLowerCase())
                    ) 
                      ? 'bg-violet-100 text-violet-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-auto">
            <button
              onClick={handleViewDetails}
              className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Option to render with or without the dashboard card wrapper
  if (withDashboardCard) {
    return (
      <DashboardCard
        title="Recommended Research Opportunity"
        subtitle="Based on your skills"
        className={`${className}`}
        isLoading={isLoading}
        action={
          <button
            onClick={handleViewDetails}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center"
            aria-label="View more recommended projects"
            disabled={!recommendedProject}
          >
            More
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
        }
      >
        {widgetContent}
      </DashboardCard>
    );
  }
  
  // Return direct content without card wrapper
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Recommended Research Opportunity</h2>
          <p className="text-sm text-gray-500">Based on your skills</p>
        </div>
        {!isLoading && recommendedProject && (
          <button
            onClick={handleViewDetails}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center"
            aria-label="View more recommended projects"
          >
            More
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>
      {widgetContent}
    </div>
  );
};

export default RecommendedProjectWidget; 