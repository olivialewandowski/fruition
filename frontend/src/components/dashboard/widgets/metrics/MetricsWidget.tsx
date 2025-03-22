'use client';

import React from 'react';
import { 
  ChartBarIcon, 
  DocumentCheckIcon, 
  ClockIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useMetricsData, MetricItem } from '@/hooks/useDashboardData';
import DashboardWidgetSkeleton from '../common/DashboardWidgetSkeleton';

interface MetricsWidgetProps {
  className?: string;
  userId?: string;
}

/**
 * Widget that displays a grid of key metrics
 * Uses React Query for data fetching and caching
 */
const MetricsWidget: React.FC<MetricsWidgetProps> = ({ 
  className = '',
  userId
}) => {
  // Fetch metrics data using our React Query hook
  const { data: metrics, isLoading, error } = useMetricsData(userId);
  
  // Get the icon based on metric type
  const getMetricIcon = (metric: MetricItem) => {
    switch (metric.color) {
      case 'blue': 
        return <DocumentCheckIcon className="h-6 w-6 text-blue-500" />;
      case 'green': 
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'amber': 
        return <ClockIcon className="h-6 w-6 text-amber-500" />;
      case 'violet':
      default: 
        return <ChartBarIcon className="h-6 w-6 text-violet-500" />;
    }
  };

  // Helper to get color classes based on the color prop
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'violet': return 'bg-violet-50 border-violet-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'amber': return 'bg-amber-50 border-amber-200';
      case 'red': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Show loading state
  if (isLoading) {
    return <DashboardWidgetSkeleton hasStats={true} rows={0} className={className} />;
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-red-50 p-4 rounded-lg ${className}`}>
        <p className="text-red-600 text-center">Failed to load metrics</p>
      </div>
    );
  }

  // If no metrics data is available, show empty state
  if (!metrics || metrics.length === 0) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">No metrics available</p>
      </div>
    );
  }

  return (
    <div className={`metrics-grid grid gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className={`flex flex-col p-4 rounded-lg border ${getColorClasses(metric.color)}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium text-gray-500 text-sm">
              {metric.label}
            </div>
            <div>
              {getMetricIcon(metric)}
            </div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {metric.value}
              {metric.suffix && <span className="ml-0.5">{metric.suffix}</span>}
            </span>
            
            {metric.change && (
              <span className={`ml-2 text-sm ${metric.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change.isPositive ? '↑' : '↓'} {metric.change.value}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsWidget; 