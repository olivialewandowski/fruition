// src/app/development/projects/create/page.tsx
'use client';

import React from 'react';
import FacultySidebar from '@/components/layout/FacultySidebar';
import FacultyProjectCreationForm from '@/components/projects/FacultyProjectCreationForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CreateProjectPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  // Redirect if not faculty or admin
  if (userData && userData.role !== 'faculty' && userData.role !== 'admin') {
    router.push('/development/dashboard');
    return null;
  }
  
  // Unauthorized state
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h2>
          <p className="text-gray-700 mb-6">Please log in to access this page.</p>
          <button
            onClick={() => router.push('/development/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="p-4">
        <FacultySidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl my-4 mr-4">
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Project</h1>
          <FacultyProjectCreationForm />
        </div>
      </div>
    </div>
  );
}