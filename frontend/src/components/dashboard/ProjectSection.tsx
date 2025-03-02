import React from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  title: string;
  description: string;
}

interface ProjectSectionProps {
  title: string;
  projects: Project[];
  hideTitle?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ title, projects, hideTitle = false }) => {
  return (
    <div className="mb-10">
      {!hideTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {projects.map((project, index) => (
          <ProjectCard key={index} title={project.title} description={project.description} />
        ))}
      </div>
    </div>
  );
};

export default ProjectSection;