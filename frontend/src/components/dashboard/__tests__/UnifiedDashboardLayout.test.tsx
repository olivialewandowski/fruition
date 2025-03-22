import React from 'react';
import { render } from '@testing-library/react';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { UnifiedDashboardLayout } from '@/components/dashboard/layout/UnifiedDashboardLayout';
import DashboardInitializer from '@/components/dashboard/layout/DashboardInitializer';

// Mock components
jest.mock('@/components/dashboard/widgets/common/DashboardWidgetContainer', () => {
  return {
    __esModule: true,
    default: ({ widgetId, title, children }: any) => (
      <div data-testid={`widget-container-${widgetId}`} className="widget-container">
        <h3>{title}</h3>
        <div className="widget-content">{children}</div>
      </div>
    ),
  };
});

// Mock the WidgetErrorBoundary
jest.mock('@/components/dashboard/widgets/common/WidgetErrorBoundary', () => {
  return {
    __esModule: true,
    default: ({ children }: any) => <div className="error-boundary">{children}</div>,
  };
});

// Mock the DashboardWidgetSkeleton
jest.mock('@/components/dashboard/widgets/common/DashboardWidgetSkeleton', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="widget-skeleton">Loading...</div>,
  };
});

// Mock QueryProvider
jest.mock('@/contexts/QueryProvider', () => {
  return {
    __esModule: true, 
    default: ({ children }: any) => <div className="query-provider">{children}</div>
  };
});

// Mock the DashboardInitializer
jest.mock('@/components/dashboard/layout/DashboardInitializer', () => {
  return {
    __esModule: true,
    default: jest.fn(({ userRole, initialLayoutId }) => (
      <div data-testid={`initializer-${userRole}-${initialLayoutId || 'default'}`}>
        Dashboard Initializer
      </div>
    )),
  };
});

// Mock widget and layout registries
jest.mock('@/components/dashboard/widgets/WidgetRegistry', () => ({
  dashboardWidgets: {
    'mock-widget-1': {
      id: 'mock-widget-1',
      title: 'Mock Widget 1',
      component: () => <div data-testid="mock-widget-1-content">Widget 1 Content</div>,
    },
    'mock-widget-2': {
      id: 'mock-widget-2',
      title: 'Mock Widget 2',
      component: () => <div data-testid="mock-widget-2-content">Widget 2 Content</div>,
    },
    'mock-widget-3': {
      id: 'mock-widget-3',
      title: 'Mock Widget 3',
      component: () => <div data-testid="mock-widget-3-content">Widget 3 Content</div>,
    },
  },
}));

jest.mock('@/components/dashboard/layout/LayoutRegistry', () => ({
  dashboardLayouts: {
    'unified-layout': {
      id: 'unified-layout',
      name: 'Unified Layout',
      regions: [
        {
          id: 'top',
          widgets: ['mock-widget-1'],
        },
        {
          id: 'left',
          widgets: ['mock-widget-2'],
        },
        {
          id: 'right',
          widgets: ['mock-widget-3'],
        },
      ],
    },
    'empty-layout': {
      id: 'empty-layout',
      name: 'Empty Layout',
      regions: [
        {
          id: 'top',
          widgets: [],
        },
        {
          id: 'left',
          widgets: [],
        },
        {
          id: 'right',
          widgets: [],
        },
      ],
    },
  },
  getDefaultLayoutForRole: (role: string) => ({
    id: 'unified-layout',
    name: 'Unified Layout',
    regions: [
      {
        id: 'top',
        widgets: ['mock-widget-1'],
      },
      {
        id: 'left',
        widgets: ['mock-widget-2'],
      },
      {
        id: 'right',
        widgets: ['mock-widget-3'],
      },
    ],
  }),
}));

describe('UnifiedDashboardLayout', () => {
  test('renders with QueryProvider when withQueryProvider is true', () => {
    const { container, getByTestId } = render(
      <UnifiedDashboardLayout userRole="student" withQueryProvider={true}>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </UnifiedDashboardLayout>
    );
    
    // Check if QueryProvider is used
    expect(container.querySelector('.query-provider')).toBeInTheDocument();
    
    // Check if dashboard content is rendered
    expect(getByTestId('dashboard-content')).toBeInTheDocument();
    
    // Check if initializer is rendered with correct props
    expect(getByTestId('initializer-student-default')).toBeInTheDocument();
  });
  
  test('renders without QueryProvider when withQueryProvider is false', () => {
    const { container, getByTestId } = render(
      <UnifiedDashboardLayout userRole="student" withQueryProvider={false}>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </UnifiedDashboardLayout>
    );
    
    // Check if QueryProvider is not used
    expect(container.querySelector('.query-provider')).toBeNull();
    
    // Check if dashboard content is rendered
    expect(getByTestId('dashboard-content')).toBeInTheDocument();
  });
  
  test('renders with specified initialLayoutId', () => {
    const { getByTestId } = render(
      <UnifiedDashboardLayout userRole="admin" initialLayoutId="custom-layout">
        <div data-testid="dashboard-content">Dashboard Content</div>
      </UnifiedDashboardLayout>
    );
    
    // Check if initializer is rendered with correct props
    expect(getByTestId('initializer-admin-custom-layout')).toBeInTheDocument();
  });
  
  test('applies custom className', () => {
    const { container } = render(
      <UnifiedDashboardLayout userRole="student" className="custom-class" withQueryProvider={false}>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </UnifiedDashboardLayout>
    );
    
    // Check if the custom class is applied to the dashboard container
    const dashboardElement = container.firstChild as HTMLElement;
    expect(dashboardElement).toHaveClass('custom-class');
  });
}); 