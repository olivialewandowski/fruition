'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function DevLoginPage() {
  return (
    <div className="dev-environment">
      <div className="bg-yellow-100 p-4 text-yellow-800 text-center">
        Development Environment
      </div>
      <LoginForm />
    </div>
  );
}