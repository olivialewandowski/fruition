import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import MatchProjectCard from './MatchProjectCard';
import MatchProjectDetail from './MatchProjectDetail';

interface MatchProjectsListProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onApplyProject: (project: Project) => void;
  onDeclineProject: (project: Project) => void;
  onUndoAction?: () => void;
}

const MatchProjectsList = ({ 
  projects, 
  onSaveProject, 
  onApplyProject, 
  onDeclineProject,
  onUndoAction 
}: MatchProjectsListProps) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    // Select the first project by default if available
    if (projects && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects]);

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  // Handle empty projects case
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="text-center py-12">
          <p className="text-2xl text-gray-600 font-medium">No projects to show.</p>
          <p className="text-lg text-gray-500 mt-4">Check back later for new opportunities!</p>
          
          {/* Add undo button */}
          {onUndoAction && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={onUndoAction}
                className="flex items-center justify-center bg-white text-purple-500 px-6 py-3 rounded-md hover:bg-purple-50 transition-colors border border-purple-200"
                aria-label="Undo last action"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo Last Action
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If not mounted yet, show a loading placeholder
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-full bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Undo button at the top */}
      {onUndoAction && (
        <div className="flex justify-end mb-6">
          <button
            onClick={onUndoAction}
            className="flex items-center justify-center text-violet-600 hover:text-violet-800 transition-colors"
            aria-label="Undo last action"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-sm font-medium">Undo Last Action</span>
          </button>
        </div>
      )}
      
      {/* Two-panel layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - Scrollable list of projects */}
        <div className="w-full md:w-2/5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-4 pr-2">
            {projects.map((project) => (
              <MatchProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onSelect={() => handleSelectProject(project)}
              />
            ))}
          </div>
        </div>
        
        {/* Right panel - Selected project details */}
        <div className="w-full md:w-3/5">
          {selectedProject ? (
            <MatchProjectDetail
              project={selectedProject}
              onDecline={onDeclineProject}
              onSave={onSaveProject}
              onApply={onApplyProject}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">Select a project to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchProjectsList; 