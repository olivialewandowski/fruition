import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import MatchProjectCard from './MatchProjectCard';
import { useState } from 'react';

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

  // Define animation variants with more dramatic effects
  const cardVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0.3,
      y: 60,
      rotate: -2,
      filter: "blur(4px)"
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      rotate: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring",
        stiffness: 80,
        damping: 12,
        mass: 1.2,
        duration: 0.7
      }
    }
  };

  // Button container animation with more dramatic effects
  const buttonContainerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.4,
        delay: 0.1
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      variants={cardVariants}
      className={`mb-12 ${isSelected ? 'z-10' : 'z-0'} relative min-h-[600px] w-full max-w-4xl mx-auto`}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 15,
          duration: 0.4 
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div 
        className={`
          bg-white rounded-xl overflow-hidden h-full flex flex-col
          ${isSelected ? 'shadow-xl border-2 border-violet-500' : 'shadow-md border border-gray-200'}
          transition-all duration-300
        `}
      >
        <div onClick={onSelect} className="flex-grow">
          <MatchProjectCard
            project={project}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        </div>

        {/* Action buttons - horizontal layout like Connect */}
        <motion.div 
          className="px-10 py-6 border-t border-gray-100 mt-auto flex justify-center space-x-4"
          variants={buttonContainerVariants}
          initial="hidden"
          animate={isSelected || isHovered ? "visible" : "hidden"}
        >
          {/* Apply button */}
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onApply(project);
            }}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-md hover:bg-violet-700 transition-colors font-medium flex items-center justify-center text-base"
            aria-label="Apply to project"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply Now
          </motion.button>
          
          {/* Save button */}
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onSave(project);
            }}
            className="border border-violet-600 text-violet-600 px-6 py-2.5 rounded-md hover:bg-violet-50 transition-colors font-medium flex items-center justify-center text-base"
            aria-label="Save project for later"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save for later
          </motion.button>
          
          {/* Decline button */}
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onDecline(project);
            }}
            className="text-red-500 hover:text-red-700 transition-colors font-medium flex items-center justify-center text-base"
            aria-label="Decline project"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Decline</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCardWithScroll; 