'use client';

import { useEffect, useRef } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { dashboardWidgets } from '../widgets/WidgetRegistry';
import { 
  dashboardLayouts, 
  getDefaultLayoutForRole,
  getCompactLayoutForRole
} from './LayoutRegistry';

interface DashboardInitializerProps {
  userRole?: string;
  initialLayoutId?: string;
}

// Helper for conditional logging in development only
const logDev = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

/**
 * Component that initializes the dashboard with all widgets and layouts
 * It should be included once at the top level of your dashboard page
 */
const DashboardInitializer: React.FC<DashboardInitializerProps> = ({ 
  userRole = 'student',
  initialLayoutId
}) => {
  const { registerWidget, registerLayout, setCurrentLayout, widgets, layouts } = useDashboard();
  const hasInitializedRef = useRef(false);

  // Register all widgets and layouts on mount
  useEffect(() => {
    // Skip if already initialized or if widgets/layouts are already registered
    if (hasInitializedRef.current || 
        (Object.keys(widgets).length > 0 && Object.keys(layouts).length > 0)) {
      return;
    }
    
    logDev('Initializing dashboard with role:', userRole);
    
    // Register all widgets
    Object.values(dashboardWidgets).forEach(widget => {
      logDev('Registering widget:', widget.id);
      registerWidget(widget);
    });
    
    // Register all layouts
    Object.values(dashboardLayouts).forEach(layout => {
      logDev('Registering layout:', layout.id);
      registerLayout(layout);
    });
    
    // Set the layout based on provided initialLayoutId or default for role
    if (initialLayoutId && dashboardLayouts[initialLayoutId]) {
      logDev('Setting specified layout:', initialLayoutId);
      setCurrentLayout(initialLayoutId);
    } else {
      // Fallback to default layout based on user role
      const defaultLayout = getDefaultLayoutForRole(userRole);
      logDev('Setting default layout:', defaultLayout.id);
      setCurrentLayout(defaultLayout.id);
    }
    
    // Mark as initialized
    hasInitializedRef.current = true;
  }, [userRole, initialLayoutId, registerWidget, registerLayout, setCurrentLayout, widgets, layouts]);

  // This component doesn't render anything
  return null;
};

export default DashboardInitializer; 