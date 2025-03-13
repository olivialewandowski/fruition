// src/components/projects/ApplicationsManager.tsx
import React, { useState, useEffect } from 'react';
import { Position } from '@/types/position';
import { Application, ApplicationStatus, isValidApplicationStatus } from '@/types/application';
import { User } from '@/types/user';
import { updateApplicationStatus, hireApplicant } from '@/services/clientProjectService';

interface ApplicationsManagerProps {
  projectId: string;
  positions: Position[];
  applications: Application[];
  onApplicationsUpdated: (applications: Application[]) => void;
  onTeamUpdated: (teamMembers: User[]) => void;
}

const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  projectId,
  positions,
  applications,
  onApplicationsUpdated,
  onTeamUpdated
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string | 'all'>('all');
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessages, setActionMessages] = useState<{id: string, message: string, type: 'success' | 'error'}[]>([]);
  
  // Filter applications when selected position changes
  useEffect(() => {
    if (selectedPosition === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.positionId === selectedPosition));
    }
  }, [selectedPosition, applications]);

  // Clear messages after timeout
  useEffect(() => {
    if (actionMessages.length > 0) {
      const timer = setTimeout(() => {
        setActionMessages([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [actionMessages]);

  // Handle status change
  const handleStatusChange = async (applicationId: string, newStatus: 'pending' | 'rejected' | 'accepted' | 'hired') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update application status
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update application in local state
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? {...app, status: newStatus} : app
      );
      
      onApplicationsUpdated(updatedApplications);
      
      // Show success message
      setActionMessages([...actionMessages, {
        id: applicationId,
        message: `Application status updated to ${newStatus}`,
        type: 'success'
      }]);
      
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
      
      // Show error message
      setActionMessages([...actionMessages, {
        id: applicationId,
        message: 'Failed to update application status',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore Timestamp
      if (typeof timestamp === 'object' && timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      } 
      // Handle Date object
      else if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      } 
      // Handle string or number
      else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleDateString();
      }
      // Handle FieldValue or other types
      else {
        return 'Unknown';
      }
    } catch (e) {
      return 'Unknown';
    }
  };

  // Handle hiring
  const handleHire = async (applicationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First get the application
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      // Hire the applicant
      const result = await hireApplicant(projectId, applicationId);
      
      // Update application in local state
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? {...app, status: 'hired' as ApplicationStatus} : app
      );
      
      onApplicationsUpdated(updatedApplications);
      
      // Add the team member to the team
      if (result.teamMember) {
        onTeamUpdated([result.teamMember]);
      }
      
      // Show success message
      setActionMessages([...actionMessages, {
        id: applicationId,
        message: `Applicant successfully hired`,
        type: 'success'
      }]);
      
    } catch (err) {
      console.error('Error hiring applicant:', err);
      setError('Failed to hire applicant');
      
      // Show error message
      setActionMessages([...actionMessages, {
        id: applicationId,
        message: 'Failed to hire applicant',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get position title
  const getPositionTitle = (positionId: string) => {
    const position = positions.find(pos => pos.id === positionId);
    return position ? position.title : 'Unknown Position';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Applications</h2>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Position Filter */}
      <div className="mb-6">
        <label htmlFor="positionFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Position
        </label>
        <select
          id="positionFilter"
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          <option value="all">All Positions</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
            </option>
          ))}
        </select>
      </div>
      
      {/* Applications Table */}
      <div className="overflow-x-auto">
        {filteredApplications.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id || `app-${Math.random()}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.studentEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getPositionTitle(application.positionId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(application.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                      ${application.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${application.status === 'hired' ? 'bg-purple-100 text-purple-800' : ''}
                      ${application.status === 'interviewing' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    {/* Action message */}
                    {application.id && actionMessages.find(msg => msg.id === application.id) && (
                      <div className={`text-xs mt-1 ${
                        actionMessages.find(msg => msg.id === application.id)?.type === 'success' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {actionMessages.find(msg => msg.id === application.id)?.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {application.status === 'pending' && application.id && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleStatusChange(application.id!, 'accepted')}
                          disabled={isLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id!, 'rejected')}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {application.status === 'accepted' && application.id && (
                      <button
                        onClick={() => handleHire(application.id!)}
                        disabled={isLoading}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                      >
                        Hire
                      </button>
                    )}
                    {application.status === 'hired' && (
                      <span className="text-gray-500">Hired</span>
                    )}
                    {application.status === 'rejected' && application.id && (
                      <button
                        onClick={() => handleStatusChange(application.id!, 'pending')}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Reconsider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-xl text-gray-600">No applications found.</p>
            <p className="text-gray-500">
              {selectedPosition !== 'all' 
                ? 'Try selecting a different position or check back later.'
                : 'Check back later when students apply to your project.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsManager;