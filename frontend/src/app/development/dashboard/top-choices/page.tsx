'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopChoicesWidget from '@/components/student/TopChoicesWidget';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';

/**
 * Standalone page for managing top choices
 */
const TopChoicesPage: React.FC = () => {
  const { userData } = useAuth();
  const router = useRouter();
  
  // Ensure students see this page
  const userRole = userData?.role || 'student';
  const isStudent = userRole === 'student';
  
  const handleBack = () => {
    router.push('/development/dashboard');
  };
  
  return (
    <div className="flex h-screen bg-gray-50 p-4">
      <div className="mr-4">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl">
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
                  Top Project Choices
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage which projects are marked as your highest interest
                </p>
              </div>
            </div>
            
            {!isStudent ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  This feature is only available for students
                </h3>
                <p className="text-gray-600">
                  Top choices are a way for students to indicate their highest interest in certain projects.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <TopChoicesWidget />
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About Top Choices</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800">What are top choices?</h4>
                      <p className="text-gray-600">
                        Top choices allow you to highlight the projects you're most interested in. 
                        Faculty will see these applications marked with a special indicator.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">How many can I select?</h4>
                      <p className="text-gray-600">
                        You can mark up to 5% of your total applications as top choices. 
                        This keeps the feature valuable and ensures it represents your true preferences.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">Can I change my top choices?</h4>
                      <p className="text-gray-600">
                        Yes! You can add or remove projects from your top choices at any time,
                        as long as you stay within your allocated limit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopChoicesPage;