# Modular Dashboard Architecture Guide

This guide explains the modular dashboard architecture implemented in the Fruition dashboard. The architecture is designed for scalability, maintainability, and easy extension.

## Overview

The modular dashboard architecture uses a registry pattern with context-based dependency injection to create a flexible, scalable dashboard system. Widgets and layouts are registered in configuration files, making it easy to add, remove, or modify dashboard components without changing core functionality.

## Key Components

### 1. Dashboard Context

The `DashboardContext` (`frontend/src/contexts/DashboardContext.tsx`) provides the central state management for the dashboard:

- Maintains registry of widgets and layouts
- Handles state for the current layout
- Provides methods for registering new widgets and layouts
- Retrieves widgets by region

### 2. Widget Registry

The `WidgetRegistry` (`frontend/src/components/dashboard/widgets/WidgetRegistry.tsx`) centralizes the definition of all available widgets:

- Each widget has a unique ID, title, component reference, and configuration
- Widgets specify which user roles can view them via `availableFor`
- Default props can be configured for each widget
- Helper methods provide filtered views of widgets by role

### 3. Layout Registry

The `LayoutRegistry` (`frontend/src/components/dashboard/layouts/LayoutRegistry.tsx`) defines dashboard layouts:

- Layouts specify regions and which widgets appear in each region
- Different layouts can be defined for different user roles
- Compact layouts are available for embedding in existing pages
- Regions can have custom column configurations and styling

### 4. Dashboard Components

- `ModularDashboardLayout`: Renders the active layout with all its regions
- `DashboardRegion`: Renders a region with its configured widgets
- `DashboardInitializer`: Registers all widgets and layouts on mount

## Integration with Existing Dashboard

The modular dashboard has been integrated into the existing `/development/dashboard` route:

1. The dashboard context provider is included in the main dashboard page
2. The modular dashboard layout is rendered in the active tab for student users
3. A compact layout is used to fit within the existing UI structure
4. The existing sidebar and top navigation are preserved

## Available Widgets

The dashboard includes several built-in widgets:

1. **RecommendedProjectWidget**: Shows recommended research projects based on user skills
2. **ApplicationsWidget**: Displays the user's applications
3. **MetricsWidget**: Shows key metrics with colorful cards
4. **ActivityFeedWidget**: Displays recent activities with icons and color coding

## How to Add a New Widget

### 1. Create Widget Component

Create a new widget component in `frontend/src/components/dashboard/widgets/`:

```tsx
'use client';

import React from 'react';

interface MyWidgetProps {
  className?: string;
  // Add any other props
}

const MyWidget: React.FC<MyWidgetProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-medium">My Widget</h3>
      {/* Widget content */}
    </div>
  );
};

export default MyWidget;
```

### 2. Register Widget

Add your widget to the Widget Registry:

```tsx
// In WidgetRegistry.tsx
import MyWidget from './MyWidget';

export const dashboardWidgets: Record<string, WidgetConfig> = {
  // Existing widgets...
  
  myWidget: {
    id: 'myWidget',
    title: 'My Widget',
    component: MyWidget,
    defaultProps: {
      className: 'h-full',
    },
    availableFor: ['student', 'faculty'], // Which roles can see this widget
  },
};
```

### 3. Add to Layout

Update the Layout Registry to include your widget in a layout:

```tsx
// In LayoutRegistry.tsx
export const dashboardLayouts: Record<string, DashboardLayout> = {
  studentDefault: {
    // ...
    regions: [
      // ...
      {
        id: 'mainContent',
        columns: 3,
        widgets: ['recommendedProjects', 'applications', 'myWidget'], // Add your widget
      },
      // ...
    ],
  },
};
```

## How to Create a New Layout

To create a new layout:

```tsx
// In LayoutRegistry.tsx
export const dashboardLayouts: Record<string, DashboardLayout> = {
  // Existing layouts...
  
  myCustomLayout: {
    id: 'myCustomLayout',
    name: 'My Custom Layout',
    description: 'A custom layout for specific needs',
    regions: [
      {
        id: 'topSection',
        title: 'Top Section',
        columns: 2,
        widgets: ['metrics'],
      },
      {
        id: 'leftSection',
        title: 'Left Section',
        className: 'col-span-1',
        widgets: ['recommendedProjects'],
      },
      {
        id: 'rightSection',
        title: 'Right Section',
        className: 'col-span-2',
        widgets: ['applications', 'activityFeed'],
      },
    ],
  },
};
```

To use this layout:

```tsx
<DashboardProvider>
  <DashboardInitializer initialLayoutId="myCustomLayout" />
  <ModularDashboardLayout />
</DashboardProvider>
```

## Dynamic Dashboard Configuration

The dashboard can be configured at runtime:

```tsx
const MyConfigurableComponent = () => {
  const { registerWidget, registerLayout, setCurrentLayout } = useDashboard();
  
  // Register a new widget at runtime
  const handleAddWidget = () => {
    registerWidget({
      id: 'dynamicWidget',
      title: 'Dynamic Widget',
      component: DynamicWidget,
      defaultProps: { data: someData },
      availableFor: ['student'],
    });
    
    // Also add it to a layout
    const currentLayout = layouts[currentLayout];
    const updatedLayout = {
      ...currentLayout,
      regions: currentLayout.regions.map(region => 
        region.id === 'mainContent' 
          ? { ...region, widgets: [...region.widgets, 'dynamicWidget'] }
          : region
      )
    };
    
    registerLayout(updatedLayout);
  };
  
  return (
    <button onClick={handleAddWidget}>Add Widget</button>
  );
};
```

## Best Practices

1. **Keep widgets self-contained**: Each widget should be responsible for its own data fetching and state management.

2. **Use standard styling**: Follow the established styling patterns for consistency.

3. **Support different device sizes**: Make widgets responsive using Tailwind's responsive classes.

4. **Handle loading and error states**: Each widget should handle its loading and error states gracefully.

5. **Follow naming conventions**: Use clear, consistent naming for components and files.

6. **Use types**: Ensure all components have proper TypeScript interfaces.

7. **Document your changes**: Add comments explaining complex logic and update this guide when adding significant features.

## Troubleshooting

- If a widget is not appearing, check that it's registered in the Widget Registry and included in a layout region.
- If a layout is not working, verify that all referenced widgets exist in the Widget Registry.
- Check the browser console for any error messages from the dashboard initialization.

## Future Enhancements

Planned enhancements to the dashboard architecture:

1. User-customizable layouts with drag-and-drop functionality
2. Persisted dashboard configurations in user profiles
3. Widget-specific settings and preferences
4. Analytics tracking for dashboard interactions
5. Extended widget library for additional functionality

## Contributing

When contributing to the dashboard, please:

1. Follow the architecture patterns established in this guide
2. Create self-contained widgets that handle their own state
3. Update the Widget Registry and Layout Registry as needed
4. Add appropriate documentation in code comments
5. Test your changes on different device sizes 