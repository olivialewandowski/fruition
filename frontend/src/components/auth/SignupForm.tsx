"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  createUserWithEmailAndPassword, 
  AuthError
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { signInWithGoogle } from '@/services/authService';
import { motion, AnimatePresence } from 'framer-motion';

// Define proper types
interface SignupFormData {
  email: string;
  password: string;
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
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Add check for Firebase initialization and trigger animations after page load
  useEffect(() => {
    if (!auth?.config?.apiKey) {
      console.error('Firebase not properly initialized');
      setError('Authentication service not properly initialized');
    }
    
    // Trigger animations after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300); // Increased delay for better reliability
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(formData.email);
      
      // Validate inputs
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        setError('Please enter a valid email address');
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

      // Important: No Firestore document creation here!
      // We'll create the document in the ProfileCompletion component
      // This avoids the Firestore trigger from running on an incomplete document

      // Store token with httpOnly flag if possible
      try {
        const idToken = await userCredential.user.getIdToken();
        // Store in localStorage as a fallback
        localStorage.setItem('authToken', idToken);
        
        // Navigate to profile completion
        router.push('/development/complete-profile');
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        // Still navigate even if token storage fails
        router.push('/development/complete-profile');
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
      // Use the improved signInWithGoogle function from services
      const user = await signInWithGoogle();
      
      if (!user) {
        throw new Error('Google sign-in failed');
      }
      
      // Securely store token
      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('authToken', idToken);
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        // Continue even if token storage fails
      }
      
      // Redirect to profile completion
      router.push('/development/complete-profile');
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

  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        duration: 0.6,
        ease: "easeOut"
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.1 + custom * 0.15,
        ease: "easeOut"
      }
    })
  };

  const buttonHoverVariants = {
    hover: { 
      scale: 1.01,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.99,
      transition: { duration: 0.1 }
    }
  };

  const inputFocusVariants = {
    focus: { 
      scale: 1.01,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Sign Up Form */}
      <div className="w-full md:w-1/3 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <AnimatePresence>
          {isPageLoaded && (
            <motion.div 
              className="mx-auto w-full max-w-md"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Logo */}
              <motion.div 
                className="flex justify-center mb-6"
                variants={itemVariants}
              >
                <h1 className="text-4xl font-bold text-purple-800 font-montserrat-italic">fruition</h1>
              </motion.div>
              
              <motion.h2 
                className="mt-2 text-center text-3xl font-extrabold text-gray-900"
                variants={itemVariants}
              >
                Sign up
              </motion.h2>
              
              <motion.p 
                className="mt-2 text-center text-sm text-gray-600 mb-8"
                variants={itemVariants}
              >
                Create your account to get started
              </motion.p>

              <motion.div 
                className="space-y-6"
                variants={itemVariants}
              >
                {/* Google Sign-in Button */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHoverVariants}
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="w-5 h-5 mr-2"
                  />
                  Sign up with Google
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <motion.input
                      type="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="you@company.com"
                      whileFocus="focus"
                      variants={inputFocusVariants}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <motion.input
                      type="password"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      whileFocus="focus"
                      variants={inputFocusVariants}
                    />
                  </div>

                  {error && (
                    <motion.div 
                      className="text-red-600 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-700 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonHoverVariants}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>
              </motion.div>

              <motion.div 
                className="mt-6 text-center text-sm"
                variants={itemVariants}
              >
                <p className="text-gray-600">
                  Have an account?{' '}
                  <Link href="/development/login" className="font-medium text-purple-600 hover:text-violet-800 transition-colors duration-300">
                    Sign In →
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel - Features */}
      <motion.div 
        className="hidden md:flex md:w-2/3 bg-zinc-800 flex-col justify-center items-center p-12 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPageLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {/* Background Blur Elements */}
        <motion.div 
          className="absolute top-[10%] left-[10%] -translate-x-1/2 -translate-y-1/2 z-0 h-[30rem] w-[35rem] rounded-full blur-[8rem] bg-fuchsia-800"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.7, 0.6]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-[5%] right-[5%] -translate-x-1/2 -translate-y-1/2 z-0 h-[25rem] w-[30rem] rounded-full blur-[10rem] bg-purple-500"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-[20%] right-[70%] -translate-x-1/2 -translate-y-1/2 z-0 h-[20rem] w-[25rem] rounded-full blur-[7rem] bg-violet-800"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0.5, 0.4]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        
        {/* Additional blur element for more depth */}
        <motion.div 
          className="absolute top-[40%] right-[40%] -translate-x-1/2 -translate-y-1/2 z-0 h-[18rem] w-[22rem] rounded-full blur-[9rem] bg-violet-400/60"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        ></motion.div>
        
        <div className="w-full h-full flex flex-col justify-between relative z-10">
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="max-w-lg text-white">
              <motion.div
                className="flex items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-5xl font-bold whitespace-nowrap">Welcome to Fruition!</h1>
              </motion.div>
              
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-xl leading-relaxed">
                  Skip repetitive and manual research-matching tasks. Get highly productive through automation and save tons of time!
                </p>
              </motion.div>
              
              <div className="space-y-8">
                {[
                  {
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    ),
                    title: "Find Research Projects"
                  },
                  {
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    ),
                    title: "Connect with Faculty"
                  },
                  {
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    ),
                    title: "Apply with One Click"
                  },
                  {
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    ),
                    title: "Track Your Applications"
                  },
                  {
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    ),
                    title: "Build Your Research Profile"
                  }
                ].map((feature, index) => (
                  <AnimatePresence key={index}>
                    {isPageLoaded && (
                      <motion.div 
                        className="flex items-center"
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={featureVariants}
                      >
                        <div className="bg-white/20 p-2 rounded-lg mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {feature.icon}
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{feature.title}</h3>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>
          </div>
          
          <motion.div
            className="text-sm text-white/70 self-start pl-4 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            © 2023 Fruition. All rights reserved.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupForm;