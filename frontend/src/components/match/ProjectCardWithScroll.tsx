import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectCardWithScrollProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onSave: (project: Project) => void;
  onApply: (project: Project) => void;
  onDecline: (project: Project) => void;
}

const ProjectCardWithScroll = ({ 
  project, 
  isSelected,
  onSelect,
  onSave,
  onApply,
  onDecline
}: ProjectCardWithScrollProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{project.title}</h2>
          
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
          className={`px-4 py-3 border-t border-gray-100 mt-auto flex justify-between space-x-2 ${
            isSelected || isHovered ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        >
          {/* Decline button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDecline(project);
            }}
            className="text-red-500 hover:text-red-700 transition-colors font-medium flex items-center justify-center text-sm"
            aria-label="Decline project"
          >
            <XMarkIcon className="h-5 w-5 mr-1" />
            Decline
          </button>
          
          {/* Save button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSave(project);
            }}
            className="border border-violet-600 text-violet-600 px-3 py-1 rounded-md hover:bg-violet-50 transition-colors font-medium flex items-center justify-center text-sm"
            aria-label="Save project for later"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>
          
          {/* Apply button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onApply(project);
            }}
            className="bg-violet-600 text-white px-3 py-1 rounded-md hover:bg-violet-700 transition-colors font-medium flex items-center justify-center text-sm"
            aria-label="Apply to project"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply
          </button>
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