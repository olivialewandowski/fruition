import React from 'react';
import ProjectCreationForm from '../dashboard/ProjectCreationForm';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-3xl mx-auto" onClick={e => e.stopPropagation()}>
        <ProjectCreationForm onClose={onClose} />
      </div>
    </div>
  );
};

export default ProjectCreationModal;