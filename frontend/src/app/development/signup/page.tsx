'use client';

import type { NextPage } from 'next';
import SignupForm from '@/components/auth/SignupForm';

const SignupPage: NextPage = () => {
  return (
    <div className="min-h-screen">
      <SignupForm />
    </div>
  );
};

export default SignupPage;