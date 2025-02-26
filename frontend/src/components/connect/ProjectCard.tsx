import { useState, useRef, useEffect } from 'react';
import { Project } from '@/types/project';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onDecline: () => void;
  onSave: () => void;
  onApply: () => void;
  swipeDirection: 'left' | 'right' | 'up' | null;
}

const ProjectCard = ({ project, onDecline, onSave, onApply, swipeDirection }: ProjectCardProps) => {
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Reset drag position when project changes
  useEffect(() => {
    setDragPosition({ x: 0, y: 0 });
  }, [project]);

  // Handle swipe animation
  useEffect(() => {
    if (swipeDirection === 'left') {
      setDragPosition({ x: -1000, y: 0 });
    } else if (swipeDirection === 'right') {
      setDragPosition({ x: 1000, y: 0 });
    } else if (swipeDirection === 'up') {
      setDragPosition({ x: 0, y: -1000 });
    }
  }, [swipeDirection]);

  // Calculate opacity for action indicators based on drag position
  const declineOpacity = Math.min(Math.abs(dragPosition.x) / 100, 1) * (dragPosition.x < 0 ? 1 : 0);
  const applyOpacity = Math.min(Math.abs(dragPosition.x) / 100, 1) * (dragPosition.x > 0 ? 1 : 0);
  const saveOpacity = Math.min(Math.abs(dragPosition.y) / 100, 1) * (dragPosition.y < 0 ? 1 : 0);

  // Calculate rotation based on horizontal drag
  const rotation = dragPosition.x * 0.05;

  // Determine if drag is far enough to trigger action
  const isDragFarEnough = 
    Math.abs(dragPosition.x) > 150 || 
    (dragPosition.y < 0 && Math.abs(dragPosition.y) > 150);

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // If dragged far enough, trigger the appropriate action
    if (isDragFarEnough) {
      if (dragPosition.x < -150) {
        onDecline();
      } else if (dragPosition.x > 150) {
        onApply();
      } else if (dragPosition.y < -150) {
        onSave();
      } else {
        // Reset position if not dragged far enough
        setDragPosition({ x: 0, y: 0 });
      }
    } else {
      // Reset position if not dragged far enough
      setDragPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Action indicators */}
      <div 
        className="absolute top-1/2 left-6 transform -translate-y-1/2 z-10 transition-opacity duration-200"
        style={{ opacity: declineOpacity }}
      >
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold transform -rotate-12">
          DECLINE
        </div>
      </div>
      
      <div 
        className="absolute top-1/2 right-6 transform -translate-y-1/2 z-10 transition-opacity duration-200"
        style={{ opacity: applyOpacity }}
      >
        <div className="bg-violet-700 text-white px-4 py-2 rounded-lg font-bold transform rotate-12">
          APPLY
        </div>
      </div>
      
      <div 
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-200"
        style={{ opacity: saveOpacity }}
      >
        <div className="bg-violet-500 text-white px-4 py-2 rounded-lg font-bold">
          SAVE
        </div>
      </div>

      {/* Project card */}
      <motion.div
        ref={cardRef}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => {
          setDragPosition({ 
            x: info.offset.x, 
            y: info.offset.y 
          });
        }}
        onDragEnd={handleDragEnd}
        animate={{
          x: dragPosition.x,
          y: dragPosition.y,
          rotate: rotation,
          transition: { type: 'spring', stiffness: 300, damping: 20 }
        }}
        style={{
          zIndex: isDragging ? 20 : 10,
        }}
        tabIndex={0}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {project.faculty} • {project.department}
          </p>
          
          <div className="mt-4">
            <p className="text-gray-700">{project.description}</p>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700">Skills Required:</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.skills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Duration:</h3>
              <p className="text-sm text-gray-600">{project.duration}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Commitment:</h3>
              <p className="text-sm text-gray-600">{project.commitment}</p>
            </div>
          </div>
        </div>
        
        {/* Progress bars for swipe actions */}
        <div 
          className="h-1 bg-red-500 absolute bottom-0 left-0 transition-all duration-300"
          style={{ 
            width: dragPosition.x < 0 ? `${Math.min(Math.abs(dragPosition.x) / 1.5, 100)}%` : '0%',
            opacity: dragPosition.x < 0 ? 1 : 0
          }}
        />
        <div 
          className="h-1 bg-violet-700 absolute bottom-0 right-0 transition-all duration-300"
          style={{ 
            width: dragPosition.x > 0 ? `${Math.min(Math.abs(dragPosition.x) / 1.5, 100)}%` : '0%',
            opacity: dragPosition.x > 0 ? 1 : 0
          }}
        />
        <div 
          className="w-1 bg-violet-500 absolute top-0 right-0 transition-all duration-300"
          style={{ 
            height: dragPosition.y < 0 ? `${Math.min(Math.abs(dragPosition.y) / 1.5, 100)}%` : '0%',
            opacity: dragPosition.y < 0 ? 1 : 0
          }}
        />
      </motion.div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-between items-center">
        <button 
          onClick={onDecline}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button 
          onClick={onSave}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-violet-500 hover:bg-violet-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        
        <button 
          onClick={onApply}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-violet-700 hover:bg-violet-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCard; 