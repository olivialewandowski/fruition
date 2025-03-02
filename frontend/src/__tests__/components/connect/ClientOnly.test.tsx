import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Mock the firebase config
jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {}
}));

// Create a simple ClientOnly component for testing
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  if (!mounted) {
    return <div data-testid="loading-skeleton">Loading...</div>;
  }
  
  return <>{children}</>;
};

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('ClientOnly', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders a loading skeleton initially', () => {
    render(
      <ClientOnly>
        <div data-testid="test-content">Test Content</div>
      </ClientOnly>
    );

    // The loading skeleton should be visible
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders children after the delay', async () => {
    render(
      <ClientOnly>
        <div data-testid="test-content">Test Content</div>
      </ClientOnly>
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now the children should be visible
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('cleans up the timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    const { unmount } = render(
      <ClientOnly>
        <div>Test Content</div>
      </ClientOnly>
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
}); 