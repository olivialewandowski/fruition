// src/components/projects/LikedApplicationsManager.tsx
// Modified version with fixed type compatibility

import React, { useState } from 'react';
import { Application, ApplicationStatus, ensureValidStatus } from '@/types/application';
import { Position } from '@/types/position';
import { updateApplicationStatus } from '@/services/clientProjectService';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface LikedApplicationsManagerProps {
  applications: Application[];
  positions: Position[];
  onApplicationUpdated: (application: Application) => void;
}

const LikedApplicationsManager: React.FC<LikedApplicationsManagerProps> = ({
  applications,
  positions,
  onApplicationUpdated
}) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterPosition, setFilterPosition] = useState<string | 'all'>('all');
  
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
  
  // Handle accepting application
  const handleAcceptApplication = async (applicationId: string) => {
    if (!applicationId) return;
    
    setIsLoading(true);
    
    try {
      await updateApplicationStatus(applicationId, 'accepted');
      
      // Find the application and update it locally
      const updatedApplication = applications.find(app => app.id === applicationId);
      
      if (updatedApplication) {
        const newApplication = { 
          ...updatedApplication, 
          status: 'accepted' as ApplicationStatus 
        };
        onApplicationUpdated(newApplication);
      }
    } catch (err) {
      console.error('Error accepting application:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle rejecting application
  const handleRejectApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    
    setIsLoading(true);
    
    try {
      await updateApplicationStatus(applicationId, 'rejected');
      
      // Find the application and update it locally
      const updatedApplication = applications.find(app => app.id === applicationId);
      
      if (updatedApplication) {
        const newApplication = { 
          ...updatedApplication, 
          status: 'rejected' as ApplicationStatus 
        };
        onApplicationUpdated(newApplication);
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle returning application to pending
  const handleResetApplication = async (applicationId: string) => {
    setIsLoading(true);
    
    try {
      await updateApplicationStatus(applicationId, 'pending');
      
      // Find the application and update it locally
      const updatedApplication = applications.find(app => app.id === applicationId);
      
      if (updatedApplication) {
        const newApplication = { 
          ...updatedApplication, 
          status: 'pending' as ApplicationStatus 
        };
        onApplicationUpdated(newApplication);
      }
    } catch (err) {
      console.error('Error resetting application status:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get unique position IDs for filter
  const uniquePositionIds = Array.from(new Set(applications.map(app => app.positionId)))
    .filter(Boolean);
  
  // Filter applications by position
  const filteredApplications = applications.filter(app => 
    filterPosition === 'all' || app.positionId === filterPosition
  );
  
  // If no applications
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No liked applications</h3>
        <p className="text-gray-600 mb-6">
          You haven't liked any applications yet. 
          Review applications in the "Review" tab to like candidates.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Position filter */}
      <div className="mb-4">
        <label htmlFor="filterPosition" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Position
        </label>
        <select
          id="filterPosition"
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          <option value="all">All Positions</option>
          {uniquePositionIds.map((positionId) => (
            <option key={positionId} value={positionId}>
              {getPositionTitle(positionId)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Applications grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApplications.map((application) => (
          <div 
            key={application.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    {application.studentName}
                    {application.isTopChoice && (
                      <span className="ml-2 flex items-center text-yellow-500" title="Top Choice">
                        <StarIcon className="h-4 w-4" />
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{application.studentEmail}</p>
                  <div className="flex space-x-3 mt-1">
                    {application.studentYear && (
                      <span className="text-xs text-gray-500">
                        {application.studentYear}
                      </span>
                    )}
                    {application.studentMajor && (
                      <span className="text-xs text-gray-500">
                        {application.studentMajor}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    application.status === 'liked' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {application.status === 'liked' ? 'Liked' : 'Accepted'}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Position:</span> {getPositionTitle(application.positionId)}
              </p>
              
              <p className="text-xs text-gray-600 mb-4">
                <span className="font-medium">Applied:</span> {formatDate(application.submittedAt)}
              </p>
              
              <div className="line-clamp-3 text-sm text-gray-700 mb-4">
                {application.statement || 'No statement provided'}
              </div>
              
              <div className="flex space-x-2">
                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    View Resume
                  </a>
                )}
                <button
                  onClick={() => setSelectedApplication(selectedApplication?.id === application.id ? null : application)}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  {selectedApplication?.id === application.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              {selectedApplication?.id === application.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Full Interest Statement</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mb-4">
                    {application.statement || 'No statement provided'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-2">
              {application.status === 'liked' ? (
                <>
                  <button
                    onClick={() => handleResetApplication(application.id as string)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Reset
                  </button>
                  <button
                    onClick={() => handleRejectApplication(application.id as string)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAcceptApplication(application.id as string)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Accept
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleResetApplication(application.id as string)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Reset
                  </button>
                  <button
                    onClick={() => handleRejectApplication(application.id as string)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedApplicationsManager;