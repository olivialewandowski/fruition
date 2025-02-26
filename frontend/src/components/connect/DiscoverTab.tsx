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

// Create a client-only wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <>{children}</>;
};

interface DiscoverTabProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onApplyProject: (project: Project) => void;
}

const DiscoverTab = ({ projects, onSaveProject, onApplyProject }: DiscoverTabProps) => {
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
      // Process actions
      if (swipeDirection === 'right') {
        onApplyProject(currentProject);
      } else if (swipeDirection === 'up') {
        onSaveProject(currentProject);
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
  }, [swipeDirection, currentProject, currentProjectIndex, projects, onSaveProject, onApplyProject]);

  // Prevent actions while transitioning
  const handleDecline = () => {
    if (isTransitioning) return;
    setSwipeDirection('left');
  };

  const handleSave = () => {
    if (isTransitioning) return;
    setSwipeDirection('up');
  };

  const handleApply = () => {
    if (isTransitioning) return;
    setSwipeDirection('right');
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
    <div className="w-full flex flex-col items-center justify-center py-8" style={{ minHeight: '75vh' }}>
      <div className="w-full max-w-6xl px-4">
        {/* Wrap the entire content in ClientOnly */}
        <ClientOnly>
          <div className="flex flex-col items-center">
            {/* Project card with fade-in animation */}
            {currentProject && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`project-container-${currentProjectIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full flex justify-center"
                >
                  <ProjectCard
                    project={currentProject}
                    swipeDirection={swipeDirection}
                    onDecline={() => {}}
                    onSave={() => {}}
                    onApply={() => {}}
                  />
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Action buttons - completely static, outside of the card and AnimatePresence */}
            <div className="flex justify-center space-x-16 mt-4 max-w-5xl mx-auto w-full">
              {/* Decline button - light purple */}
              <button
                onClick={handleDecline}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 active:bg-violet-300 transition-colors shadow-md"
                aria-label="Decline project"
                disabled={isTransitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Save button - white with purple icon */}
              <button
                onClick={handleSave}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-violet-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-md border border-violet-200"
                aria-label="Save project for later"
                disabled={isTransitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              
              {/* Apply button - solid purple */}
              <button
                onClick={handleApply}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-md"
                aria-label="Apply to project"
                disabled={isTransitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
  );
};

// Export the component with noSSR to prevent hydration issues
export default DiscoverTab; 