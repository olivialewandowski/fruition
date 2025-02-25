'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileCompletion = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Create a local auth state listener to ensure we have the latest auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Only redirect if we're sure the user is not authenticated
        setTimeout(() => {
          if (!auth.currentUser) {
            router.replace('/development/login');
          }
        }, 1000); // Add a delay to prevent immediate redirect
      } else {
        // User is authenticated, check profile
        checkUserProfile(currentUser.uid);
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Separate function to check user profile
  const checkUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      // If user profile is complete, redirect to dashboard
      if (userDoc.exists() && userDoc.data().role) {
        router.replace('/development/dashboard');
      } else {
        // Pre-fill form with any available user data
        const currentUser = auth.currentUser;
        if (currentUser) {
          if (currentUser.displayName) {
            const nameParts = currentUser.displayName.split(' ');
            setFormData(prev => ({
              ...prev,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || ''
            }));
          }
          
          if (currentUser.email) {
            setFormData(prev => ({
              ...prev,
              email: currentUser.email
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error checking user profile:', err);
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update user profile in Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: currentUser.email,
        institution: formData.institution.trim(),
        role: formData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Redirect to dashboard
      router.replace('/development/dashboard');
    } catch (err) {
      console.error('Profile completion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="text-xl font-semibold mb-4">Loading...</div>
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user is detected after loading, show an error
  if (!auth.currentUser && !pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="text-xl font-semibold mb-4 text-red-600">Authentication Error</div>
        <p className="mb-4">You need to be logged in to complete your profile.</p>
        <button
          onClick={() => router.push('/development/login')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide some additional information to complete your account setup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Role Selection Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className={`py-2 px-4 rounded-md w-full ${
                  formData.role === 'faculty'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleRoleSelect('faculty')}
              >
                Faculty
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md w-full ${
                  formData.role === 'student'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleRoleSelect('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md w-full ${
                  formData.role === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleRoleSelect('admin')}
              >
                Admin
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Institution
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={!formData.role || isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${formData.role && !isLoading ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion; 