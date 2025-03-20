import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from '@heroicons/react/24/solid';
import { Application } from '@/types/application';
import { Project } from '@/types/project';
import { toast } from 'react-hot-toast';

interface ActiveProjectsDropdownProps {
  applications: (Application & { project: Project })[];
  topProjects: string[];
  maxTopProjects: number;
  onTopProjectToggled: (projectId: string, isCurrentlyTop: boolean) => Promise<void>;
  initialVisibleCount?: number;
}

const ActiveProjectsDropdown: React.FC<ActiveProjectsDropdownProps> = ({
  applications,
  topProjects,
  maxTopProjects,
  onTopProjectToggled,
  initialVisibleCount = 3
}) => {
  const [expanded, setExpanded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filter only active applications (not yet marked as top)
  const activeApplications = applications.filter(app => 
    !topProjects.includes(app.project.id) && 
    // Only show active applications eligible for top choices 
    ['pending', 'reviewing', 'interviewing', 'accepted'].includes(app.status)
  );
  
  const visibleApplications = expanded
    ? activeApplications
    : activeApplications.slice(0, initialVisibleCount);

  const canAddMore = topProjects.length < maxTopProjects;
  const hasMoreToShow = activeApplications.length > initialVisibleCount;

  // Handle adding project to top choices
  const handleAddToTopChoices = async (projectId: string) => {
    if (actionInProgress || !canAddMore) return;
    
    setActionInProgress(projectId);
    
    try {
      await onTopProjectToggled(projectId, false);
      toast.success('Added to your top choices!');
    } catch (error) {
      console.error('Error updating top project status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update top project';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Get application status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Reviewing</span>;
      case 'interviewing':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">Interviewing</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Accepted</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  if (activeApplications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
        <h3 className="text-md font-medium text-gray-900 flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
          Add More Top Choices
        </h3>
        <p className="text-sm text-gray-600">
          {canAddMore 
            ? `You can select ${maxTopProjects - topProjects.length} more top ${maxTopProjects - topProjects.length === 1 ? 'choice' : 'choices'} from your active applications`
            : 'You have used all your top choice slots'}
        </p>
      </div>

      <ul className="divide-y divide-gray-200">
        {visibleApplications.map((application) => (
          <li 
            key={application.id} 
            className="px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {application.project.title}
                  </p>
                  <div className="ml-2">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {application.project.department || 'No department'} • {application.project.mentorName || 'No mentor'}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {application.project.description?.substring(0, 100)}...
                </p>
                
                {application.project.skills && application.project.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {application.project.skills.slice(0, 2).map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.project.skills.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{application.project.skills.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleAddToTopChoices(application.project.id)}
                disabled={!canAddMore || actionInProgress === application.project.id}
                className={`ml-2 shrink-0 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
                  ${canAddMore 
                    ? 'text-white bg-purple-600 hover:bg-purple-700' 
                    : 'text-gray-500 bg-gray-100 cursor-not-allowed'}
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {actionInProgress === application.project.id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <StarIcon className="mr-1 h-3 w-3" />
                    Add as Top
                  </span>
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {hasMoreToShow && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-purple-600 font-medium flex items-center justify-center w-full hover:text-purple-800 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Show More ({activeApplications.length - initialVisibleCount} more)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsDropdown; 