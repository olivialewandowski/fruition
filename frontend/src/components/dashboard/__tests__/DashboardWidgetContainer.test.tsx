import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardWidgetContainer from '@/components/dashboard/widgets/common/DashboardWidgetContainer';
import WidgetErrorBoundary from '@/components/dashboard/widgets/common/WidgetErrorBoundary';
import DashboardWidgetSkeleton from '@/components/dashboard/widgets/common/DashboardWidgetSkeleton';

// Mock the imports
jest.mock('@/components/dashboard/widgets/common/WidgetErrorBoundary', () => {
  return jest.fn(props => (
    <div data-testid={`error-boundary-${props.widgetId}`}>
      <div data-testid="widget-title">{props.widgetTitle}</div>
      {props.children}
    </div>
  ));
});

jest.mock('@/components/dashboard/widgets/common/DashboardWidgetSkeleton', () => {
  return jest.fn(() => <div data-testid="widget-skeleton">Loading...</div>);
});

// Get the mocked version of the component
const mockedWidgetErrorBoundary = WidgetErrorBoundary as unknown as jest.Mock;

describe('DashboardWidgetContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with children props', () => {
    const { getByTestId } = render(
      <DashboardWidgetContainer 
        widgetId="test-widget" 
        widgetTitle="Test Widget" 
        className="custom-class"
      >
        <div data-testid="widget-content">Widget Content</div>
      </DashboardWidgetContainer>
    );
    
    // Check if error boundary is called
    expect(mockedWidgetErrorBoundary).toHaveBeenCalled();
    const lastCall = mockedWidgetErrorBoundary.mock.calls[0][0];
    expect(lastCall.widgetId).toBe('test-widget');
    expect(lastCall.widgetTitle).toBe('Test Widget');
    
    // Check if content is rendered
    expect(getByTestId('error-boundary-test-widget')).toBeInTheDocument();
    expect(getByTestId('widget-content')).toBeInTheDocument();
    expect(getByTestId('widget-title').textContent).toBe('Test Widget');
  });
  
  test('renders with widget config', () => {
    const TestWidgetComponent = () => <div data-testid="config-widget-content">Config Widget Content</div>;
    
    const widgetConfig = {
      id: 'config-widget',
      title: 'Config Widget',
      component: TestWidgetComponent,
      defaultProps: { testProp: 'test' }
    };
    
    const { getByTestId } = render(
      <DashboardWidgetContainer widget={widgetConfig} className="config-class" />
    );
    
    // Check if error boundary is called
    expect(mockedWidgetErrorBoundary).toHaveBeenCalled();
    const lastCall = mockedWidgetErrorBoundary.mock.calls[0][0];
    expect(lastCall.widgetId).toBe('config-widget');
    expect(lastCall.widgetTitle).toBe('Config Widget');
    
    // Check if widget component is rendered
    expect(getByTestId('error-boundary-config-widget')).toBeInTheDocument();
    expect(getByTestId('config-widget-content')).toBeInTheDocument();
  });
  
  test('handles missing title in widget config', () => {
    const TestWidgetComponent = () => <div>No Title Widget</div>;
    
    const widgetConfig = {
      id: 'no-title-widget',
      component: TestWidgetComponent
    };
    
    render(
      <DashboardWidgetContainer widget={widgetConfig} />
    );
    
    // Should use 'Widget' as default title
    expect(mockedWidgetErrorBoundary).toHaveBeenCalled();
    const lastCall = mockedWidgetErrorBoundary.mock.calls[0][0];
    expect(lastCall.widgetId).toBe('no-title-widget');
    expect(lastCall.widgetTitle).toBe('Widget');
  });
  
  test('adds custom className', () => {
    const { container } = render(
      <DashboardWidgetContainer 
        widgetId="styled-widget" 
        widgetTitle="Styled Widget" 
        className="test-custom-class"
      >
        <div>Content</div>
      </DashboardWidgetContainer>
    );
    
    // Find the container div
    const widgetContainer = container.querySelector('.dashboard-widget-container');
    expect(widgetContainer).toHaveClass('test-custom-class');
  });
  
  test('renders nothing with incorrect props', () => {
    // Create a component wrapper to handle the type error
    const IncorrectUsageWrapper = () => {
      // @ts-expect-error - Intentionally testing incorrect usage without required props
      return <DashboardWidgetContainer />;
    };
    
    const { container } = render(<IncorrectUsageWrapper />);
    
    // Should render nothing or an empty div
    const element = container.firstChild;
    expect(element).toBeFalsy();
  });
}); 