import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import { useState, useEffect } from 'react';
import { XMarkIcon, BookmarkIcon, ArrowUpRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface ProjectCardWithScrollProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onSave: (project: Project) => void;
  onApply: (project: Project) => void;
  onDecline: (project: Project) => void;
  hasApplied?: boolean;
}

const ProjectCardWithScroll = ({ 
  project, 
  isSelected,
  onSelect,
  onSave,
  onApply,
  onDecline,
  hasApplied = false
}: ProjectCardWithScrollProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define animation variants with more dramatic effects
  const cardVariants = {
    hidden: { 
      scale: 0.7, 
      opacity: 0,
      y: 50,
      filter: "blur(8px)"
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 10,
        mass: 1.5,
        duration: 0.9
      }
    }
  };

  // Button container animation with more dramatic effects
  const buttonContainerVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  // Truncate text to a specific length
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(true);
    onSave(project);
  };
  
  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(project);
  };
  
  const handleDeclineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline(project);
  };

  // Base card content without animations for server-side rendering
  const cardContent = (
    <div 
      className={`
        bg-white rounded-xl overflow-hidden h-full flex flex-col border border-gray-200
        ${isSelected ? 'shadow-xl ring-2 ring-violet-500' : 'shadow-md hover:shadow-lg'}
        transition-all duration-300
      `}
    >
      <div onClick={onSelect} className="flex-grow p-6">
        {/* Compact project card content */}
        <div className="flex flex-col h-full">
          {/* Project title */}
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{project.title}</h2>
            
            {/* Action buttons */}
            <div className="flex space-x-2 ml-2">
              {!isSaved && !hasApplied && (
                <motion.button
                  onClick={handleSaveClick}
                  className="text-violet-600 hover:text-violet-800 focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <BookmarkIcon className="h-5 w-5" />
                </motion.button>
              )}
              {isSaved && !hasApplied && (
                <motion.button
                  className="text-violet-600 hover:text-violet-800 focus:outline-none"
                  disabled
                >
                  <BookmarkSolidIcon className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Faculty and Department */}
          <p className="text-sm text-violet-600 font-medium mb-4">
            {project.faculty ? `${project.faculty}` : 'Research Organization'} 
            {project.department && <span className="mx-1">•</span>}
            {project.department && <span className="text-gray-600">{project.department}</span>}
          </p>
          
          {/* Project description - truncated */}
          <div className="mb-4">
            <p className="text-gray-600 line-clamp-3">
              {truncateText(project.description || 'No description provided.', 150)}
            </p>
          </div>
          
          {/* Skills section - limited to 3 skills */}
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2">
              {project.skills && project.skills.length > 0 ? (
                project.skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={`skill-${index}-${skill}`}
                    className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic text-xs">No specific skills listed</span>
              )}
              {project.skills && project.skills.length > 3 && (
                <span className="text-violet-600 text-xs font-medium">+{project.skills.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - horizontal layout */}
      {isMounted && (
        <div 
          className={`px-4 py-3 border-t border-gray-100 mt-auto flex justify-start space-x-2 ${
            isSelected || isHovered ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        >
          {/* Apply button */}
          {!hasApplied && (
            <>
              <button 
                onClick={handleDeclineClick}
                className="text-red-500 hover:text-red-700 transition-colors font-medium flex items-center justify-center text-sm"
                aria-label="Decline project"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Decline
              </button>
              <button 
                onClick={handleApplyClick}
                className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-md"
                aria-label="Apply to project"
              >
                Apply <ArrowUpRightIcon className="inline-block h-3 w-3 ml-1" />
              </button>
            </>
          )}
          {hasApplied && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Applied
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If not mounted yet, return the base card without animations
  if (!isMounted) {
    return <div className="mb-4 relative w-full">{cardContent}</div>;
  }

  // Return the animated card when mounted on client
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardVariants}
      className={`mb-4 relative w-full`}
      whileHover={{ 
        scale: isSelected ? 1.01 : 1.02,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 15,
          duration: 0.3 
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {cardContent}
    </motion.div>
  );
};

export default ProjectCardWithScroll; 