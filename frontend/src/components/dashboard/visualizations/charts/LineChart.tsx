'use client';

import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
// Only register on the client side to prevent SSR issues
let isChartJSRegistered = false;

// Define custom interfaces to avoid Chart.js type import issues
interface LineChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  tension?: number;
}

interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

// Define a more specific type for the options
interface LineChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right';
      align?: 'start' | 'center' | 'end';
      labels?: {
        boxWidth?: number;
        usePointStyle?: boolean;
        pointStyle?: string;
      };
    };
    title?: {
      display?: boolean;
      text?: string;
      align?: 'start' | 'center' | 'end';
      font?: {
        size?: number;
        weight?: string;
      };
    };
    tooltip?: {
      mode?: string;
      intersect?: boolean;
      backgroundColor?: string;
      titleColor?: string;
      bodyColor?: string;
      borderColor?: string;
      borderWidth?: number;
      padding?: number;
      displayColors?: boolean;
      cornerRadius?: number;
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
      };
      ticks?: {
        color?: string;
      };
    };
    y?: {
      beginAtZero?: boolean;
      grid?: {
        color?: string;
      };
      ticks?: {
        color?: string;
        precision?: number;
      };
    };
  };
  interaction?: {
    mode?: string;
    axis?: string;
    intersect?: boolean;
  };
  elements?: {
    line?: {
      tension?: number;
    };
    point?: {
      radius?: number;
      hoverRadius?: number;
    };
  };
  [key: string]: any; // Allow other properties that might be needed
}

export interface LineChartProps {
  data: LineChartData;
  options?: LineChartOptions;
  height?: number | string;
  width?: number | string;
  title?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable LineChart component for data visualization
 * Wraps react-chartjs-2 with sensible defaults and TypeScript support
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  options,
  height = 250,
  width = '100%',
  title,
  isLoading = false,
  className = '',
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Register ChartJS components only on client-side
  useEffect(() => {
    if (!isChartJSRegistered) {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      );
      isChartJSRegistered = true;
    }
    
    setHasMounted(true);
  }, []);

  // Default chart options with good UX and accessibility
  const defaultOptions: LineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: !!title,
        text: title || '',
        align: 'start',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
        ticks: {
          color: '#666',
          precision: 0, // For integers (like application counts)
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4, // Slightly curved lines
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  };

  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Don't render during SSR to prevent hydration issues
  if (!hasMounted) {
    return (
      <div 
        style={{ height, width }} 
        className={`flex items-center justify-center ${className}`}
      >
        <div>Loading chart...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        style={{ height, width }} 
        className={`flex items-center justify-center ${className}`}
      >
        <div className="animate-pulse">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div 
      style={{ height, width }} 
      className={`relative ${className}`}
    >
      {/* Using type assertion instead of @ts-ignore for better type safety */}
      <Line 
        data={data as any} 
        options={mergedOptions}
      />
    </div>
  );
};

export default LineChart; 