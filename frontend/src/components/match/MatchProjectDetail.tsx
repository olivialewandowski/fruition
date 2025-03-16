import { Project } from '@/types/project';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserGroupIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ArrowUturnLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface MatchProjectDetailProps {
  project: Project;
  onDecline: (project: Project) => void;
  onSave: (project: Project) => void;
  onApply: (project: Project) => void;
  onUndo?: () => void;
}

const MatchProjectDetail = ({ 
  project, 
  onDecline, 
  onSave, 
  onApply,
  onUndo
}: MatchProjectDetailProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render skills with or without animation based on client-side mounting
  const renderSkills = () => {
    if (!project.skills || project.skills.length === 0) {
      return <span className="text-gray-500 italic text-sm">No specific skills listed</span>;
    }

    if (!isMounted) {
      // Server-side rendering without animations
      return project.skills.map((skill, index) => (
        <span 
          key={`skill-${index}-${skill}`}
          className="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-full text-xs font-medium"
        >
          {skill}
        </span>
      ));
    }

    // Client-side rendering with animations
    return project.skills.map((skill, index) => (
      <motion.span 
        key={`skill-${index}-${skill}`}
        className="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-full text-xs font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        {skill}
      </motion.span>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Project header with  violet background */}
      <div className="bg-violet-700 px-6 py-6 text-white flex-shrink-0">
        <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
        
        <div className="flex flex-wrap items-center text-sm">
          <BuildingLibraryIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {project.faculty ? project.faculty : 'Research Organization'}
          </span>
          
          {project.department && (
            <>
              <span className="mx-2">•</span>
              <span>{project.department}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Project details */}
      <div className="p-5 overflow-y-auto flex-grow">
        {/* Duration */}
        {project.duration && (
          <div className="mb-5 p-4">
            <div className="flex items-center mb-3">
              <CalendarIcon className="h-5 w-5 text-violet-700 mr-2" />
              <h3 className="text-base font-semibold text-gray-800">Duration</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">
              {project.duration}
            </p>
          </div>
        )}
        
        {/* Time Commitment */}
        {project.commitment && (
          <div className="mb-5 p-4">
            <div className="flex items-center mb-3">
              <ClockIcon className="h-5 w-5 text-violet-700 mr-2" />
              <h3 className="text-base font-semibold text-gray-800">Time Commitment</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">
              {project.commitment}
            </p>
          </div>
        )}
        
        {/* Description */}
        <div className="mb-5 p-4">
          <div className="flex items-center mb-3">
            <DocumentTextIcon className="h-5 w-5 text-violet-700 mr-2" />
            <h3 className="text-base font-semibold text-gray-800">Description</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed pl-7">
            {project.description || 'No description provided.'}
          </p>
        </div>
        
        {/* Responsibilities */}
        {project.responsibilities && (
          <div className="mb-5 p-4">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="h-5 w-5 text-violet-700 mr-2" />
              <h3 className="text-base font-semibold text-gray-800">Responsibilities</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">
              {project.responsibilities}
            </p>
          </div>
        )}
        
        {/* Outcomes */}
        {project.outcomes && (
          <div className="mb-5 p-4">
            <div className="flex items-center mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-violet-700 mr-2" />
              <h3 className="text-base font-semibold text-gray-800">Expected Outcomes</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">
              {project.outcomes}
            </p>
          </div>
        )}
        
        {/* Skills */}
        <div className="mb-5 p-4">
          <div className="flex items-center mb-3">
            <AcademicCapIcon className="h-5 w-5 text-violet-700 mr-2" />
            <h3 className="text-base font-semibold text-gray-800">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-7">
            {renderSkills()}
          </div>
        </div>
        
        {/* Faculty & Department Details */}
        <div className="mb-5 p-4">
          <div className="flex items-center mb-3">
            <BuildingLibraryIcon className="h-5 w-5 text-violet-700 mr-2" />
            <h3 className="text-base font-semibold text-gray-800">Organization Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-7">
            <div>
              <h4 className="text-xs font-semibold text-gray-500">Faculty</h4>
              <p className="text-sm font-medium text-gray-800">{project.faculty || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500">Department</h4>
              <p className="text-sm font-medium text-gray-800">{project.department || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-3">
            {/* Apply button */}
            <button 
              onClick={() => onApply(project)}
              className="bg-violet-700 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center text-sm"
              aria-label="Apply to project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply
            </button>
            
            {/* Save button */}
            <button 
              onClick={() => onSave(project)}
              className="border border-violet-700 text-violet-700 px-4 py-2 rounded-md hover:bg-purple-50 transition-colors font-medium flex items-center justify-center text-sm"
              aria-label="Save project for later"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save
            </button>
            
            {/* Decline button */}
            <button 
              onClick={() => onDecline(project)}
              className="text-red-500 hover:text-red-700 transition-colors font-medium flex items-center justify-center sm:justify-start text-sm"
              aria-label="Decline project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
          </div>
          
          <div className="flex items-center">
            {/* Undo button */}
            {onUndo && (
              <button
                onClick={onUndo}
                className="text-violet-700 hover:text-violet-800 transition-colors font-medium flex items-center justify-center text-sm"
                aria-label="Undo last action"
              >
                <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                Undo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchProjectDetail; 