import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onDecline: () => void;
  onSave: () => void;
  onApply: () => void;
  onUndo?: () => void;
  swipeDirection: 'left' | 'right' | 'up' | 'undo' | null;
}

const ProjectCard = ({ project, swipeDirection, onDecline, onSave, onApply, onUndo }: ProjectCardProps) => {
  const [animateDirection, setAnimateDirection] = useState<'left' | 'right' | 'up' | 'undo' | null>(null);
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
    
    // First phase: bounce in direction
    const bounceTimer = setTimeout(() => {
      // For all actions, we exit after bounce
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
      x: animateDirection === 'left' ? -40 : 
         animateDirection === 'right' ? 40 : 
         animateDirection === 'undo' ? 0 : 0,
      y: animateDirection === 'up' ? -40 : 
         animateDirection === 'undo' ? 40 : 0,
      scale: animateDirection === 'undo' ? 1.1 : 1.03,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20
      }
    },
    exit: {
      x: animateDirection === 'left' ? -1000 : 
         animateDirection === 'right' ? 1000 : 
         animateDirection === 'undo' ? 0 : 0,
      y: animateDirection === 'up' ? -1000 : 
         animateDirection === 'undo' ? 1000 : 0,
      opacity: animateDirection === 'undo' ? 0 : 0,
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
      <div 
        className="w-full max-w-5xl mx-auto mb-4 bg-slate-50 rounded-xl shadow-lg px-8 pt-16 pb-16" 
        style={{ 
          minHeight: '550px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-16 bg-gray-200 rounded w-3/4 mb-4 mt-24"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded mb-8"></div>
          <div className="flex justify-center mt-24">
            <div className="h-10 bg-gray-200 rounded-md w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={`card-motion-${project.id}`}
      className="w-full max-w-5xl mx-auto mb-4 bg-white rounded-xl shadow-lg px-8 pt-16 pb-16 relative transform hover:translate-y-[-2px] transition-all"
      style={{ 
        minHeight: '550px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.05)'
      }}
      variants={cardVariants}
      initial="initial"
      animate={animationPhase}
    >
      {/* Undo button in top left */}
      {onUndo && (
        <button
          onClick={onUndo}
          className="absolute top-6 left-6 flex items-center justify-center text-violet-500 hover:text-gray-700 transition-colors"
          aria-label="Undo last action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="text-sm font-medium">Undo</span>
        </button>
      )}
      
      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full text-left">
        {/* Main heading - Project title */}
        <h2 className="text-5xl font-bold text-gray-800 mb-4 mt-24 leading-[1.2]">{project.title}</h2>
        
        {/* Subheading - Faculty and Department */}
        <p className="text-lg text-violet-600 font-medium mb-8">
          {project.faculty ? `${project.faculty}` : 'Research Organization'} 
          {project.department && <span className="mx-1">•</span>}
          {project.department && <span className="text-gray-600">{project.department}</span>}
        </p>
        
        {/* Body text - Project description */}
        <div className="mb-7">
          <p className="text-xl text-gray-600 mb-8 leading-[1.4]">
            {project.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-4">
            <div className="leading-[1.4]">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-gray-600 ml-2">{project.duration || 'Duration not specified.'}</span>
            </div>

            <div className="leading-[1.4] ml-0 md:ml-8">
              <span className="text-gray-700 font-medium">Commitment:</span>
              <span className="text-gray-600 ml-2">{project.commitment || 'Commitment not specified.'}</span>
            </div>
          </div>
        </div>
        
        {/* Skills section */}
        <div className="mb-32 w-full">
          <h3 className="text-xl font-semibold text-gray-700 mb-5 leading-[1.2]">Skills</h3>
          
          <div className="flex flex-wrap gap-3">
            {project.skills && project.skills.length > 0 ? (
              project.skills.map((skill, index) => (
                <span 
                  key={`skill-${index}-${skill}`}
                  className="bg-violet-100 text-violet-800 px-5 py-2.5 rounded-full text-base font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">No specific skills listed</span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-auto pt-0 flex flex-wrap justify-center gap-4 pb-6">
          {/* Primary button */}
          <button 
            onClick={onApply}
            className="bg-violet-600 text-white px-10 py-3 rounded-md hover:bg-violet-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply Now
          </button>
          
          {/* Secondary button */}
          <button 
            onClick={onSave}
            className="bg-white border-2 border-violet-600 text-violet-600 px-10 py-3 rounded-md hover:bg-violet-50 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save for later
          </button>
          
          {/* Tertiary button */}
          <button 
            onClick={onDecline}
            className="text-red-400 px-10 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;