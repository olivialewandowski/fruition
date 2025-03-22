import React, { ReactNode } from 'react';

export interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  isLoading?: boolean;
}

/**
 * Reusable card component for dashboard widgets
 * Features a consistent header with title, subtitle, and optional action buttons
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  action,
  isLoading = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex items-center">
              {action}
            </div>
          )}
        </div>
      )}
      
      <div className={`p-4 ${isLoading ? 'opacity-50' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DashboardCard; 