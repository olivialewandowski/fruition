import React from 'react';

export interface StatDisplayProps {
  label: string;
  value: number | string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  prefix?: string;
  suffix?: string;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Component for displaying key metrics with optional trend indicators
 */
export const StatDisplay: React.FC<StatDisplayProps> = ({
  label,
  value,
  change,
  prefix = '',
  suffix = '',
  className = '',
  icon
}) => {
  // Format number values
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat().format(value)
    : value;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-bold text-gray-900">
          {prefix}{formattedValue}{suffix}
        </div>
        
        {change && (
          <div className="flex items-center mt-1">
            <span 
              className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. previous period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatDisplay; 