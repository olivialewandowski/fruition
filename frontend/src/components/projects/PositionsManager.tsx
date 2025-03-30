// src/components/projects/PositionsManager.tsx
// Modified version with fixed type compatibility

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Position, PositionStatus } from '@/types/position';
import { updatePosition, archivePosition, unarchivePosition } from '@/services/clientProjectService';

interface PositionsManagerProps {
  projectId: string;
  positions: Position[];
  onPositionsUpdated: (positions: Position[]) => void;
  type: 'active' | 'archived';
}

const PositionsManager: React.FC<PositionsManagerProps> = ({
  projectId,
  positions,
  onPositionsUpdated,
  type
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Format date helper function
  const formatDate = (date: any) => {
    if (!date) return 'Not specified';
    
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
      return 'Invalid Date';
    }
  };
  
  // Archive position
  const handleArchivePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to archive this position? It will no longer be visible to students.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await archivePosition(positionId, projectId);
      
      // Update local state
      const updatedPositions = positions.map(pos => {
        if (pos.id === positionId) {
          return { ...pos, status: "archived" as PositionStatus };
        }
        return pos;
      });
      
      onPositionsUpdated(updatedPositions);
      setSuccessMessage('Position archived successfully');
      
    } catch (err) {
      console.error('Error archiving position:', err);
      setError('Failed to archive position');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Unarchive position
  const handleUnarchivePosition = async (positionId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await unarchivePosition(positionId, projectId);
      
      // Update local state
      const updatedPositions = positions.map(pos => {
        if (pos.id === positionId) {
          return { ...pos, status: "open" as PositionStatus };
        }
        return pos;
      });
      
      onPositionsUpdated(updatedPositions);
      setSuccessMessage('Position unarchived successfully');
      
    } catch (err) {
      console.error('Error unarchiving position:', err);
      setError('Failed to unarchive position');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit position
  const handleEditPosition = (positionId: string) => {
    router.push(`/development/projects/${projectId}/positions/${positionId}`);
  };
  
  return (
    <div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200 mb-4">
          <strong>Success:</strong> {successMessage}
        </div>
      )}
      
      {positions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map((position) => (
            <div 
              key={position.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (position.status === 'open' || position.status === 'active') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {position.status === 'archived' ? 'Archived' : position.status === 'filled' ? 'Filled' : 'Active'}
                    </span>
                    {position.compensation?.type?.includes('Paid') && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  {position.positionTypes?.join(' • ')}
                </p>
                
                <div className="text-gray-600 line-clamp-3 mb-4">
                  {position.qualifications}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Hours per week:</span> {position.hoursPerWeek || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Spots:</span> {position.filledPositions || 0} / {position.maxPositions || 1}
                  </div>
                  {position.startDate && (
                    <div>
                      <span className="font-medium">Start date:</span> {formatDate(position.startDate)}
                    </div>
                  )}
                  {position.endDate && (
                    <div>
                      <span className="font-medium">End date:</span> {formatDate(position.endDate)}
                    </div>
                  )}
                  {position.applicationCloseDate && !position.rollingApplications && (
                    <div className="col-span-2">
                      <span className="font-medium">Application deadline:</span> {formatDate(position.applicationCloseDate)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
                <div className="text-xs text-gray-500">
                  Created: {formatDate(position.createdAt)}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditPosition(position.id as string)}
                    className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  {type === 'active' ? (
                    <button
                      onClick={() => handleArchivePosition(position.id as string)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnarchivePosition(position.id as string)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No positions found</h3>
          <p className="text-gray-600 mb-6">
            {type === 'active' 
              ? 'You haven\'t posted any active positions yet. Create your first position to start recruiting students!' 
              : 'You don\'t have any archived positions.'
            }
          </p>
          {type === 'active' && (
            <button
              onClick={() => router.push(`/development/projects/${projectId}/positions/create`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Post New Position
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionsManager;