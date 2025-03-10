import { Project } from '@/types/project';
import { motion } from 'framer-motion';

interface MatchProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
}

const MatchProjectCard = ({ 
  project, 
  isSelected,
  onSelect
}: MatchProjectCardProps) => {
  return (
    <div className="p-10 pt-14 h-full flex flex-col">
      {/* Project title */}
      <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">{project.title}</h2>
      
      {/* Faculty and Department */}
      <p className="text-lg text-violet-600 font-medium mb-8">
        {project.faculty ? `${project.faculty}` : 'Research Organization'} 
        {project.department && <span className="mx-1">•</span>}
        {project.department && <span className="text-gray-600">{project.department}</span>}
      </p>
      
      {/* Project description - full text */}
      <div className="mb-10 flex-grow">
        <p className="text-xl text-gray-600 whitespace-pre-line leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>
      
      {/* Duration and Commitment - horizontal layout like Connect */}
      <div className="flex mb-10 text-gray-600">
        <div className="mr-8">
          <span className="font-semibold">Duration:</span> {project.duration || 'Not specified'}
        </div>
        <div>
          <span className="font-semibold">Commitment:</span> {project.commitment || 'Not specified'}
        </div>
      </div>
      
      {/* Skills section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-3">
          {project.skills && project.skills.length > 0 ? (
            project.skills.map((skill, index) => (
              <span 
                key={`skill-${index}-${skill}`}
                className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-base font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic text-lg">No specific skills listed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchProjectCard; 