// src/components/projects/ProjectArchiveModal.tsx
import React from 'react';

interface ProjectArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: () => void;
  projectTitle: string;
  isArchiving: boolean;
  isArchived: boolean;
}

const ProjectArchiveModal: React.FC<ProjectArchiveModalProps> = ({
  isOpen,
  onClose,
  onArchive,
  projectTitle,
  isArchiving,
  isArchived
}) => {
  if (!isOpen) return null;
  
  const actionText = isArchived ? 'unarchive' : 'archive';
  const actionTitle = isArchived ? 'Unarchive Project' : 'Archive Project';
  const buttonText = isArchived ? 'Unarchive' : 'Archive';
  const buttonColor = isArchived ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500';
  const iconColor = isArchived ? 'text-green-600 bg-green-100' : 'text-amber-600 bg-amber-100';
  
  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconColor}`}>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{actionTitle}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {isArchived 
                    ? `Are you sure you want to unarchive "${projectTitle}"? This will make the project active again and visible to applicants.`
                    : `Are you sure you want to archive "${projectTitle}"? Archived projects are not visible to new applicants but existing team members will still have access.`
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={onArchive}
              disabled={isArchiving}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${buttonColor} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isArchiving ? `${isArchived ? 'Unarchiving' : 'Archiving'}...` : buttonText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isArchiving}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectArchiveModal;