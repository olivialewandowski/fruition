import { Project } from '@/types/project';
import SavedProjectCard from './SavedProjectCard';

interface SavedTabProps {
  savedProjects: Project[];
  onApplyProject: (project: Project) => void;
  onRemoveProject: (project: Project) => void;
}

const SavedTab = ({ savedProjects, onApplyProject, onRemoveProject }: SavedTabProps) => {
  return (
    <div className="w-full mt-6">
      {savedProjects.length > 0 ? (
        <div className="space-y-4">
          {savedProjects.map((project) => (
            <SavedProjectCard
              key={project.id}
              project={project}
              onApply={() => onApplyProject(project)}
              onRemove={() => onRemoveProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No saved projects yet.</p>
          <p className="text-gray-500 mt-2">
            Swipe up on projects in the Discover tab to save them for later!
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedTab; 