// src/components/projects/ApplicationsReviewManager.tsx
import React, { useState, useEffect } from 'react';
import { Application } from '@/types/application';
import { Position } from '@/types/position';
import { updateApplicationStatus } from '@/services/clientProjectService';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface ApplicationsReviewManagerProps {
  applications: Application[];
  positions: Position[];
  onApplicationUpdated: (application: Application) => void;
}

const ApplicationsReviewManager: React.FC<ApplicationsReviewManagerProps> = ({
  applications,
  positions,
  onApplicationUpdated
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<string | 'all'>('all');
  const [filterMajor, setFilterMajor] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'split'>('split');
  
  // Get unique years and majors for filters
  const uniqueYears = Array.from(new Set(applications.map(app => app.studentYear || 'Unknown')))
    .filter(Boolean)
    .sort();
    
  const uniqueMajors = Array.from(new Set(applications.map(app => app.studentMajor || 'Unknown')))
    .filter(Boolean)
    .sort();
  
  // Apply filters
  const filteredApplications = applications.filter(app => {
    if (filterYear !== 'all' && app.studentYear !== filterYear) return false;
    if (filterMajor !== 'all' && app.studentMajor !== filterMajor) return false;
    return true;
  });
  
  // Set the first application as selected when applications change
  useEffect(() => {
    if (filteredApplications.length > 0 && (!selectedApplication || !filteredApplications.includes(selectedApplication))) {
      setSelectedApplication(filteredApplications[0]);
      setCurrentIndex(0);
    }
  }, [filteredApplications, selectedApplication]);
  
  // Format date helper function
  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    try {
      // Handle Firestore Timestamp
      if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      } 
      // Handle Date object
      else if (date instanceof Date) {
        return date.toLocaleDateString();
      } 
      // Handle string or any other type
      else {
        return new Date(String(date)).toLocaleDateString();
      }
    } catch (e) {
      return 'Unknown';
    }
  };
  
  // Get position title
  const getPositionTitle = (positionId: string) => {
    const position = positions.find(pos => pos.id === positionId);
    return position ? position.title : 'Unknown Position';
  };
  
  // Handle like/reject application
  const handleUpdateStatus = async (applicationId: string, newStatus: 'liked' | 'rejected') => {
    if (!applicationId) return;
    
    setIsLoading(true);
    
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      // Find the application and update it locally
      const updatedApplication = applications.find(app => app.id === applicationId);
      
      if (updatedApplication) {
        const newApplication = { ...updatedApplication, status: newStatus };
        onApplicationUpdated(newApplication);
        
        // Move to next application
        if (currentIndex < filteredApplications.length - 1) {
          setSelectedApplication(filteredApplications[currentIndex + 1]);
          setCurrentIndex(currentIndex + 1);
        } else if (filteredApplications.length > 1) {
          // If we're at the end, go back to the first application (that isn't the one we just updated)
          const newFilteredApplications = filteredApplications.filter(app => app.id !== applicationId);
          if (newFilteredApplications.length > 0) {
            setSelectedApplication(newFilteredApplications[0]);
            setCurrentIndex(0);
          } else {
            setSelectedApplication(null);
          }
        } else {
          setSelectedApplication(null);
        }
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to previous/next application
  const goToPrevApplication = () => {
    if (currentIndex > 0) {
      setSelectedApplication(filteredApplications[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const goToNextApplication = () => {
    if (currentIndex < filteredApplications.length - 1) {
      setSelectedApplication(filteredApplications[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Select a specific application
  const selectApplication = (application: Application, index: number) => {
    setSelectedApplication(application);
    setCurrentIndex(index);
  };
  
  // If no applications
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No applications yet</h3>
        <p className="text-gray-600 mb-6">
          Your project hasn't received any applications yet. 
          Applications will appear here once students apply to your positions.
        </p>
      </div>
    );
  }
  
  // If filtered to no applications
  if (filteredApplications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No matching applications</h3>
        <p className="text-gray-600 mb-4">
          There are no applications matching your current filters.
        </p>
        <button
          onClick={() => { setFilterYear('all'); setFilterMajor('all'); }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="filterYear"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filterMajor" className="block text-sm font-medium text-gray-700 mb-1">
              Major/Department
            </label>
            <select
              id="filterMajor"
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Majors</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'card' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'split' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Split View
          </button>
        </div>
      </div>
      
      {viewMode === 'card' ? (
        /* Card View - Show one application at a time with navigation controls */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {selectedApplication && (
            <>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      {selectedApplication.studentName}
                      {selectedApplication.isTopChoice && (
                        <span className="ml-2 flex items-center text-yellow-500" title="Top Choice">
                          <StarIcon className="h-5 w-5" />
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">{selectedApplication.studentEmail}</p>
                    <div className="flex space-x-3 mt-1">
                      {selectedApplication.studentYear && (
                        <span className="text-sm text-gray-500">
                          {selectedApplication.studentYear}
                        </span>
                      )}
                      {selectedApplication.studentMajor && (
                        <span className="text-sm text-gray-500">
                          {selectedApplication.studentMajor}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Applied for: <span className="font-medium">{getPositionTitle(selectedApplication.positionId)}</span>
                    </span>
                    <p className="text-sm text-gray-500">
                      Submitted: {formatDate(selectedApplication.submittedAt)}
                    </p>
                  </div>
                </div>
                
                {/* Application details */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Interest Statement</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                    {selectedApplication.statement || 'No statement provided'}
                  </div>
                </div>
                
                {/* Resume link if available */}
                {selectedApplication.resumeUrl && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Resume</h4>
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                    >
                      View Resume
                    </a>
                  </div>
                )}
                
                {/* Navigation and action buttons */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPrevApplication}
                      disabled={currentIndex === 0 || isLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-500 py-2">
                      {currentIndex + 1} of {filteredApplications.length}
                    </span>
                    <button
                      onClick={goToNextApplication}
                      disabled={currentIndex === filteredApplications.length - 1 || isLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      Next
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedApplication.id as string, 'rejected')}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <HandThumbDownIcon className="h-5 w-5 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApplication.id as string, 'liked')}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <HandThumbUpIcon className="h-5 w-5 mr-1" />
                      Like
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Split View - List of applications on the left, details on the right */
        <div className="flex space-x-6">
          {/* Left sidebar - Applications list */}
          <div className="w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-[calc(100vh-250px)] overflow-y-auto">
              {filteredApplications.map((application, index) => (
                <div
                  key={application.id}
                  onClick={() => selectApplication(application, index)}
                  className={`p-4 border-b border-gray-200 cursor-pointer ${
                    selectedApplication?.id === application.id
                      ? 'bg-purple-50 border-l-4 border-l-purple-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {application.studentName}
                        {application.isTopChoice && (
                          <span className="ml-2 flex items-center text-yellow-500" title="Top Choice">
                            <StarIcon className="h-4 w-4" />
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{application.studentEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {application.studentYear} • {application.studentMajor}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(application.submittedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Position: {getPositionTitle(application.positionId)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Application details */}
          <div className="w-2/3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {selectedApplication ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      {selectedApplication.studentName}
                      {selectedApplication.isTopChoice && (
                        <span className="ml-2 flex items-center text-yellow-500" title="Top Choice">
                          <StarIcon className="h-5 w-5" />
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">{selectedApplication.studentEmail}</p>
                    <div className="flex space-x-3 mt-1">
                      {selectedApplication.studentYear && (
                        <span className="text-sm text-gray-500">
                          {selectedApplication.studentYear}
                        </span>
                      )}
                      {selectedApplication.studentMajor && (
                        <span className="text-sm text-gray-500">
                          {selectedApplication.studentMajor}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Applied for: <span className="font-medium">{getPositionTitle(selectedApplication.positionId)}</span>
                    </span>
                    <p className="text-sm text-gray-500">
                      Submitted: {formatDate(selectedApplication.submittedAt)}
                    </p>
                  </div>
                </div>
                
                {/* Application details */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Interest Statement</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                    {selectedApplication.statement || 'No statement provided'}
                  </div>
                </div>
                
                {/* Resume link if available */}
                {selectedApplication.resumeUrl && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Resume</h4>
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                    >
                      View Resume
                    </a>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id as string, 'rejected')}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <HandThumbDownIcon className="h-5 w-5 mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id as string, 'liked')}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <HandThumbUpIcon className="h-5 w-5 mr-1" />
                    Like
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center text-gray-500">
                <p>Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsReviewManager;