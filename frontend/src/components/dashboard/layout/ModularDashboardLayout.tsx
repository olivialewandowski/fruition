'use client';

import React, { useEffect } from 'react';
import { useDashboard, DashboardLayout } from '@/contexts/DashboardContext';
import DashboardRegion from './DashboardRegion';
import QueryProvider from '@/contexts/QueryProvider';

interface ModularDashboardLayoutProps {
  layoutId?: string;
  className?: string;
  withQueryProvider?: boolean;
}

/**
 * A component that renders a dashboard layout with configurable regions and widgets
 */
const ModularDashboardLayout: React.FC<ModularDashboardLayoutProps> = ({
  layoutId,
  className = '',
  withQueryProvider = false // Parent component usually handles this
}) => {
  const { layouts, currentLayout, setCurrentLayout } = useDashboard();
  
  // If layoutId is provided, update the current layout
  useEffect(() => {
    if (layoutId && layouts[layoutId]) {
      setCurrentLayout(layoutId);
    }
  }, [layoutId, layouts, setCurrentLayout]);
  
  // Get the active layout
  const activeLayout: DashboardLayout = layouts[currentLayout] || {
    id: 'default',
    name: 'Default',
    regions: []
  };
  
  // If no layout is available, show a placeholder message
  if (!activeLayout || activeLayout.regions.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">Dashboard not configured</h3>
        <p className="mt-2 text-gray-600">
          No dashboard layout has been configured. Please contact an administrator.
        </p>
      </div>
    );
  }
  
  // Create the dashboard content
  const dashboardContent = (
    <div className={`dashboard-layout ${className}`}>
      {activeLayout.regions.map(region => (
        <DashboardRegion key={region.id} region={region} />
      ))}
    </div>
  );

  // Optionally wrap with QueryProvider
  if (withQueryProvider) {
    return <QueryProvider>{dashboardContent}</QueryProvider>;
  }
  
  return dashboardContent;
};

export default ModularDashboardLayout; 