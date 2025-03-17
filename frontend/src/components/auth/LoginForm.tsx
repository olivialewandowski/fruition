'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { sendPasswordResetEmail } from '@/services/authService';

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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

  // Helper function to check if profile is complete and redirect accordingly
  const checkProfileAndRedirect = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Check if essential profile fields are filled
        if (userData.role && userData.firstName && userData.lastName && userData.university) {
          // Profile is complete, redirect to dashboard
          router.push('/development/dashboard');
        } else {
          // Profile is incomplete, redirect to profile completion
          router.push('/development/complete-profile');
        }
      } else {
        // User document doesn't exist, redirect to profile completion
        router.push('/development/complete-profile');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      // Default to dashboard on error
      router.push('/development/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user) {
        const idToken = await user.getIdToken();
        localStorage.setItem('authToken', idToken);
        
        // Check if profile is complete and redirect accordingly
        await checkProfileAndRedirect(user.uid);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please enable pop-ups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in process was interrupted. Please try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
      
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Firebase directly
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      
      if (user) {
        // Get the ID token
        const idToken = await user.getIdToken();
        
        // Store the token in localStorage
        localStorage.setItem('authToken', idToken);
        
        // Check if profile is complete and redirect accordingly
        await checkProfileAndRedirect(user.uid);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      
      setIsLoading(false);
    }
  };

  // Add a new function to handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    setIsResetLoading(true);
    
    try {
      // Validate the email
      if (!resetEmail || !resetEmail.includes('@')) {
        setResetError('Please enter a valid email address');
        setIsResetLoading(false);
        return;
      }
      
      // Send password reset email using our authService
      const result = await sendPasswordResetEmail(resetEmail);
      
      if (result.success) {
        // Show success message
        setResetSuccess(true);
        setResetEmail('');
        
        // If we're in development mode, store the development message
        if (result.isDevMode && result.devModeMessage) {
          // Set the dev mode message as the reset error, but with a different styling
          setResetError(result.devModeMessage);
          // Don't auto-close in dev mode so user can see the message
        } else {
          // Auto-close modal after successful reset in production
          setTimeout(() => {
            setIsResetModalOpen(false);
            setResetSuccess(false);
            setResetError('');
          }, 5000);
        }
      } else {
        // Handle error from service
        setResetError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setResetError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResetLoading(false);
    }
  };

  // Function to close the modal
  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setResetError('');
    setResetSuccess(false);
    setResetEmail('');
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
      {/* Left Panel - Colored Background */}
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
          className="absolute bottom-[60%] right-[10%] -translate-x-1/2 -translate-y-1/2 z-0 h-[25rem] w-[30rem] rounded-full blur-[10rem] bg-purple-500"
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
                <h1 className="text-7xl font-bold whitespace-nowrap">Welcome Back!</h1>
              </motion.div>
              
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-xl leading-relaxed">
                  Connect with researchers and temp texttemp textemp textemp textemp textemp textemp textemp textemp tex!
                </p>
              </motion.div>
            </div>
          </div>
          
          <motion.div
            className="text-sm text-white/70 self-start pl-4 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            © 2025 Fruition. All rights reserved.
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
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
                Sign in
              </motion.h2>
              
              <motion.p 
                className="mt-2 text-center text-sm text-gray-600 mb-8"
                variants={itemVariants}
              >
                {"Don't"} have an account?{' '}
                <Link href="/development/signup" className="font-medium text-purple-600 hover:text-violet-800 transition-colors duration-300">
                  Sign Up
                </Link>
              </motion.p>

              <motion.div 
                className="space-y-6"
                variants={itemVariants}
              >
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div>
                    <motion.input
                      type="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Email"
                      whileFocus="focus"
                      variants={inputFocusVariants}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <motion.input
                      type="password"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Password"
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
                    {isLoading ? 'Signing in...' : 'Log in'}
                  </motion.button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
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
                  Login with Google
                </motion.button>
              </motion.div>

              <motion.div 
                className="mt-6 text-center text-sm"
                variants={itemVariants}
              >
                <p className="text-gray-600">
                  Forgot password?{' '}
                  <button 
                    onClick={() => setIsResetModalOpen(true)} 
                    className="font-medium text-purple-600 hover:text-violet-800 transition-colors duration-300"
                  >
                    Click here
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Password Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeResetModal}
            />
            
            {/* Modal */}
            <motion.div 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md z-50 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Reset Your Password
              </h3>
              
              {resetSuccess ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded">
                  <p>
                    Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                  </p>
                  
                  {/* Development mode message */}
                  {resetError && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-100 text-blue-700 rounded text-sm">
                      <p className="font-semibold mb-1">Developer Information:</p>
                      <p>{resetError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Enter your email address below and we'll send you a link to reset your password.
                  </p>
                  
                  {/* Development mode testing instructions */}
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-100 text-blue-700 rounded text-xs">
                    <p className="font-semibold">Development Testing:</p>
                    <p>In development mode, no actual emails are sent. Check console logs for details.</p>
                  </div>
                </>
              )}
              
              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3"
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetSuccess}
                  />
                </div>
                
                {!resetSuccess && resetError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {resetError}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={closeResetModal}
                    disabled={isResetLoading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-violet-700 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={isResetLoading || resetSuccess}
                  >
                    {isResetLoading ? 'Sending...' : resetSuccess ? 'Sent!' : 'Send Reset Link'}
                  </button>
                  
                  {resetSuccess && (
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      onClick={closeResetModal}
                    >
                      Done
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginForm;