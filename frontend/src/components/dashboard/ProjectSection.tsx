import React from 'react';
import DashboardProjectCard from './DashboardProjectCard';

interface ProjectWithId {
  id?: string;
  title: string;
  description: string;
  status?: string;
  mentorId?: string;
  keywords?: string[];
  createdAt?: any;
}

interface ProjectSectionProps {
  title: string;
  projects: ProjectWithId[];
  hideTitle?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ 
  title, 
  projects, 
  hideTitle = false
}) => {
  return (
    <div className="mb-10">
      {!hideTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {projects.map((project, index) => (
          <DashboardProjectCard 
            key={project.id || index} 
            title={project.title} 
            description={project.description}
            id={project.id}
            status={project.status}
            mentorId={project.mentorId}
            keywords={project.keywords}
            createdAt={project.createdAt}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectSection;