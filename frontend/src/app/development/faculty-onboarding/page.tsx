// src/app/development/faculty-onboarding/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FacultyProjectCreationForm from '@/components/projects/FacultyProjectCreationForm';

export default function FacultyOnboardingPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle successful project creation
  const handleProjectCreated = (projectId: string) => {
    setIsSubmitting(true);
    // Redirect to the project overview page
    router.push(`/development/projects/${projectId}`);
  };
  
  // If still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not logged in
  if (!user) {
    router.push('/development/login');
    return null;
  }
  
  // If not faculty
  if (userData && userData.role !== 'faculty' && userData.role !== 'admin') {
    router.push('/development/dashboard');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your First Project</h1>
          <p className="mt-2 text-gray-600">
            Welcome to the faculty portal! Let's set up your first research project to get started.
          </p>
        </div>
        
        <FacultyProjectCreationForm 
          onProjectCreated={handleProjectCreated} 
          isOnboarding={true} 
        />
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
              <LoadingSpinner size="small" />
              <p className="ml-3 text-gray-700">Creating your project...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}