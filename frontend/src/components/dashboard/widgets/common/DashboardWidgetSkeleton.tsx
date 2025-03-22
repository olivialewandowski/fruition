'use client';

import React from 'react';

interface DashboardWidgetSkeletonProps {
  className?: string;
  rows?: number;
  hasHeader?: boolean;
  hasChart?: boolean;
  hasStats?: boolean;
}

/**
 * A skeleton loader component for dashboard widgets
 * Provides a loading state that mimics the structure of a common dashboard widget
 */
const DashboardWidgetSkeleton: React.FC<DashboardWidgetSkeletonProps> = ({
  className = '',
  rows = 3,
  hasHeader = true,
  hasChart = false,
  hasStats = false,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-5 animate-pulse ${className}`}>
      {/* Widget header */}
      {hasHeader && (
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      )}
      
      {/* Stats row */}
      {hasStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chart placeholder */}
      {hasChart && (
        <div className="h-48 bg-gray-200 rounded mb-6"></div>
      )}
      
      {/* Content rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardWidgetSkeleton; 