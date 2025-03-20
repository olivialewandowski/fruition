import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import ProjectCardWithScroll from './ProjectCardWithScroll';
import MatchProjectDetail from './MatchProjectDetail';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface MatchProjectsListProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onApplyProject: (project: Project) => void;
  onDeclineProject: (project: Project) => void;
  onUndoAction?: () => void;
  appliedProjectIds?: string[];
}

// Create a client-only version of the component to avoid hydration issues
const MatchProjectsList = ({ 
  projects, 
  onSaveProject, 
  onApplyProject, 
  onDeclineProject,
  onUndoAction,
  appliedProjectIds
}: MatchProjectsListProps) => {
  const router = useRouter();
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
    setSelectedProject(project);
    scrollToProject(project);
  };

  // Scroll to a specific project
  const scrollToProject = (project: Project) => {
    const selectedElement = document.getElementById(`project-${project.id}`);
    if (selectedElement && scrollContainerRef.current) {
      selectedElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
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

  // Handle apply button click - navigate to application form
  const handleApplyClick = (project: Project) => {
    // Navigate to the application form with the project ID
    router.push(`/development/application?projectId=${project.id}`);
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

  // Animation variants for the project cards
  const cardVariants = {
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
        duration: 0.7
      }
    }
  };

  // Animation variants for the detail panel
  const detailVariants = {
    hidden: {
      opacity: 0,
      x: 50,
      scale: 0.95
    },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
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
          {isClient && onUndoAction && (
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={handleUndo}
                className="flex items-center justify-center bg-violet-600 text-white px-6 py-3 rounded-md hover:bg-violet-700 transition-colors"
                aria-label="Undo last action"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
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
    <div className="h-full">
      {/* Main content area with fixed height and proper layout for sticky behavior */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-200px)]">
        {/* Left panel - Scrollable project cards section */}
        <div 
          ref={scrollContainerRef}
          className="md:w-1/2 h-full overflow-y-auto px-4 pt-6 pb-8 flex-shrink-0"
          onScroll={() => {
            const cards = document.querySelectorAll('.project-card-scroll');
            cards.forEach(card => {
              card.classList.remove('project-card-scroll');
              void (card as HTMLElement).offsetWidth;
              card.classList.add('project-card-scroll');
            });
          }}
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col space-y-6"
          >
            {projects.map((project, index) => (
              <motion.div 
                key={project.id} 
                id={`project-${project.id}`}
                className="project-card-scroll w-full"
                variants={cardVariants}
                custom={index}
                animate="show"
                initial="hidden"
              >
                <div 
                  className={`cursor-pointer transition-all duration-300`}
                  onClick={() => handleSelectProject(project)}
                >
                  <ProjectCardWithScroll
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onSelect={() => handleSelectProject(project)}
                    onSave={onSaveProject}
                    onApply={handleApplyClick} // Use the new handler to navigate to application form
                    onDecline={onDeclineProject}
                    hasApplied={appliedProjectIds?.includes(project.id.replace(/^(saved_|applied_)/, ''))}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right panel - Fixed position Project details */}
        <div className="md:w-1/2 md:sticky md:top-0 h-full px-4 pt-6 pb-8 flex-shrink-0">
          <div className="h-full">
            {selectedProject ? (
              <motion.div
                variants={detailVariants}
                initial="hidden"
                animate="show"
                key={selectedProject.id}
                className="h-full"
              >
                <MatchProjectDetail
                  project={selectedProject}
                  onDecline={onDeclineProject}
                  onSave={onSaveProject}
                  onApply={handleApplyClick} // Use the new handler to navigate to application form
                  onUndo={onUndoAction}
                />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">Select a project to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a client-only version of the component to avoid hydration issues
const ClientOnlyMatchProjectsList = dynamic(() => Promise.resolve(MatchProjectsList), {
  ssr: false
});

export default ClientOnlyMatchProjectsList;