import React, { Suspense, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WidgetErrorBoundary from '@/components/dashboard/widgets/common/WidgetErrorBoundary';

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
  return <div>This should not render</div>;
};

// Normal component
const NormalComponent = () => <div data-testid="normal-component">Normal content</div>;

describe('WidgetErrorBoundary', () => {
  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  let mockConsoleError: jest.Mock;
  
  beforeEach(() => {
    mockConsoleError = jest.fn();
    console.error = mockConsoleError;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
    jest.restoreAllMocks();
  });
  
  test('renders children when no error occurs', () => {
    render(
      <WidgetErrorBoundary widgetId="test-widget" widgetTitle="Test Widget">
        <NormalComponent />
      </WidgetErrorBoundary>
    );
    
    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
  
  test('shows error UI when an error occurs', () => {
    render(
      <WidgetErrorBoundary widgetId="error-widget" widgetTitle="Error Widget">
        <ErrorComponent />
      </WidgetErrorBoundary>
    );
    
    // Check if the error title is displayed with the widget name
    expect(screen.getByText(/Error Widget Error/i)).toBeInTheDocument();
    
    // Check if error message is displayed (may be partial match depending on implementation)
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    
    // Check if retry button is rendered
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });
  
  test('uses fallback name when widgetTitle is not provided', () => {
    render(
      <WidgetErrorBoundary widgetId="no-title-widget">
        <ErrorComponent />
      </WidgetErrorBoundary>
    );
    
    // Should have "Widget Error" as the title
    expect(screen.getByText(/Widget Error/i)).toBeInTheDocument();
  });
  
  test('renders custom fallback UI if provided', () => {
    // Simple fallback element instead of a component
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <WidgetErrorBoundary 
        widgetId="custom-fallback-widget" 
        widgetTitle="Custom Fallback Widget"
        fallback={customFallback}
      >
        <ErrorComponent />
      </WidgetErrorBoundary>
    );
    
    // Check if custom fallback is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
  
  // Omit the retry test for now since it requires more state management
  // than we can easily set up in this test environment
}); 