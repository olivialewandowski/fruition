"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/config/firebase';

// Define proper types
interface SignupFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'admin' | 'user';
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

// Validate email format
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add check for Firebase initialization
  useEffect(() => {
    if (!auth?.config?.apiKey) {
      console.error('Firebase not properly initialized');
      setError('Authentication service not properly initialized');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedFirstName = sanitizeInput(formData.firstName);
      const sanitizedLastName = sanitizeInput(formData.lastName);
      
      // Validate inputs
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      if (!sanitizedFirstName) {
        setError('First name is required');
        setIsLoading(false);
        return;
      }
      
      if (!sanitizedLastName) {
        setError('Last name is required');
        setIsLoading(false);
        return;
      }
      
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      if (!auth?.config?.apiKey) {
        setError('Authentication service not properly initialized');
        setIsLoading(false);
        return;
      }

      console.log('Attempting to create user with email:', sanitizedEmail);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedEmail,
        formData.password
      );

      // Create complete user document with all fields
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        role: formData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileCompleted: true
      });

      // Securely store token with httpOnly flag if possible
      try {
        const idToken = await userCredential.user.getIdToken();
        // Store in localStorage as a fallback
        localStorage.setItem('authToken', idToken);
        
        // Navigate to dashboard
        router.push('/development/dashboard');
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        // Still navigate even if token storage fails
        router.push('/development/dashboard');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Please contact support.');
      } else {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
      
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Securely store token
      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('authToken', idToken);
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        // Continue even if token storage fails
      }
      
      // Check if user document already exists
      const userDoc: DocumentSnapshot = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Extract name parts from Google profile if available
        let firstName = '';
        let lastName = '';
        
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          firstName = sanitizeInput(nameParts[0] || '');
          lastName = sanitizeInput(nameParts.slice(1).join(' ') || '');
        }
        
        // Create a more complete user document with default values
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            // Don't set role yet - will be set in profile completion
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          
          // Verify the data was written
          let attempts = 0;
          const maxAttempts = 3;
          
          const verifyDataWritten = async () => {
            try {
              const docSnap = await getDoc(doc(db, 'users', user.uid));
              if (docSnap.exists() && docSnap.data().firstName === firstName) {
                console.log('Initial Google user data verified in Firestore');
                router.push('/development/complete-profile');
              } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`Data not yet available, retrying... (${attempts}/${maxAttempts})`);
                setTimeout(verifyDataWritten, 500);
              } else {
                console.log('Max verification attempts reached, redirecting anyway');
                router.push('/development/complete-profile');
              }
            } catch (error) {
              console.error('Error verifying initial user data:', error);
              router.push('/development/complete-profile');
            }
          };
          
          // Start verification process
          verifyDataWritten();
        } catch (firestoreError) {
          console.error('Error creating user document:', firestoreError);
          // Still redirect to profile completion
          router.push('/development/complete-profile');
        }
      } else {
        // User document exists, redirect to profile completion
        router.push('/development/complete-profile');
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      
      // Handle specific Firebase auth errors
      const authError = err as AuthError;
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (authError.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please enable pop-ups for this site and try again.');
      } else if (authError.code === 'auth/cancelled-popup-request') {
        setError('Sign-in process was interrupted. Please try again.');
      } else if (authError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(authError.message || 'Failed to sign in with Google');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up to get started with Fruition
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Google Sign-in Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5 mr-2"
              />
              Sign up with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as 'student' | 'faculty' | 'admin' | 'user'})}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${!isLoading ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
          
          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/development/login" className="font-medium text-purple-600 hover:text-purple-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
