// src/components/projects/TeamManager.tsx
import React, { useState } from 'react';
import { User } from '@/types/user';
import { removeTeamMember, updateTeamMemberRole } from '@/services/clientProjectService';

interface TeamManagerProps {
  projectId: string;
  teamMembers: User[];
  onTeamUpdated: (teamMembers: User[]) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({
  projectId,
  teamMembers,
  onTeamUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<{userId: string, role: string} | null>(null);

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

  // Handle team member removal
  const handleRemoveTeamMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await removeTeamMember(projectId, userId);
      
      // Update local state
      const updatedTeamMembers = teamMembers.filter(member => member.id !== userId);
      onTeamUpdated(updatedTeamMembers);
      
      setSuccessMessage('Team member removed successfully');
      
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Failed to remove team member');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await updateTeamMemberRole(projectId, userId, newRole);
      
      // Update local state
      const updatedTeamMembers = teamMembers.map(member => 
        member.id === userId ? {...member, projectRole: newRole} : member
      );
      
      onTeamUpdated(updatedTeamMembers);
      setEditingRole(null);
      setSuccessMessage('Team member role updated successfully');
      
    } catch (err) {
      console.error('Error updating team member role:', err);
      setError('Failed to update team member role');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle expanded user details
  const toggleUserDetails = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  // Set the member role to edit
  const startEditRole = (userId: string, currentRole: string) => {
    setEditingRole({ userId, role: currentRole });
  };

  // Cancel role editing
  const cancelEditRole = () => {
    setEditingRole(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Team</h2>
      
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
      
      {teamMembers.length > 0 ? (
        <div className="space-y-6">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleUserDetails(member.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-medium text-lg">
                    {member.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {editingRole?.userId === member.id ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={editingRole.role}
                        onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                      >
                        <option value="Research Assistant">Research Assistant</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Teaching Assistant">Teaching Assistant</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                      <button 
                        onClick={() => handleRoleUpdate(member.id, editingRole.role)}
                        disabled={isLoading}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button 
                        onClick={cancelEditRole}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {member.projectRole || 'Team Member'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditRole(member.id, member.projectRole || 'Team Member');
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTeamMember(member.id);
                    }}
                    disabled={isLoading}
                    className="ml-3 text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUserDetails(member.id);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {expandedUserId === member.id && (
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Department</h4>
                      <p className="mt-1">{member.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">University</h4>
                      <p className="mt-1">{member.university || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Joined On</h4>
                      <p className="mt-1">{formatDate(member.joinedDate)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      rows={3}
                      placeholder="Add notes about this team member..."
                      defaultValue={member.notes || ''}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-xl text-gray-600 mb-2">No team members yet.</p>
          <p className="text-gray-500">
            Hire applicants from the Applications tab to build your team.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamManager;