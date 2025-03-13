'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PencilIcon } from '@heroicons/react/24/outline';

interface ProfileDisplayProps {
  onEditClick: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ onEditClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onEditClick}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Edit button */}
      <button
        onClick={onEditClick}
        className="absolute top-0 right-0 p-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center gap-2"
        aria-label="Edit profile"
      >
        <PencilIcon className="h-5 w-5" />
        <span>Edit Profile</span>
      </button>

      {/* Header with name and role */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {profileData.firstName} {profileData.lastName}
        </h1>
        <div className="mt-2 inline-block px-3 py-1 bg-violet-100 text-violet-800 text-sm font-medium rounded-full">
          {profileData.role === 'student' ? 'Student' : 
           profileData.role === 'faculty' ? 'Faculty' : 
           profileData.role === 'admin' ? 'Administrator' : 'User'}
        </div>
      </div>

      {/* Basic information */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="mb-3">
          <span className="text-gray-500 text-sm">University</span>
          <p className="font-medium text-gray-900 text-lg">{profileData.university || 'Not specified'}</p>
        </div>

        {profileData.role === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <span className="text-gray-500 text-sm">Major</span>
              <p className="font-medium text-gray-900">{profileData.major || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Graduation Year</span>
              <p className="font-medium text-gray-900">{profileData.graduationYear || 'Not specified'}</p>
            </div>
          </div>
        )}

        {profileData.role === 'faculty' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <span className="text-gray-500 text-sm">Department</span>
              <p className="font-medium text-gray-900">{profileData.department || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Title</span>
              <p className="font-medium text-gray-900">{profileData.title || 'Not specified'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bio/About */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
        <p className="text-gray-700 whitespace-pre-line text-lg">
          {profileData.bio || profileData.aboutMe || 'No bio provided'}
        </p>
      </div>

      {/* Skills section */}
      {profileData.role === 'student' && (
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
          {profileData.skills && profileData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-1.5 bg-violet-50 text-violet-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No skills listed</p>
          )}
        </div>
      )}

      {/* Research Interests */}
      {(profileData.role === 'faculty' || profileData.role === 'student') && (
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {profileData.role === 'faculty' ? 'Research Interests' : 'Interests'}
          </h2>
          {profileData.researchInterests || (profileData.interests && profileData.interests.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {profileData.role === 'faculty' && typeof profileData.researchInterests === 'string' && (
                <p className="text-gray-700 text-lg">{profileData.researchInterests}</p>
              )}
              {profileData.interests && profileData.interests.length > 0 && 
                profileData.interests.map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-violet-50 text-violet-800 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))
              }
            </div>
          ) : (
            <p className="text-gray-500 italic">No interests listed</p>
          )}
        </div>
      )}

      {/* Resume */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Resume</h2>
        {profileData.resumeURL ? (
          <a
            href={profileData.resumeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {profileData.resumeName || 'Resume'}
          </a>
        ) : (
          <p className="text-gray-500 italic">No resume uploaded</p>
        )}
      </div>
    </div>
  );
};

export default ProfileDisplay;