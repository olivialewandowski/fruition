import { Project } from '@/types/project';

interface MatchProjectDetailProps {
  project: Project;
  onDecline: (project: Project) => void;
  onSave: (project: Project) => void;
  onApply: (project: Project) => void;
}

const MatchProjectDetail = ({ 
  project, 
  onDecline, 
  onSave, 
  onApply 
}: MatchProjectDetailProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
      <div className="flex flex-col h-full">
        {/* Project header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{project.title}</h2>
          
          <div className="flex flex-wrap items-center text-sm mb-4">
            <span className="text-violet-600 font-medium">
              {project.faculty ? project.faculty : 'Research Organization'}
            </span>
            
            {project.department && (
              <>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">{project.department}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Project details */}
        <div className="flex-grow overflow-y-auto mb-6" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {project.description || 'No description provided.'}
            </p>
          </div>
          
          {/* Duration and Commitment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Duration</h4>
              <p className="text-gray-600">{project.duration || 'Duration not specified.'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Commitment</h4>
              <p className="text-gray-600">{project.commitment || 'Commitment not specified.'}</p>
            </div>
          </div>
          
          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills && project.skills.length > 0 ? (
                project.skills.map((skill, index) => (
                  <span 
                    key={`skill-${index}-${skill}`}
                    className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium"
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
        
        {/* Action buttons */}
        <div className="border-t pt-6 mt-auto">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Decline button */}
            <button 
              onClick={() => onDecline(project)}
              className="text-red-500 hover:text-red-700 transition-colors font-medium flex items-center justify-center sm:justify-start"
              aria-label="Decline project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
            
            {/* Save button */}
            <button 
              onClick={() => onSave(project)}
              className="border-2 border-violet-600 text-violet-600 px-4 py-2 rounded-md hover:bg-violet-50 transition-colors font-medium flex items-center justify-center"
              aria-label="Save project for later"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save for Later
            </button>
            
            {/* Apply button */}
            <button 
              onClick={() => onApply(project)}
              className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition-colors font-medium flex items-center justify-center"
              aria-label="Apply to project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchProjectDetail; 