'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Widget configuration interface
export interface WidgetConfig {
  id: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  minWidth?: string;
  minHeight?: string;
  availableFor?: string[]; // Specify which user roles can see this widget
}

// Layout region interface
export interface LayoutRegion {
  id: string;
  title?: string;
  className?: string;
  widgets: string[]; // IDs of widgets to display in this region
  columns?: 1 | 2 | 3 | 4;
}

// Dashboard layout configuration
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  regions: LayoutRegion[];
}

// Dashboard context interface
interface DashboardContextType {
  widgets: Record<string, WidgetConfig>;
  layouts: Record<string, DashboardLayout>;
  currentLayout: string;
  registerWidget: (config: WidgetConfig) => void;
  registerLayout: (layout: DashboardLayout) => void;
  setCurrentLayout: (layoutId: string) => void;
  getWidgetsByRegion: (regionId: string) => WidgetConfig[];
}

// Create the context with default values
const DashboardContext = createContext<DashboardContextType>({
  widgets: {},
  layouts: {},
  currentLayout: 'default',
  registerWidget: () => {},
  registerLayout: () => {},
  setCurrentLayout: () => {},
  getWidgetsByRegion: () => [],
});

// Hook for components to access the dashboard context
export const useDashboard = () => useContext(DashboardContext);

// Provider component that wraps your app and makes dashboard context available
export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Record<string, WidgetConfig>>({});
  const [layouts, setLayouts] = useState<Record<string, DashboardLayout>>({});
  const [currentLayout, setCurrentLayout] = useState<string>('default');

  // Register a widget in the system
  const registerWidget = (config: WidgetConfig) => {
    setWidgets(prev => {
      // Skip if widget with this ID already exists to prevent duplicate registrations
      if (prev[config.id]) {
        return prev;
      }
      
      return {
        ...prev,
        [config.id]: config
      };
    });
  };

  // Register a layout in the system
  const registerLayout = (layout: DashboardLayout) => {
    setLayouts(prev => {
      // Skip if layout with this ID already exists to prevent duplicate registrations
      if (prev[layout.id]) {
        return prev;
      }
      
      return {
        ...prev,
        [layout.id]: layout
      };
    });
  };

  // Get all widgets for a specific region in the current layout
  const getWidgetsByRegion = (regionId: string): WidgetConfig[] => {
    const layout = layouts[currentLayout];
    if (!layout) return [];

    const region = layout.regions.find(r => r.id === regionId);
    if (!region) return [];

    return region.widgets
      .map(widgetId => widgets[widgetId])
      .filter(Boolean);
  };

  // Setup default layout if none exists
  useEffect(() => {
    if (Object.keys(layouts).length === 0) {
      registerLayout({
        id: 'default',
        name: 'Default Layout',
        regions: [
          {
            id: 'metrics',
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
            widgets: [],
          },
          {
            id: 'main',
            className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
            widgets: [],
          },
          {
            id: 'bottom',
            className: 'grid grid-cols-1 gap-6',
            widgets: [],
          },
        ],
      });
    }
  }, []);

  const value = {
    widgets,
    layouts,
    currentLayout,
    registerWidget,
    registerLayout,
    setCurrentLayout,
    getWidgetsByRegion,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider; 