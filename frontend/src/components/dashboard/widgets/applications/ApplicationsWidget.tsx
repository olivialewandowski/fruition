'use client';

import React, { useState, useEffect } from 'react';
import { useApplicationsData } from '../../../../hooks/dashboard/useApplicationsData';
import LineChart from '../../visualizations/charts/LineChart';
import DashboardCard from '../DashboardCard';
import StatDisplay from '../StatDisplay';

export interface ApplicationsWidgetProps {
  userId: string;
  className?: string;
}

type TimeRangeOption = 'week' | 'month' | 'quarter' | 'year';

/**
 * Dashboard widget that visualizes a student's applications
 * Shows application counts, trends, and a chart of applications over time
 */
export const ApplicationsWidget: React.FC<ApplicationsWidgetProps> = ({
  userId,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('month');
  const [hasMounted, setHasMounted] = useState(false);
  
  const { data, chartData, isLoading, error } = useApplicationsData({
    userId,
    timeRange,
  });

  // Prevent any hydration mismatches by only rendering on client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRangeOption) => {
    setTimeRange(range);
  };

  // Render time range selector
  const renderTimeRangeSelector = () => {
    const options: { label: string; value: TimeRangeOption }[] = [
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
      { label: 'Quarter', value: 'quarter' },
      { label: 'Year', value: 'year' },
    ];

    return (
      <div className="flex items-center space-x-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleTimeRangeChange(option.value)}
            className={`px-3 py-1 text-xs rounded-full ${
              timeRange === option.value
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  // Calculate application status counts for stat displays
  const applicationStats = React.useMemo(() => {
    if (!data) return null;

    const pendingCount = data.applicationsByStatus['pending'] || 0;
    const acceptedCount = data.applicationsByStatus['accepted'] || 0;
    const rejectedCount = data.applicationsByStatus['rejected'] || 0;
    
    // Calculate % change (mocked for demonstration - would come from real data)
    const mockChange = {
      value: 12.5,
      isPositive: true,
    };

    return {
      total: {
        label: 'Total Applications',
        value: data.totalApplications,
        change: mockChange,
      },
      pending: {
        label: 'Pending',
        value: pendingCount,
        change: {
          value: 5.2,
          isPositive: false,
        },
      },
      accepted: {
        label: 'Accepted',
        value: acceptedCount,
        change: {
          value: 8.7,
          isPositive: true,
        },
      },
      rejected: {
        label: 'Rejected',
        value: rejectedCount,
        change: {
          value: 3.1,
          isPositive: false,
        },
      },
    };
  }, [data]);

  // Don't render anything during SSR
  if (!hasMounted) {
    return null;
  }

  if (error) {
    return (
      <DashboardCard
        title="Applications"
        className={className}
      >
        <div className="text-red-500">
          Error loading applications data: {error.message}
        </div>
      </DashboardCard>
    );
  }

  return (
    <div className={className}>
      <DashboardCard
        title="Applications Overview"
        subtitle={`Showing data for the last ${timeRange}`}
        action={renderTimeRangeSelector()}
        isLoading={isLoading}
      >
        {/* Stats row */}
        {applicationStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatDisplay {...applicationStats.total} />
            <StatDisplay {...applicationStats.pending} />
            <StatDisplay {...applicationStats.accepted} />
            <StatDisplay {...applicationStats.rejected} />
          </div>
        )}

        {/* Chart */}
        <div className="mt-4">
          <LineChart
            data={chartData}
            height={250}
            title="Applications over time"
            isLoading={isLoading}
          />
        </div>

        {/* Recent applications section */}
        {data && data.recentApplications.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Applications</h4>
            <div className="overflow-hidden rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recentApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {application.projectName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {application.appliedAt instanceof Date 
                          ? application.appliedAt.toLocaleDateString() 
                          : 'Invalid date'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default ApplicationsWidget; 