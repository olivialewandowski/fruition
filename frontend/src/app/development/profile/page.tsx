'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNavigation from '@/components/dashboard/TopNavigation';
import ProfileForm from '@/components/profile/ProfileForm';

const ProfilePage: React.FC = () => {
  return (
    <div className="flex overflow-hidden bg-white border border-solid border-neutral-200">
      <Sidebar />
      <div className="flex flex-col grow shrink-0 self-start basis-0 w-fit max-md:max-w-full">
        <TopNavigation />
        <div className="flex flex-col items-start px-5 mt-6 w-full max-md:max-w-full">
          <div className="flex flex-wrap gap-5 justify-between self-stretch mr-6 ml-3.5 w-full font-bold text-center max-w-[1050px] max-md:mr-2.5 max-md:max-w-full">
            <div className="my-auto text-3xl text-black">Edit Profile</div>
          </div>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;