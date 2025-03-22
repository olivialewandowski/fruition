'use client';

import React from 'react';
import { useDashboard, LayoutRegion } from '@/contexts/DashboardContext';
import DashboardWidgetContainer from '../widgets/common/DashboardWidgetContainer';

// Union type to support both string ID and region object
type RegionProp = string | LayoutRegion;

interface DashboardRegionProps {
  region: RegionProp;
  className?: string;
}

/**
 * Component that renders a region of the dashboard layout
 * Each region can contain multiple widgets that are loaded dynamically 
 * based on the layout configuration
 * 
 * Can be used in two ways:
 * 1. With a region ID string: <DashboardRegion region="main" />
 * 2. With a region object: <DashboardRegion region={regionObject} />
 */
const DashboardRegion: React.FC<DashboardRegionProps> = ({
  region,
  className = '',
}) => {
  // Use the dashboard context hook
  const { layouts, widgets, currentLayout, getWidgetsByRegion } = useDashboard();
  
  // Handle case where region is a string ID
  if (typeof region === 'string') {
    // Get the current layout
    const layout = layouts[currentLayout];
    
    // Find widgets for this region in the current layout
    const regionWidgets = layout?.regions.find(r => r.id === region)?.widgets || [];
    
    // If no widgets are assigned to this region, return an empty placeholder
    if (regionWidgets.length === 0) {
      return (
        <div className={`dashboard-region dashboard-region-${region} ${className}`} data-region={region}>
          <p className="text-gray-400 italic text-sm p-4 text-center border border-dashed border-gray-200 rounded-lg">
            No widgets in this region
          </p>
        </div>
      );
    }
    
    return (
      <div className={`dashboard-region dashboard-region-${region} ${className}`} data-region={region}>
        {regionWidgets.map((widgetId: string) => {
          // Find widget config from registry
          const widgetConfig = widgets[widgetId];
          
          // Skip if widget is not found in registry
          if (!widgetConfig) {
            console.warn(`Widget with ID "${widgetId}" not found in registry`);
            return null;
          }
          
          const { component: WidgetComponent, defaultProps = {} } = widgetConfig;
          
          // Skip if component is not defined
          if (!WidgetComponent) {
            console.warn(`Widget component for "${widgetId}" is not defined`);
            return null;
          }
          
          // Render widget with error boundary and loading state
          return (
            <DashboardWidgetContainer 
              key={widgetId}
              widgetId={widgetId}
              widgetTitle={widgetConfig.title}
            >
              <WidgetComponent {...defaultProps} />
            </DashboardWidgetContainer>
          );
        })}
      </div>
    );
  }
  
  // Handle case where region is a region object
  const regionObj = region as LayoutRegion;
  const regionId = regionObj.id;
  const widgetsToShow = getWidgetsByRegion(regionId);
  
  // Determine grid columns class based on the region's columns property
  const gridClass = regionObj.columns ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[regionObj.columns] : '';

  // If region has no widgets, render nothing or a placeholder
  if (widgetsToShow.length === 0) {
    return (
      <div className={`dashboard-region dashboard-region-${regionId} ${className}`} data-region={regionId}>
        <p className="text-gray-400 italic text-sm p-4 text-center border border-dashed border-gray-200 rounded-lg">
          No widgets in this region
        </p>
      </div>
    );
  }
  
  return (
    <div className={`dashboard-region dashboard-region-${regionId} mb-8 ${className}`} data-region={regionId}>
      {regionObj.title && (
        <h2 className="text-lg font-medium text-gray-900 mb-4">{regionObj.title}</h2>
      )}
      
      <div className={`grid ${regionObj.className || gridClass} gap-4`}>
        {widgetsToShow.map((widget) => (
          <DashboardWidgetContainer 
            key={widget.id} 
            widget={widget}
            className="widget-wrapper"
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardRegion; 