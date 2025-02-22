import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col px-3 py-4 mt-5 ml-3.5 max-w-full text-black rounded-3xl border border-solid bg-zinc-100 border-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[369px] max-md:ml-2.5">
      <div className="text-xl max-md:mr-2.5">{title}</div>
      <div className="shrink-0 mt-2 h-px border border-solid border-neutral-500" />
      <div className="mt-1.5 text-sm font-light max-md:mr-1">{description}</div>
    </div>
  );
};

export default ProjectCard;