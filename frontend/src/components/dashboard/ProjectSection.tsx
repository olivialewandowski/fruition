import React from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  title: string;
  description: string;
}

interface ProjectSectionProps {
  title: string;
  projects: Project[];
  hideTitle?: boolean;  // Add this prop
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ title, projects, hideTitle = false }) => {
  return (
    <>
      {!hideTitle && (
        <div className="mt-5 ml-3.5 text-3xl font-bold text-center text-black max-md:ml-2.5">
          {title}
        </div>
      )}
      {projects.map((project, index) => (
        <ProjectCard key={index} title={project.title} description={project.description} />
      ))}
      <div className="shrink-0 self-stretch mt-8 h-px border border-solid border-zinc-300 max-md:max-w-full" />
    </>
  );
};

export default ProjectSection;