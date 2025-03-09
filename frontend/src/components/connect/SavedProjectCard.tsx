import { Project } from '@/types/project';

interface SavedProjectCardProps {
  project: Project;
  onApply: () => void;
  onRemove: () => void;
}

const SavedProjectCard = ({ project, onApply, onRemove }: SavedProjectCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {project.faculty} • {project.department}
      </p>
      <div className="mt-3">
        <p className="text-sm text-gray-700 line-clamp-3">{project.description}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.skills && project.skills.slice(0, 3).map((skill: string, index: number) => (
          <span 
            key={index} 
            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
        {project.skills && project.skills.length > 3 && (
          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
            +{project.skills.length - 3} more
          </span>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-violet-600">Saved</span> • {project.duration}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onRemove}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Remove
          </button>
          <button 
            onClick={onApply}
            className="px-3 py-1 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedProjectCard;