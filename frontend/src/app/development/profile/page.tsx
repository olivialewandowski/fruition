'use client';

import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import ProfileForm from '@/components/profile/ProfileForm';

const ProfilePage: React.FC = () => {
  return (
    <BaseLayout title="Edit Profile">
      <div className="flex flex-col items-start w-full max-md:max-w-full">
        <ProfileForm />
      </div>
    </BaseLayout>
  );
};

export default ProfilePage;