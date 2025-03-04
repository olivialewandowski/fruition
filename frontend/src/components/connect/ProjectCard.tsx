import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onDecline: () => void;
  onSave: () => void;
  onApply: () => void;
  swipeDirection: 'left' | 'right' | 'up' | null;
}

const ProjectCard = ({ project, swipeDirection, onDecline, onSave, onApply }: ProjectCardProps) => {
  const [animateDirection, setAnimateDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'bounce' | 'exit'>('initial');
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Reset animation when project changes
  useEffect(() => {
    if (!project) return;
    setAnimateDirection(null);
    setAnimationPhase('initial');
  }, [project]);
  
  // Handle animation based on swipe direction
  useEffect(() => {
    if (!swipeDirection || !mounted) {
      return;
    }
    
    setAnimateDirection(swipeDirection);
    setAnimationPhase('bounce');
    
    // First phase: bounce in direction - reduced from 300ms to 200ms
    const bounceTimer = setTimeout(() => {
      // For all actions (left, right, up), we exit after bounce
      setAnimationPhase('exit');
    }, 200);
    
    return () => clearTimeout(bounceTimer);
  }, [swipeDirection, mounted]);
  
  // Variants for card animations
  const cardVariants = {
    initial: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    bounce: {
      x: animateDirection === 'left' ? -40 : animateDirection === 'right' ? 40 : 0,
      y: animateDirection === 'up' ? -40 : 0,
      scale: 1.03,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20
      }
    },
    exit: {
      x: animateDirection === 'left' ? -1000 : animateDirection === 'right' ? 1000 : 0,
      y: animateDirection === 'up' ? -1000 : 0,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.2
      }
    }
  };
  
  // If not mounted yet or project data is missing, show a loading placeholder
  if (!mounted || !project || !project.id || !project.title) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl mb-8" style={{ minHeight: '500px' }}>
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
    );
  }

  return (
    <motion.div
      key={`card-motion-${project.id}`}
      className="bg-white rounded-2xl shadow-md border border-solid border-neutral-200 p-8 w-full max-w-[90%] mx-auto mb-8"
      style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}
      variants={cardVariants}
      initial="initial"
      animate={animationPhase}
    >
      <div className="flex-grow">
        {/* Project title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h2>
        
        {/* Project organization */}
        <p className="text-xl text-violet-600 font-medium mb-6">
          {project.faculty ? `${project.faculty} • ${project.department || ''}` : 'Research Organization'}
        </p>
        
        {/* Project description */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Project Description</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {project.description || 'No description provided.'}
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Duration:</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            {project.duration || 'Duration not specified.'}
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Commitment:</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            {project.commitment || 'Commitment not specified.'}
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Skills:</h3>
          <div className="flex flex-wrap gap-3">
            {project.skills && project.skills.length > 0 ? (
              project.skills.map((skill, index) => (
                <span 
                  key={`skill-${index}-${skill}`}
                  className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-lg font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">No specific skills listed</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;