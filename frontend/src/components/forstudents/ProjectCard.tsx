// components/forstudents/ProjectCard.tsx
import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
  faculty?: string;
  department?: string;
  keywords?: string[];
  onClick?: () => void;
  featured?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  faculty,
  department,
  keywords = [],
  onClick,
  featured = false
}) => {
  // Get a shortened version of the description for display
  const shortenedDescription = description.length > 160
    ? `${description.substring(0, 160)}...` 
    : description;

  // Ensure consistent display of faculty/department
  const displayFaculty = faculty || 'Team Lead';
  const displayDepartment = department || 'Project';

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full w-full max-w-sm flex flex-col ${
        featured ? 'ring-4 ring-purple-500/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6 flex-grow">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{title}</h3>
        </div>
        
        <div className="text-sm text-violet-600 font-medium mb-3">
          {displayFaculty} • {displayDepartment}
        </div>
        
        <div className="w-full h-px bg-gray-200 mb-4"></div>
        <p className="text-base text-gray-600 line-clamp-3 mb-4">{shortenedDescription}</p>
        
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.slice(0, 3).map((keyword, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{keywords.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between mt-auto">
        <button
          className="text-sm text-violet-700 font-medium hover:text-violet-900 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Save
        </button>
        <button
          className="text-sm bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;