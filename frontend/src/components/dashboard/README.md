# Enhanced Dashboard Architecture

This document outlines the enhanced dashboard architecture implemented in the Fruition application. The architecture provides a modular, extensible, and maintainable approach to building dashboard experiences with robust error handling and efficient data loading.

## Core Components

### Query Infrastructure

- **QueryProvider**: A centralized provider for TanStack Query that enables efficient data fetching, caching, and state management across the dashboard.
- **useDashboardData Hooks**: Custom React Query hooks that encapsulate data fetching logic for various dashboard components:
  - `useTopChoicesWidget`: For managing top project choices
  - `useMetricsData`: For fetching dashboard metrics
  - `useApplicationsData`: For application statistics
  - `useActivityFeedData`: For activity feed information

### Widget Management

- **WidgetRegistry**: Centralizes the definition of all available widgets with metadata
- **DashboardWidgetContainer**: Wraps widgets with error boundaries and loading states
- **WidgetErrorBoundary**: Isolates errors within individual widgets to prevent the entire dashboard from crashing
- **DashboardWidgetSkeleton**: Provides consistent loading states across widgets

### Layout System

- **UnifiedDashboardLayout**: Combines QueryProvider and DashboardProvider for a comprehensive solution
- **DashboardSection**: Renders a section of widgets with a title, description, and flexible grid layout
- **ModularDashboardLayout**: Renders a configurable layout of regions and widgets
- **DashboardRegion**: Renders a region of the dashboard with configurable columns

## Key Features

1. **Error Isolation**: Errors in one widget don't crash the entire dashboard
2. **Centralized Data Fetching**: React Query hooks manage data dependencies and caching
3. **Loading States**: Consistent loading states across the dashboard
4. **Modular Design**: Widgets can be added, removed, or rearranged without changing core code
5. **Type Safety**: TypeScript interfaces ensure proper component usage
6. **Responsive Layout**: Grid-based layout adapts to different screen sizes

## Usage Examples

### Basic Dashboard with UnifiedDashboardLayout

```tsx
import { UnifiedDashboardLayout, DashboardSection } from '@/components/dashboard/layout/UnifiedDashboardLayout';
import MetricsWidget from '@/components/dashboard/widgets/metrics/MetricsWidget';

function SimpleDashboard() {
  return (
    <UnifiedDashboardLayout userRole="student">
      <DashboardSection 
        title="Key Metrics" 
        columns={4}
      >
        <MetricsWidget />
      </DashboardSection>
    </UnifiedDashboardLayout>
  );
}
```

### Using Modular Dashboard Layout

```tsx
import { UnifiedDashboardLayout } from '@/components/dashboard/layout/UnifiedDashboardLayout';
import ModularDashboardLayout from '@/components/dashboard/layout/ModularDashboardLayout';

function ModularDashboard() {
  return (
    <UnifiedDashboardLayout 
      userRole="student"
      initialLayoutId="studentDefault"
    >
      <ModularDashboardLayout />
    </UnifiedDashboardLayout>
  );
}
```

### Custom Widget with React Query Hook

```tsx
import { useMetricsData } from '@/hooks/useDashboardData';

function CustomMetricsWidget() {
  const { data, isLoading, error } = useMetricsData();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {data?.map(metric => (
        <MetricCard 
          key={metric.label}
          label={metric.label}
          value={metric.value}
          color={metric.color}
        />
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use Suspense and Error Boundaries**: Wrap data-fetching components with Suspense and error boundaries
2. **Implement Loading States**: Always provide loading states for a better UX
3. **Isolate Data Fetching**: Keep data fetching logic in dedicated hooks
4. **Component Composition**: Build complex UIs with smaller, reusable components
5. **Type Safety**: Use TypeScript interfaces for props validation

## Performance Considerations

- React Query's caching reduces unnecessary network requests
- Error boundaries prevent cascade failures
- Lazy loading of widgets can improve initial load time
- Suspense boundaries help manage loading states

## Future Enhancements

1. User-customizable widget layouts with drag-and-drop
2. Widget-specific settings and configuration
3. Dashboard sharing and collaboration features
4. Enhanced analytics and visualization widgets
5. Real-time updates with websocket integration

## Troubleshooting

- **Widget doesn't appear**: Check if it's properly registered in WidgetRegistry
- **Data not refreshing**: Verify query invalidation logic in React Query hooks
- **Error boundaries catching too many errors**: Review error handling in individual widgets 