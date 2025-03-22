'use client';

import React, { ReactNode, memo } from 'react';
import QueryProvider from '@/contexts/QueryProvider';
import { DashboardProvider } from '@/contexts/DashboardContext';
import DashboardInitializer from './DashboardInitializer';

interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * DashboardSection component for grouping related widgets
 * Each section can have its own title, description, and action buttons
 */
export const DashboardSection: React.FC<DashboardSectionProps> = memo(({
  title,
  description,
  children,
  action,
  className = '',
  columns = 1
}) => {
  // Determine the grid columns class based on the columns prop
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`mb-8 ${className}`}>
      {/* Section Header */}
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Widget Grid */}
      <div className={`grid ${gridClass} gap-4`}>
        {children}
      </div>
    </div>
  );
});

export interface UnifiedDashboardLayoutProps {
  children: ReactNode;
  className?: string;
  userRole?: string;
  initialLayoutId?: string;
  withQueryProvider?: boolean;
}

/**
 * UnifiedDashboardLayout component - main container for the dashboard
 * Provides consistent spacing and styling for the entire dashboard
 * Integrates QueryProvider and DashboardProvider for complete dashboard functionality
 */
export const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = memo(({
  children,
  className = '',
  userRole = 'student',
  initialLayoutId,
  withQueryProvider = true
}) => {
  // Create the dashboard content
  const dashboardContent = (
    <div className={`p-4 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <DashboardProvider>
          <DashboardInitializer userRole={userRole} initialLayoutId={initialLayoutId} />
          {children}
        </DashboardProvider>
      </div>
    </div>
  );

  // Conditionally wrap with QueryProvider
  if (withQueryProvider) {
    return <QueryProvider>{dashboardContent}</QueryProvider>;
  }

  return dashboardContent;
});

// Default export for convenience
export default UnifiedDashboardLayout; 