// src/app/development/faculty-onboarding/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FacultyProjectCreationForm from '@/components/projects/FacultyProjectCreationForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const FacultyOnboardingPage = () => {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [loadingForm, setLoadingForm] = useState(false);

  // Redirect if already completed onboarding or not faculty
  useEffect(() => {
    if (!loading && userData) {
      // If not faculty, redirect to dashboard
      if (userData.role && userData.role !== 'faculty') {
        router.push('/development/dashboard');
      }
      
      // If faculty but already has projects, redirect to management
      if (userData.role === 'faculty' && userData.activeProjects && userData.activeProjects.length > 0) {
        router.push(`/development/management/${userData.activeProjects[0]}`);
      }
    }
  }, [loading, userData, router]);

  // Handle project creation success
  const handleProjectCreated = (projectId: string) => {
    setLoadingForm(true);
    
    // Redirect to management interface with the new project
    setTimeout(() => {
      router.push(`/development/management/${projectId}`);
    }, 1000);
  };

  if (loading || loadingForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to Fruition NYU Research Portal</h1>
          <p className="text-lg text-gray-600">Let's set up your first research project to get started.</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create Your Project</h2>
          <FacultyProjectCreationForm 
            onProjectCreated={handleProjectCreated}
            isOnboarding={true}
            initialEmail={user?.email || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default FacultyOnboardingPage;