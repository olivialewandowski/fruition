import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import ApplicationsWidget from '../widgets/applications/ApplicationsWidget';

/**
 * Student Dashboard Page
 * This component serves as an example of how to assemble multiple dashboard widgets
 * into a cohesive dashboard view
 */
export const StudentDashboard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get the current user ID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-full w-60 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your applications and project status
          </p>
        </div>
        
        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Applications Widget */}
          <ApplicationsWidget userId={userId} />
        </div>
        
        {/* Two Column Layout for Additional Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placeholder for future widgets */}
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Project Progress Widget</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
          
          {/* Placeholder for future widgets */}
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Upcoming Deadlines Widget</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 