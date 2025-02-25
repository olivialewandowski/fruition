import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import ProjectCard from './ProjectCard';

interface DiscoverTabProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onApplyProject: (project: Project) => void;
}

const DiscoverTab = ({ projects, onSaveProject, onApplyProject }: DiscoverTabProps) => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const currentProject = projects[currentProjectIndex];

  // Handle swipe animation end
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
        
        if (swipeDirection === 'up') {
          // Save project
          onSaveProject(currentProject);
        } else if (swipeDirection === 'right') {
          // Apply to project
          onApplyProject(currentProject);
        }
        
        // Move to next project if available
        if (currentProjectIndex < projects.length - 1) {
          setCurrentProjectIndex(prev => prev + 1);
        } else {
          // Reset to first project when we reach the end
          // In a real app with a recommendation system, you might fetch more projects here
          setCurrentProjectIndex(0);
        }
      }, 500); // Increased duration for smoother transition
      
      return () => clearTimeout(timer);
    }
  }, [swipeDirection, currentProject, currentProjectIndex, projects.length, onSaveProject, onApplyProject]);

  const handleDecline = () => {
    setSwipeDirection('left');
  };

  const handleSave = () => {
    setSwipeDirection('up');
  };

  const handleApply = () => {
    setSwipeDirection('right');
  };

  return (
    <div className="w-full mt-6 flex flex-col items-center">
      {projects.length > 0 ? (
        <ProjectCard
          project={currentProject}
          onDecline={handleDecline}
          onSave={handleSave}
          onApply={handleApply}
          swipeDirection={swipeDirection}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No more projects to show.</p>
          <p className="text-gray-500 mt-2">Check back later for new opportunities!</p>
        </div>
      )}
      
      <div className="mt-6 text-center text-gray-500">
        <p>Swipe left to decline, right to apply, or up to save</p>
        <p className="mt-1">Drag much further to confirm your action</p>
        <p className="mt-1 text-sm">Or use the buttons below the card</p>
      </div>
    </div>
  );
};

export default DiscoverTab; 