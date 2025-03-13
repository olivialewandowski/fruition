'use client';

import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import { useRouter } from 'next/navigation';

const EditProfilePage: React.FC = () => {
  const router = useRouter();

  // Handler for when the form is submitted or canceled
  const handleProfileUpdated = () => {
    // Navigate back to the profile view page
    router.push('/development/profile');
  };

  return (
    <BaseLayout title="Edit Profile">
      <div className="flex flex-col items-start w-full max-w-4xl mx-auto px-4">
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={handleProfileUpdated}
            className="px-4 py-2 text-violet-600 hover:text-violet-800"
          >
            Cancel Editing
          </button>
        </div>
        <ProfileForm onProfileUpdated={handleProfileUpdated} />
      </div>
    </BaseLayout>
  );
};

export default EditProfilePage;