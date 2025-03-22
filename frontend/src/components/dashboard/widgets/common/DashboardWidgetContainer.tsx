'use client';

import React, { Suspense } from 'react';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { WidgetConfig } from '@/contexts/DashboardContext';

interface DashboardWidgetContainerBaseProps {
  className?: string;
}

interface DashboardWidgetContainerWithChildrenProps extends DashboardWidgetContainerBaseProps {
  children: React.ReactNode;
  widgetId: string;
  widgetTitle?: string;
  widget?: never;
}

interface DashboardWidgetContainerWithConfigProps extends DashboardWidgetContainerBaseProps {
  widget: WidgetConfig;
  children?: never;
  widgetId?: never;
  widgetTitle?: never;
}

type DashboardWidgetContainerProps = 
  | DashboardWidgetContainerWithChildrenProps 
  | DashboardWidgetContainerWithConfigProps;

/**
 * Container component that wraps all dashboard widgets
 * Provides error boundary, suspense for loading state, and other common widget functionality
 * 
 * Can be used in two ways:
 * 1. With a widget config object: <DashboardWidgetContainer widget={widgetConfig} />
 * 2. With direct children: <DashboardWidgetContainer widgetId="id" widgetTitle="title">{children}</DashboardWidgetContainer>
 */
const DashboardWidgetContainer: React.FC<DashboardWidgetContainerProps> = (props) => {
  const { className = '' } = props;

  // Case 1: Widget config object provided
  if ('widget' in props && props.widget) {
    const { widget } = props;
    const WidgetComponent = widget.component;
    const widgetId = widget.id;
    const widgetTitle = widget.title || 'Widget';
    
    return (
      <div className={`dashboard-widget-container ${className}`}>
        <WidgetErrorBoundary widgetId={widgetId} widgetTitle={widgetTitle}>
          <Suspense fallback={<DashboardWidgetSkeleton rows={3} hasHeader />}>
            <WidgetComponent {...widget.defaultProps} />
          </Suspense>
        </WidgetErrorBoundary>
      </div>
    );
  }
  
  // Case 2: Direct children provided
  if ('children' in props && props.children) {
    const { children, widgetId, widgetTitle } = props;
    
    return (
      <div className={`dashboard-widget-container ${className}`}>
        <WidgetErrorBoundary widgetId={widgetId} widgetTitle={widgetTitle}>
          <Suspense fallback={<DashboardWidgetSkeleton rows={3} hasHeader />}>
            {children}
          </Suspense>
        </WidgetErrorBoundary>
      </div>
    );
  }
  
  // Fallback for incorrect usage
  return null;
};

export default DashboardWidgetContainer; 