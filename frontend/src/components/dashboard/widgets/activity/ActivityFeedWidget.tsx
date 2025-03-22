'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  EyeIcon,
  BellIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useActivityFeedData, ActivityItem } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import DashboardWidgetSkeleton from '../common/DashboardWidgetSkeleton';

interface ActivityFeedWidgetProps {
  title?: string;
  maxItems?: number;
  className?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

/**
 * A widget that displays a feed of recent activities
 * Uses React Query for data fetching
 */
const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  title = "Recent Activities",
  maxItems = 5,
  className = "",
  showViewAll = true,
  onViewAll,
}) => {
  const { user } = useAuth();
  // Use email as identifier and ensure it's a string or undefined
  const userId = user?.email || undefined;
  
  // Fetch activities data using our React Query hook
  const { 
    data: activities, 
    isLoading, 
    error, 
    refetch 
  } = useActivityFeedData(userId, maxItems);

  const [visibleItems, setVisibleItems] = useState(maxItems);
  const displayedActivities = activities ? activities.slice(0, visibleItems) : [];

  // Get the icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'view':
        return <EyeIcon className="h-6 w-6 text-purple-500" />;
      case 'notification':
        return <BellIcon className="h-6 w-6 text-amber-500" />;
      case 'message':
        return <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-blue-500" />;
      case 'document':
        return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get background color based on activity type
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100';
      case 'view': return 'bg-purple-100';
      case 'notification': return 'bg-amber-100';
      case 'message': return 'bg-blue-100';
      case 'document': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const handleShowMore = () => {
    setVisibleItems(prev => Math.min(prev + 3, activities?.length || 0));
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      setVisibleItems(activities?.length || 0);
    }
  };

  // Show loading state
  if (isLoading) {
    return <DashboardWidgetSkeleton hasHeader rows={3} className={className} />;
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-red-500">Failed to load activities</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 text-sm text-violet-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {showViewAll && activities && activities.length > 0 && (
          <button 
            onClick={handleViewAll}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayedActivities.length > 0 ? (
          displayedActivities.map(activity => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-3 ${getActivityBgColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{
                    typeof activity.timestamp === 'string' 
                      ? activity.timestamp 
                      : new Date(activity.timestamp).toLocaleDateString()
                  }</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>
      
      {activities && visibleItems < activities.length && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button 
            onClick={handleShowMore}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeedWidget; 