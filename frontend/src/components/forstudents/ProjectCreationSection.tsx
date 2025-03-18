// components/forstudents/ProjectCreationSection.tsx
import React, { useState, useEffect } from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';
import { addProjectToWaitlist, ProjectData } from '@/services/waitlistProjectsService';

const ProjectCreationSection: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    description: '',
    qualifications: '',
    positionType: 'Research Assistant'
  });
  
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

  // Clear localStorage on component mount
  useEffect(() => {
    localStorage.removeItem('savedProjectData');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    setSubmissionError('');
    
    try {
      console.log("Form submission started");
      
      // Directly add to Firestore (no longer saving to localStorage)
      const id = await addProjectToWaitlist(formData);
      console.log("Project saved with ID:", id);
      setProjectId(id);
      
      // Show the waitlist dialog
      setShowWaitlist(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error handling project submission:', error);
      setSubmissionError('An error occurred while saving your project. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog is closed
  const handleDialogClose = () => {
    setShowWaitlist(false);
    // Reset form after successful submission
    setFormData({
      title: '',
      description: '',
      qualifications: '',
      positionType: 'Research Assistant'
    });
  };

  return (
    <section className="py-24 w-full">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center font-montserrat mb-12">
          Post Projects to Find Peer Collaborators
        </h2>

        <div 
          className="max-w-xl mx-auto rounded-xl bg-white p-6 md:p-8 shadow-xl"
          style={{
            boxShadow: isHovered 
              ? "0 0 35px rgba(168, 85, 247, 0.6)" 
              : "0 0 25px rgba(168, 85, 247, 0.5)"
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your project title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your project and its goals"
                required
              />
            </div>

            <div>
              <label htmlFor="positionType" className="block text-sm font-medium text-gray-700 mb-1">
                Position Type
              </label>
              <select
                id="positionType"
                name="positionType"
                value={formData.positionType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Intern">Intern</option>
                <option value="Research Assistant">Research Assistant</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications & Responsibilities
              </label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe what skills are required and what the student will do"
              />
            </div>
            
            {submissionError && (
              <div className="text-red-500 text-sm font-medium">
                {submissionError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Post Project'}
            </button>
          </form>
        </div>
      </div>

      <WaitlistDialog 
        isOpen={showWaitlist}
        onClose={handleDialogClose}
        source="postProject"
        prefilledEmail=""
        projectId={projectId}
      />
    </section>
  );
};

export default ProjectCreationSection;