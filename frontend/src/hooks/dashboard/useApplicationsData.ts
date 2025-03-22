'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Application type interface with proper types for Firestore document data
interface ApplicationDocument {
  id: string;
  studentId: string;
  projectId: string;
  projectName?: string;
  status: string;
  createdAt: any; // Firebase Timestamp
  [key: string]: any; // For other fields
}

// Define chart data structure without importing from chart.js
// to avoid issues with server-side rendering
interface DataPoint {
  x: string;
  y: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
}

interface ChartDataStructure {
  labels: string[];
  datasets: ChartDataset[];
}

// Types for applications data
export interface ApplicationsData {
  totalApplications: number;
  applicationsByDate: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  recentApplications: Array<{
    id: string;
    projectId: string;
    projectName: string;
    status: string;
    appliedAt: Date;
  }>;
}

export interface UseApplicationsDataProps {
  userId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
}

// Helper function to format date in a consistent way for both server and client
function formatDateString(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Custom hook to fetch and format student application data
 */
export const useApplicationsData = ({
  userId,
  timeRange = 'month',
  limit = 10
}: UseApplicationsDataProps) => {
  const [data, setData] = useState<ApplicationsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Only run data fetching on the client side
    if (!hasMounted) return;
    
    const fetchApplicationsData = async () => {
      if (!userId) {
        setError(new Error('User ID is required'));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range based on timeRange
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        // Query applications for this user within the date range
        const applicationsRef = collection(db, 'applications');
        const applicationsQuery = query(
          applicationsRef,
          where('studentId', '==', userId),
          where('createdAt', '>=', startDate),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(applicationsQuery);
        
        // Initialize data structures
        const applicationsByDate: Record<string, number> = {};
        const applicationsByStatus: Record<string, number> = {};
        const recentApplications: ApplicationsData['recentApplications'] = [];
        
        // Process each application
        querySnapshot.forEach((doc) => {
          // Properly type the application data
          const application = { id: doc.id, ...doc.data() } as ApplicationDocument;
          
          // Safely convert Firebase timestamp to Date
          let date: Date;
          try {
            date = application.createdAt?.toDate() || new Date();
          } catch (e) {
            // Fallback if timestamp conversion fails
            console.warn('Invalid date in application document, using current date as fallback');
            date = new Date();
          }
          
          // Format date as YYYY-MM-DD
          const dateStr = date.toISOString().split('T')[0];
          
          // Count applications by date
          applicationsByDate[dateStr] = (applicationsByDate[dateStr] || 0) + 1;
          
          // Count applications by status
          const status = application.status || 'pending';
          applicationsByStatus[status] = (applicationsByStatus[status] || 0) + 1;
          
          // Add to recent applications if within limit
          if (recentApplications.length < limit) {
            recentApplications.push({
              id: application.id,
              projectId: application.projectId,
              projectName: application.projectName || 'Unknown Project',
              status: status,
              appliedAt: date,
            });
          }
        });

        // Set the processed data
        setData({
          totalApplications: querySnapshot.size,
          applicationsByDate,
          applicationsByStatus,
          recentApplications,
        });
      } catch (err) {
        console.error('Error fetching applications data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch applications data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationsData();
  }, [userId, timeRange, limit, hasMounted]);

  // Format data for line chart
  const getChartData = (): ChartDataStructure => {
    if (!data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort dates chronologically
    const sortedDates = Object.keys(data.applicationsByDate).sort();
    
    // Format dates in a consistent way that works on both server and client
    const formattedLabels = sortedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${month}/${day}`;
    });
    
    return {
      labels: formattedLabels,
      datasets: [
        {
          label: 'Applications',
          data: sortedDates.map(date => data.applicationsByDate[date]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
        },
      ],
    };
  };

  return {
    data,
    chartData: getChartData(),
    isLoading,
    error,
  };
};

export default useApplicationsData; 