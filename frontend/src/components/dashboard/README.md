# Dashboard Component Architecture

This directory contains a modular, scalable architecture for building dashboard components and visualizations. The architecture is designed to be flexible, reusable, and maintainable, allowing for easy extension as the dashboard grows.

## Directory Structure

```
dashboard/
  ├── visualizations/           # Core visualization components
  │   ├── charts/               # Various chart types (line, bar, pie, etc.)
  │   └── tables/               # Data table components
  ├── widgets/                  # Feature-specific dashboard widgets
  │   ├── applications/         # Application-related widgets
  │   └── ...                   # Other feature-specific widgets
  ├── layouts/                  # Layout components for organizing widgets
  └── pages/                    # Complete dashboard page compositions
```

## Component Hierarchy

The component architecture follows a layered approach:

1. **Core Visualization Components**: Base components that wrap charting libraries
2. **Feature Widgets**: Self-contained components that combine visualizations with controls
3. **Layout Components**: Components for organizing widgets on the dashboard
4. **Dashboard Pages**: Full dashboard views composed of multiple widgets

## Design Principles

- **Separation of Concerns**: Each component has a single responsibility
- **Reusability**: Components are designed to be reused across multiple dashboards
- **Composition**: Complex UIs are built by composing smaller components
- **Data Independence**: Visualization components accept data via props, not fetching directly
- **Responsive Design**: All components adapt to different screen sizes

## Integrated Grid-Based Dashboard Layout

The main dashboard is now built using the grid-based layout architecture. Key features:

- **Maintained Navigation**: The active/archived tabs functionality is preserved for a consistent user experience
- **Responsive Grid Layout**: Projects and application data are displayed in an organized grid
- **Student Applications Widget**: For student users, displays application statistics and data in a clean, card-based format
- **Project Cards**: Each project is displayed in a card with consistent styling and information

### Layout Components

- **DashboardLayout**: Main container component that holds the entire dashboard content
- **DashboardSection**: Groups related widgets in a responsive grid layout with configurable columns
- **DashboardCard**: Individual card component that provides consistent styling for dashboard content

### Dashboard Structure

```tsx
<DashboardLayout>
  {/* Dashboard Header */}
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
      <p className="text-gray-500 mt-1">
        {activeTab === 'active' ? 'Manage your active projects' : 'View your archived projects'}
      </p>
    </div>
    
    <button className="px-4 py-2 text-sm md:text-base text-white bg-purple-600 rounded-md">
      New Project +
    </button>
  </div>
  
  {/* Student Applications Section */}
  <div className="mb-8">
    <StudentActiveTabApplications onRefresh={handleRefresh} />
  </div>
  
  {/* Projects Grid */}
  <DashboardSection 
    title="Your Projects" 
    description="Manage your active projects" 
    columns={2}
  >
    {/* Project cards */}
  </DashboardSection>
</DashboardLayout>
```

### Responsive Behavior

The grid layout is fully responsive:
- On mobile: Widgets stack vertically (1 column)
- On tablets: Most sections become 2 columns
- On desktop: Sections expand to their specified column count

## Usage Examples

### Basic Chart Component

```tsx
import LineChart from '../dashboard/visualizations/charts/LineChart';

// Inside your component
<LineChart 
  data={chartData}
  height={250}
  title="Applications over time"
/>
```

### Complete Dashboard Widget

```tsx
import ApplicationsWidget from '../dashboard/widgets/applications/ApplicationsWidget';

// Inside your component
<ApplicationsWidget userId={currentUser.uid} />
```

### Creating a Grid Section

```tsx
import { DashboardSection } from '@/components/dashboard/layouts/DashboardLayout';
import DashboardCard from '@/components/dashboard/widgets/DashboardCard';

// Inside your component
<DashboardSection title="Your Widgets" columns={2}>
  <DashboardCard title="Widget 1">
    {/* Widget 1 content */}
  </DashboardCard>
  <DashboardCard title="Widget 2">
    {/* Widget 2 content */}
  </DashboardCard>
</DashboardSection>
```

## Adding New Components

### Adding a New Chart Type

1. Create a new file in `visualizations/charts/` (e.g., `BarChart.tsx`)
2. Implement the component using chart.js/react-chartjs-2
3. Export the component with TypeScript interfaces

### Adding a New Widget

1. Create a new directory in `widgets/` for your feature
2. Create a main widget component that uses visualization components
3. Implement any data fetching logic in a custom hook
4. Export the widget component

## Best Practices

- Use TypeScript interfaces for all component props
- Implement loading and error states for all data-dependent components
- Use react-chartjs-2 for standard charts, D3.js for more complex visualizations
- Follow accessible design principles (proper contrast, keyboard navigation)
- Test components with empty and populated data states 