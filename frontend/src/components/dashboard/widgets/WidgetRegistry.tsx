'use client';

import React from 'react';
import { WidgetConfig } from '@/contexts/DashboardContext';
import ApplicationsWidget from './applications/ApplicationsWidget';
import RecommendedProjectWidget from './recommendations/RecommendedProjectWidget';
import MetricsWidget from './metrics/MetricsWidget';
import ActivityFeedWidget from './activity/ActivityFeedWidget';
import TopChoicesWidget from './top-choices/TopChoicesWidget';
// Import any other widgets here

/**
 * Registry of all available dashboard widgets
 * This centralizes widget configuration and makes it easy to add new widgets
 */
export const dashboardWidgets: Record<string, WidgetConfig> = {
  applications: {
    id: 'applications',
    title: 'My Applications',
    component: ApplicationsWidget,
    defaultProps: {
      className: 'lg:col-span-2', // Take 2/3 of the width in 3-column layouts
    },
    availableFor: ['student'],
  },
  recommendedProjects: {
    id: 'recommendedProjects',
    title: 'Recommended Projects',
    component: RecommendedProjectWidget,
    defaultProps: {
      withDashboardCard: false, // Render without the DashboardCard wrapper
      className: 'h-full', // Make sure it fills the height of its container
    },
    availableFor: ['student'],
  },
  metrics: {
    id: 'metrics',
    title: 'Key Metrics',
    component: MetricsWidget,
    defaultProps: {
      className: 'grid-cols-2 md:grid-cols-4',
    },
    availableFor: ['student', 'faculty', 'admin'],
  },
  activityFeed: {
    id: 'activityFeed',
    title: 'Recent Activity',
    component: ActivityFeedWidget,
    defaultProps: {
      maxItems: 5,
      className: 'h-full',
    },
    availableFor: ['student', 'faculty', 'admin'],
  },
  topChoices: {
    id: 'topChoices',
    title: 'Your Top Choices',
    component: TopChoicesWidget,
    defaultProps: {
      className: 'h-full',
    },
    availableFor: ['student'],
  },
  // Add more widgets here as needed
};

/**
 * Retrieves all widgets that are available for a specific user role
 */
export const getWidgetsByRole = (role: string): WidgetConfig[] => {
  return Object.values(dashboardWidgets).filter(widget => 
    widget.availableFor?.includes(role) ?? false
  );
};

/**
 * Gets a widget by its ID
 */
export const getWidgetById = (id: string): WidgetConfig | undefined => {
  return dashboardWidgets[id];
};

/**
 * Registers a new widget or updates an existing one at runtime
 */
export const registerWidget = (widget: WidgetConfig): void => {
  dashboardWidgets[widget.id] = widget;
}; 