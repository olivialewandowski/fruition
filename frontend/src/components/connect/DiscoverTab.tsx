import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Import ProjectCard dynamically with SSR disabled to prevent hydration errors
const ProjectCard = dynamic(() => import('./ProjectCard'), { 
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl" style={{ minHeight: '500px' }}>
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-40 bg-gray-200 rounded mb-8"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="h-10 bg-gray-200 rounded-full w-28"></div>
          <div className="h-10 bg-gray-200 rounded-full w-36"></div>
          <div className="h-10 bg-gray-200 rounded-full w-32"></div>
        </div>
      </div>
    </div>
  )
});

// Improved ClientOnly component with loading state
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return null on first render to avoid hydration mismatch
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

  return <>{children}</>;
};

interface DiscoverTabProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onApplyProject: (project: Project) => void;
  onDeclineProject: (project: Project) => void;
}

const DiscoverTab = ({ projects, onSaveProject, onApplyProject, onDeclineProject }: DiscoverTabProps) => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Only access projects array if it exists
  const currentProject = projects && projects.length > 0 
    ? projects[currentProjectIndex] 
    : null;

  // Handle animation end
  useEffect(() => {
    if (!currentProject || !swipeDirection) return;
    
    setIsTransitioning(true);
    
    // For all actions, we need to wait for the full animation sequence to complete
    const timer = setTimeout(() => {
      // Process actions based on swipe direction
      if (swipeDirection === 'right') {
        onSaveProject(currentProject);
      } else if (swipeDirection === 'up') {
        onApplyProject(currentProject);
      } else if (swipeDirection === 'left') {
        onDeclineProject(currentProject);
      }
      
      // Reset direction to null
      setSwipeDirection(null);
      
      // Move to next project
      if (currentProjectIndex < projects.length - 1) {
        setCurrentProjectIndex(prev => prev + 1);
      } else {
        setCurrentProjectIndex(0);
      }
      
      setIsTransitioning(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [swipeDirection, currentProject, currentProjectIndex, projects, onSaveProject, onApplyProject, onDeclineProject]);

  // Prevent actions while transitioning
  const handleDecline = () => {
    if (isTransitioning || !currentProject) return;
    setSwipeDirection('left');
  };

  const handleSave = () => {
    if (isTransitioning || !currentProject) return;
    setSwipeDirection('right');
  };

  const handleApply = () => {
    if (isTransitioning || !currentProject) return;
    setSwipeDirection('up');
  };

  // Handle empty projects case
  if (!projects || projects.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="text-center py-12">
          <p className="text-2xl text-gray-600 font-medium">No projects to show.</p>
          <p className="text-lg text-gray-500 mt-4">Check back later for new opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ClientOnly>
        <div className="flex flex-col items-center justify-center">
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center w-full max-w-5xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No More Projects</h3>
              <p className="text-gray-600 mb-6">
                {"You've gone through all available projects. Check back later for more opportunities!"}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                Refresh Projects
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {currentProject && (
                  <ProjectCard
                    key={`project-${currentProject.id}`}
                    project={currentProject}
                    swipeDirection={swipeDirection}
                    onDecline={handleDecline}
                    onSave={handleSave}
                    onApply={handleApply}
                  />
                )}
              </AnimatePresence>
              
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleDecline}
                  disabled={isTransitioning}
                  className="w-14 h-14 flex items-center justify-center bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isTransitioning}
                  className="w-14 h-14 flex items-center justify-center bg-white text-blue-500 rounded-full shadow-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleApply}
                  disabled={isTransitioning}
                  className="w-14 h-14 flex items-center justify-center bg-white text-green-500 rounded-full shadow-md hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </ClientOnly>
    </div>
  );
};

// Export the component with dynamic import to prevent hydration issues
export default dynamic(() => Promise.resolve(DiscoverTab), { ssr: false }); 