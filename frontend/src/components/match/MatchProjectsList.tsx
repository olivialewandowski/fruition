import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import ProjectCardWithScroll from './ProjectCardWithScroll';

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
  const [isUndoInProgress, setIsUndoInProgress] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUndoneProjectRef = useRef<string | null>(null);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    // Select the first project by default if available and no project was just undone
    if (projects && projects.length > 0 && !lastUndoneProjectRef.current) {
      setSelectedProject(projects[0]);
    }
  }, [projects]);

  // Effect to handle scrolling after undo
  useEffect(() => {
    if (isUndoInProgress && projects.length > 0) {
      const newFirstProject = projects[0];
      if (newFirstProject) {
        setSelectedProject(newFirstProject);
        const selectedElement = document.getElementById(`project-${newFirstProject.id}`);
        if (selectedElement && scrollContainerRef.current) {
          const containerRect = scrollContainerRef.current.getBoundingClientRect();
          selectedElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
      setIsUndoInProgress(false);
    }
  }, [isUndoInProgress, projects]);

  // Handle project selection and scrolling
  const handleSelectProject = (project: Project) => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
      scrollToProject(project);
    }
  };

  // Scroll to a specific project
  const scrollToProject = (project: Project) => {
    const selectedElement = document.getElementById(`project-${project.id}`);
    if (selectedElement && scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      
      const scrollTop = 
        elementRect.top + 
        scrollContainerRef.current.scrollTop - 
        containerRect.top - 
        (containerRect.height - elementRect.height) / 2;
        
      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Handle undo action
  const handleUndo = async () => {
    if (onUndoAction) {
      const currentFirstProjectId = projects[0]?.id || null;
      setIsUndoInProgress(true);
      await onUndoAction();
    }
  };

  // Enhanced animation variants for the container
  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.8
      }
    }
  };

  // Handle empty projects case
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="text-center">
          <p className="text-2xl text-gray-600 font-medium">No projects to show.</p>
          <p className="text-lg text-gray-500 mt-4">Check back later for new opportunities!</p>
          
          {/* Add undo button */}
          {onUndoAction && (
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={handleUndo}
                className="flex items-center justify-center bg-white text-purple-500 px-6 py-3 rounded-md hover:bg-purple-50 transition-colors border border-purple-200"
                aria-label="Undo last action"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo Last Action
              </motion.button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If not mounted yet, show a loading placeholder
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-full bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable project cards section */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 pt-8"
        onScroll={() => {
          const cards = document.querySelectorAll('.project-card-scroll');
          cards.forEach(card => {
            card.classList.remove('project-card-scroll');
            void (card as HTMLElement).offsetWidth;
            card.classList.add('project-card-scroll');
          });
        }}
      >
        <div className="w-full mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-16"
          >
            {projects.map((project, index) => (
              <motion.div 
                key={project.id} 
                id={`project-${project.id}`}
                className="project-card-scroll"
                variants={{
                  hidden: { 
                    opacity: 0, 
                    y: 50,
                    scale: 0.9,
                    filter: "blur(5px)"
                  },
                  show: { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { 
                      type: "spring",
                      stiffness: 80,
                      damping: 12,
                      delay: index * 0.1,
                      duration: 0.7
                    }
                  }
                }}
              >
                <ProjectCardWithScroll
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onSelect={() => handleSelectProject(project)}
                  onSave={onSaveProject}
                  onApply={onApplyProject}
                  onDecline={onDeclineProject}
                  onUndo={handleUndo}
                  showUndo={true}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MatchProjectsList; 