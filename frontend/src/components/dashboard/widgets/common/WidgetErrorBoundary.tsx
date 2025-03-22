'use client';

import React, { Component, ErrorInfo } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface WidgetErrorBoundaryProps {
  children: React.ReactNode;
  widgetId: string;
  widgetTitle?: string;
  widgetName?: string; // For backward compatibility
  fallback?: React.ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for dashboard widgets
 * Catches errors within individual widgets to prevent the entire dashboard from crashing
 */
class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    const widgetName = this.props.widgetTitle || this.props.widgetName || this.props.widgetId || 'Unknown';
    console.error(`Widget Error (${widgetName}):`, error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, widgetTitle, widgetName, fallback } = this.props;
    const displayName = widgetTitle || widgetName || 'Widget';

    if (hasError) {
      // Custom fallback or default error UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">
                {displayName} Error
              </h3>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-3 py-1 text-sm bg-white border border-red-300 rounded-md text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
          <p className="text-sm text-red-600">
            {error?.message || 'Something went wrong loading this widget.'}
          </p>
        </div>
      );
    }

    return children;
  }
}

export default WidgetErrorBoundary; 