import { Project } from '@/types/project';

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
    <div 
      onClick={onSelect}
      className={`
        w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer
        ${isSelected ? 'border-2 border-violet-500 shadow-md' : 'border border-gray-200'}
      `}
    >
      <div className="p-4">
        {/* Project title */}
        <h2 className="text-lg font-bold text-gray-800 mb-1">{project.title}</h2>
        
        {/* Faculty and Department */}
        <p className="text-xs text-violet-600 font-medium mb-2">
          {project.faculty ? `${project.faculty}` : 'Research Organization'} 
          {project.department && <span className="mx-1">•</span>}
          {project.department && <span className="text-gray-600">{project.department}</span>}
        </p>
        
        {/* Project description - truncated */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {project.description || 'No description provided.'}
        </p>
        
        {/* Skills section - preview */}
        <div className="flex flex-wrap gap-1 mb-1">
          {project.skills && project.skills.length > 0 ? (
            project.skills.slice(0, 2).map((skill, index) => (
              <span 
                key={`skill-${index}-${skill}`}
                className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic text-xs">No specific skills listed</span>
          )}
          
          {project.skills && project.skills.length > 2 && (
            <span className="text-gray-500 text-xs font-medium">
              +{project.skills.length - 2} more
            </span>
          )}
        </div>
        
        {/* Click to view more */}
        <div className="text-right">
          <span className="text-xs text-violet-500 font-medium">
            {isSelected ? 'Currently viewing' : 'Click to view details'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchProjectCard; 