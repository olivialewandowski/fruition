'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Define proper types for form data
interface ProfileFormData {
  firstName: string;
  lastName: string;
  university: string; // Using university name for display
  role: 'student' | 'faculty' | 'admin' | '';
}

function getUniversityId(universityName: string): string {
  // For now, we only support NYU
  if (universityName === "New York University") {
    return "nyu";
  }
  // Default to using the name itself for any other university
  return universityName;
}

// Simple sanitization function to prevent XSS
function sanitizeInput(input: string): string {
  // Handle null, undefined, or non-string inputs
  if (input === null || input === undefined || typeof input !== 'string') {
    return '';
  }
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

const ProfileCompletion = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    university: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Memoize the function to check user profile
  const checkUserProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.error('Invalid userId provided to checkUserProfile');
        return false;
      }
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('Profile check - Firestore data:', userDoc.exists() ? userDoc.data() : 'No data');
      
      // If user profile is complete, redirect to dashboard
      if (userDoc.exists() && 
          userDoc.data().profileCompleted === true && 
          userDoc.data().role && 
          userDoc.data().firstName && 
          userDoc.data().lastName && 
          userDoc.data().university) { // Check only for university field
        console.log('Profile is complete, redirecting to dashboard');
        // Use window.location to force a full page reload
        window.location.href = '/development/dashboard';
        return true;
      } else {
        console.log('Profile is incomplete, staying on profile completion page');
        // Pre-fill form with any available user data
        const currentUser = auth.currentUser;
        if (currentUser) {
          const docData = userDoc.exists() ? userDoc.data() : {};
          
          // Set form data with existing values or defaults
          // Sanitize any data coming from external sources
          setFormData(prev => ({
            ...prev,
            firstName: docData.firstName ? sanitizeInput(docData.firstName) : 
                      (currentUser.displayName ? sanitizeInput(currentUser.displayName.split(' ')[0]) : ''),
            lastName: docData.lastName ? sanitizeInput(docData.lastName) : 
                     (currentUser.displayName ? sanitizeInput(currentUser.displayName.split(' ').slice(1).join(' ')) : ''),
            university: docData.university ? sanitizeInput(docData.university) : '',
            role: (docData.role && ['student', 'faculty', 'admin'].includes(docData.role)) ? docData.role : ''
          }));
        }
        return false;
      }
    } catch (err) {
      console.error('Error checking user profile:', err);
      return false;
    }
  }, [router, setFormData]);

  useEffect(() => {
    let isMounted = true;
    
    // Create a local auth state listener to ensure we have the latest auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      
      if (!currentUser) {
        // Only redirect if we're sure the user is not authenticated
        setTimeout(() => {
          if (!auth.currentUser && isMounted) {
            router.replace('/development/login');
          }
        }, 1000); // Add a delay to prevent immediate redirect
      } else {
        // User is authenticated, check profile in a separate tick
        setTimeout(() => {
          if (isMounted) {
            checkUserProfile(currentUser.uid);
          }
        }, 0);
      }
      
      if (isMounted) {
        setPageLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, checkUserProfile]);

  const handleRoleSelect = (selectedRole: 'student' | 'faculty' | 'admin') => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Sanitize all input values
    const sanitizedFirstName = sanitizeInput(formData.firstName);
    const sanitizedLastName = sanitizeInput(formData.lastName);
    const sanitizedUniversity = sanitizeInput(formData.university);
    
    // Validate all required fields
    if (!sanitizedFirstName) {
      setError('First name is required');
      return;
    }
    
    if (!sanitizedLastName) {
      setError('Last name is required');
      return;
    }
    
    if (!formData.university) {
      setError('University selection is required');
      return;
    }
    
    if (!formData.role || !['student', 'faculty', 'admin'].includes(formData.role)) {
      setError('Please select a valid role');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get university ID from name
      const universityId = getUniversityId(sanitizedUniversity);

      console.log('Updating user profile with data:', {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: currentUser.email,
        university: sanitizedUniversity,  // Store the university name
        universityId: universityId,       // Also store the university ID
        role: formData.role,
        profileCompleted: true
      });

      // Update user profile in Firestore with sanitized data
      await setDoc(doc(db, 'users', currentUser.uid), {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: currentUser.email,
        university: sanitizedUniversity,  // Store the university name
        universityId: universityId,       // Also store the university ID
        role: formData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompleted: true // Add a flag to explicitly mark profile as completed
      }, { merge: true });

      // Verify the data was written by reading it back
      const userDocRef = doc(db, 'users', currentUser.uid);
      let attempts = 0;
      const maxAttempts = 5;
      
      const verifyDataWritten = async () => {
        try {
          const docSnap = await getDoc(userDocRef);
          console.log('Verification check - Firestore data:', docSnap.exists() ? docSnap.data() : 'No data');
          
          if (docSnap.exists() && 
              docSnap.data().firstName === sanitizedFirstName &&
              docSnap.data().role === formData.role &&
              docSnap.data().profileCompleted === true) {
            console.log('Profile data verified in Firestore, redirecting to dashboard');
            
            // Force a reload of the page to clear any cached state
            window.location.href = '/development/dashboard';
            return;
          } else if (attempts < maxAttempts) {
            attempts++;
            console.log(`Data not yet available, retrying... (${attempts}/${maxAttempts})`);
            setTimeout(verifyDataWritten, 500);
          } else {
            console.log('Max verification attempts reached, redirecting anyway');
            // Force a reload of the page to clear any cached state
            window.location.href = '/development/dashboard';
          }
        } catch (error) {
          console.error('Error verifying profile data:', error);
          // Force a reload of the page to clear any cached state
          window.location.href = '/development/dashboard';
        }
      };
      
      // Start verification process
      verifyDataWritten();
    } catch (err) {
      console.error('Profile completion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
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

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                University
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.university}
                onChange={(e) => setFormData({...formData, university: e.target.value})}
              >
                <option value="">Select your university</option>
                <option value="New York University">New York University</option>
              </select>
            </div>

            {/* Role Selection Buttons */}
            <div>
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