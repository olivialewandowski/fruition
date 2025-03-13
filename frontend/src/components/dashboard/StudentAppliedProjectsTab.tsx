// src/components/dashboard/StudentAppliedProjectsTab.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Application } from '@/types/application';
import { getStudentApplications } from '@/services/studentService';
import { useAuth } from '@/contexts/AuthContext';

interface StudentAppliedProjectsTabProps {
  onRefresh?: () => void;
}

const StudentAppliedProjectsTab: React.FC<StudentAppliedProjectsTabProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<(Application & { project: Project })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch student applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const applicationsData = await getStudentApplications();
        setApplications(applicationsData || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [user]);

  // Format application status with appropriate styling
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Pending Review
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Not Selected
          </span>
        );
      case 'hired':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Hired
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      // Handle Firestore Timestamp, Date object, or string
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={onRefresh} 
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-lg text-gray-600 mb-4">{"You haven't applied to any projects yet."}</p>
        <button 
          onClick={() => router.push('/development/connect')}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Browse Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Your Applications</h3>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id} className="px-6 py-5 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{application.project.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {application.project.department} • {application.project.mentorName || 'No mentor specified'}
                  </p>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 max-w-2xl line-clamp-2">{application.project.description}</p>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.project.keywords?.slice(0, 3).map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                    {application.project.keywords && application.project.keywords.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                        +{application.project.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="mb-2">
                    {getStatusDisplay(application.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Applied on {formatDate(application.submittedAt)}
                  </p>
                  
                  {application.status === 'hired' && (
                    <button 
                      onClick={() => router.push(`/development/projects/${application.project.id}`)}
                      className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200"
                    >
                      View Project
                    </button>
                  )}
                </div>
              </div>
              
              {application.status === 'accepted' && (
                <div className="mt-4 bg-green-50 p-3 rounded-md text-sm text-green-800">
                  <p className="font-medium">Congratulations!</p>
                  <p>Your application has been accepted. The project mentor will contact you soon with next steps.</p>
                </div>
              )}
              
              {application.status === 'rejected' && (
                <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  <p>Thank you for your interest in this project. Unfortunately, the mentor has chosen to proceed with other applicants.</p>
                </div>
              )}
              
              {application.status === 'pending' && (
                <div className="mt-4 bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                  <p>{"Your application is currently under review. You'll receive a notification when there's an update."}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentAppliedProjectsTab;