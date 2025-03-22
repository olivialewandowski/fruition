import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';

// Simple widget component for testing
const TestWidget = () => <div>Test Widget Content</div>;

describe('DashboardContext', () => {
  // Simple test component that exposes context functionality
  const TestComponent = () => {
    const {
      widgets,
      layouts,
      currentLayout,
      registerWidget,
      registerLayout,
      setCurrentLayout,
      getWidgetsByRegion,
    } = useDashboard();

    // Function to get widgets for main region in the test layout
    const getMainWidgets = () => {
      return getWidgetsByRegion('main');
    };

    return (
      <div>
        <div data-testid="widget-count">{Object.keys(widgets).length}</div>
        <div data-testid="layout-count">{Object.keys(layouts).length}</div>
        <div data-testid="current-layout">{currentLayout || 'none'}</div>
        
        <button 
          data-testid="register-widget-btn" 
          onClick={() => registerWidget({
            id: 'test-widget',
            title: 'Test Widget',
            component: TestWidget,
            defaultProps: { region: 'main' }
          })}
        >
          Register Widget
        </button>
        
        <button 
          data-testid="register-layout-btn" 
          onClick={() => registerLayout({
            id: 'test-layout',
            name: 'Test Layout',
            regions: [
              {
                id: 'main',
                widgets: ['test-widget']
              },
              {
                id: 'sidebar',
                widgets: []
              }
            ]
          })}
        >
          Register Layout
        </button>
        
        <button 
          data-testid="set-layout-btn" 
          onClick={() => setCurrentLayout('test-layout')}
        >
          Set Layout
        </button>
        
        <div id="region-widget-count">{getMainWidgets().length}</div>
      </div>
    );
  };

  test('provides default values', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    // Check default values
    expect(screen.getByTestId('widget-count').textContent).toBe('0');
    
    // The DashboardProvider initializes with a default layout
    expect(screen.getByTestId('layout-count').textContent).toBe('1');
    expect(screen.getByTestId('current-layout').textContent).toBe('default');
  });

  test('registers a widget', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );
    
    // Initially, no widgets
    expect(screen.getByTestId('widget-count').textContent).toBe('0');
    
    // Register a widget
    act(() => {
      screen.getByTestId('register-widget-btn').click();
    });
    
    // Should now have one widget
    expect(screen.getByTestId('widget-count').textContent).toBe('1');
  });
  
  test('registers a layout', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );
    
    // Initially, the provider initializes with a default layout
    expect(screen.getByTestId('layout-count').textContent).toBe('1');
    
    // Register a layout
    act(() => {
      screen.getByTestId('register-layout-btn').click();
    });
    
    // Should now have two layouts (default + test-layout)
    expect(screen.getByTestId('layout-count').textContent).toBe('2');
  });
  
  test('sets the current layout', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );
    
    // Register required widget and layout first
    act(() => {
      screen.getByTestId('register-widget-btn').click();
      screen.getByTestId('register-layout-btn').click();
    });
    
    // Set the current layout
    act(() => {
      screen.getByTestId('set-layout-btn').click();
    });
    
    // Should now have the layout set
    expect(screen.getByTestId('current-layout').textContent).toBe('test-layout');
  });
  
  test('getWidgetsByRegion returns correct widgets', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );
    
    // Register required widget and layout first
    act(() => {
      screen.getByTestId('register-widget-btn').click();
      screen.getByTestId('register-layout-btn').click();
      // Set the layout to test-layout
      screen.getByTestId('set-layout-btn').click();
    });
    
    // Should find one widget in the main region
    expect(document.getElementById('region-widget-count')!.textContent).toBe('1');
  });
  
  test('prevents duplicate widget registrations', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );
    
    // Register a widget twice
    act(() => {
      screen.getByTestId('register-widget-btn').click();
      screen.getByTestId('register-widget-btn').click();
    });
    
    // Should still only have one widget
    expect(screen.getByTestId('widget-count').textContent).toBe('1');
  });
}); 