import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{title}</h3>
        <div className="w-full h-px bg-gray-200 mb-4"></div>
        <p className="text-base text-gray-600 line-clamp-5 mb-4">{description}</p>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button className="text-base text-violet-700 font-medium hover:text-violet-900 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;