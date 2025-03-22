'use client';

import { DashboardLayout } from '@/contexts/DashboardContext';

/**
 * Registry of all available dashboard layouts
 * This centralizes layout configuration and makes it easy to add new layouts
 */
export const dashboardLayouts: Record<string, DashboardLayout> = {
  studentDefault: {
    id: 'studentDefault',
    name: 'Student Dashboard',
    description: 'Default layout for student users',
    regions: [
      {
        id: 'topMetrics',
        title: 'Your Overview',
        columns: 4,
        widgets: ['metrics'],
      },
      {
        id: 'mainContent',
        columns: 3,
        widgets: ['recommendedProjects', 'applications', 'topChoices'],
      },
      {
        id: 'activitySection',
        title: 'Recent Activity',
        columns: 1,
        widgets: ['activityFeed'],
      },
    ],
  },
  facultyDefault: {
    id: 'facultyDefault',
    name: 'Faculty Dashboard',
    description: 'Default layout for faculty users',
    regions: [
      {
        id: 'topMetrics',
        title: 'Faculty Overview',
        columns: 4,
        widgets: ['metrics'],
      },
      {
        id: 'mainContent',
        columns: 2,
        widgets: [], // Faculty-specific widgets will be added here
      },
      {
        id: 'activitySection',
        title: 'Recent Activity',
        columns: 1,
        widgets: ['activityFeed'],
      },
    ],
  },
  adminDefault: {
    id: 'adminDefault',
    name: 'Admin Dashboard',
    description: 'Default layout for admin users',
    regions: [
      {
        id: 'topMetrics',
        title: 'System Overview',
        columns: 4,
        widgets: ['metrics'],
      },
      {
        id: 'mainContent',
        columns: 2,
        widgets: [], // Admin-specific widgets will be added here
      },
      {
        id: 'activitySection',
        title: 'System Activity',
        columns: 1,
        widgets: ['activityFeed'],
      },
    ],
  },
  // Compact layouts designed to integrate with existing dashboard pages
  studentCompact: {
    id: 'studentCompact',
    name: 'Student Dashboard (Compact)',
    description: 'Compact layout for student dashboard integration',
    regions: [
      {
        id: 'mainContent',
        className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
        widgets: ['recommendedProjects', 'applications', 'topChoices'],
      },
    ],
  },
  facultyCompact: {
    id: 'facultyCompact',
    name: 'Faculty Dashboard (Compact)',
    description: 'Compact layout for faculty dashboard integration',
    regions: [
      {
        id: 'mainContent',
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        widgets: [], // Faculty-specific widgets
      },
    ],
  },
};

/**
 * Gets a layout by its ID
 */
export const getLayoutById = (id: string): DashboardLayout | undefined => {
  return dashboardLayouts[id];
};

/**
 * Gets the default layout for a specific user role
 */
export const getDefaultLayoutForRole = (role: string): DashboardLayout => {
  const layoutMap: Record<string, string> = {
    student: 'studentDefault',
    faculty: 'facultyDefault',
    admin: 'adminDefault',
  };
  
  const layoutId = layoutMap[role] || 'studentDefault';
  return dashboardLayouts[layoutId] || dashboardLayouts.studentDefault;
};

/**
 * Gets the compact layout for a specific user role
 * This is used when embedding in existing dashboard pages
 */
export const getCompactLayoutForRole = (role: string): DashboardLayout => {
  const layoutMap: Record<string, string> = {
    student: 'studentCompact',
    faculty: 'facultyCompact',
  };
  
  const layoutId = layoutMap[role] || 'studentCompact';
  return dashboardLayouts[layoutId] || dashboardLayouts.studentCompact;
};

/**
 * Registers a new layout or updates an existing one at runtime
 */
export const registerLayout = (layout: DashboardLayout): void => {
  dashboardLayouts[layout.id] = layout;
}; 