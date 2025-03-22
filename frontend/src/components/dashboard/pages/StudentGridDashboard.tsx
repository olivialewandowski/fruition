import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { DashboardLayout, DashboardSection } from '../layouts/DashboardLayout';
import ApplicationsWidget from '../widgets/applications/ApplicationsWidget';
import DashboardCard from '../widgets/DashboardCard';
import StatDisplay from '../widgets/StatDisplay';

/**
 * Example dashboard with a grid layout similar to the financial dashboard example
 * This demonstrates how to structure a dashboard with multiple sections and widgets
 */
export const StudentGridDashboard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Placeholder stats for demonstration
  const dashboardStats = [
    { label: 'Total Applications', value: 24, change: { value: 12.5, isPositive: true } },
    { label: 'Accepted', value: 8, change: { value: 8.7, isPositive: true } },
    { label: 'Pending', value: 14, change: { value: 5.2, isPositive: false } },
    { label: 'Completion Rate', value: 92, suffix: '%', change: { value: 3.1, isPositive: true } },
  ];
  
  // Get the current user ID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (isLoading) {
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-gray-700">Please sign in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track your applications and project status
        </p>
      </div>
      
      {/* Key Metrics Section */}
      <DashboardSection columns={4}>
        {dashboardStats.map((stat, index) => (
          <StatDisplay key={index} {...stat} />
        ))}
      </DashboardSection>
      
      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Widget - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <ApplicationsWidget userId={userId} />
        </div>
        
        {/* Sidebar Widgets - Takes 1/3 of the width */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <DashboardCard 
            title="Upcoming Deadlines" 
            action={
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </button>
            }
          >
            <div className="space-y-3">
              {/* Placeholder content - would be replaced with real data */}
              <div className="border-l-4 border-yellow-400 pl-3 py-2">
                <p className="font-medium">Project Proposal</p>
                <p className="text-sm text-gray-500">Due in 2 days</p>
              </div>
              <div className="border-l-4 border-red-400 pl-3 py-2">
                <p className="font-medium">Final Submission</p>
                <p className="text-sm text-gray-500">Due tomorrow</p>
              </div>
              <div className="border-l-4 border-green-400 pl-3 py-2">
                <p className="font-medium">Team Meeting</p>
                <p className="text-sm text-gray-500">Today at 3:00 PM</p>
              </div>
            </div>
          </DashboardCard>
          
          {/* Project Health Widget */}
          <DashboardCard title="Project Health">
            <div className="space-y-4">
              {/* Placeholder content - would be replaced with real data */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Project Alpha</span>
                  <span className="text-sm text-green-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Project Beta</span>
                  <span className="text-sm text-yellow-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Project Gamma</span>
                  <span className="text-sm text-red-600">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      {/* Bottom Section - Full Width */}
      <DashboardSection 
        title="Recent Activities" 
        description="Your recent project activities and updates"
        action={
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700">
            See all
          </button>
        }
        columns={3}
      >
        {/* Activity Cards - Placeholder content */}
        <DashboardCard>
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Application Accepted</p>
              <p className="text-sm text-gray-500">Your application for Project Alpha was accepted</p>
              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Project Viewed</p>
              <p className="text-sm text-gray-500">Your Project Beta was viewed by 5 people today</p>
              <p className="text-xs text-gray-400 mt-1">Yesterday</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard>
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Milestone Completed</p>
              <p className="text-sm text-gray-500">You completed the first milestone of Project Gamma</p>
              <p className="text-xs text-gray-400 mt-1">3 days ago</p>
            </div>
          </div>
        </DashboardCard>
      </DashboardSection>
    </DashboardLayout>
  );
};

export default StudentGridDashboard; 