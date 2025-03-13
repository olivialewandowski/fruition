'use client';

import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import ProfileDisplay from '@/components/profile/ProfileDisplay';
import { useRouter } from 'next/navigation';

const ProfilePage: React.FC = () => {
  const router = useRouter();

  // Handler for when the edit button is clicked
  const handleEditClick = () => {
    router.push('/development/profile/edit');
  };

  return (
    <BaseLayout title="Your Profile">
      <div className="flex flex-col items-start w-full max-w-4xl mx-auto px-4">
        <ProfileDisplay onEditClick={handleEditClick} />
      </div>
    </BaseLayout>
  );
};

export default ProfilePage;