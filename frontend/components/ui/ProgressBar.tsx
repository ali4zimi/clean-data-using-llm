import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  status?: 'idle' | 'processing' | 'complete' | 'error';
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  progress, 
  status = 'idle', 
  label, 
  showPercentage = true 
}: ProgressBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing': return 'Processing...';
      case 'complete': return '100%';
      case 'error': return 'Failed';
      default: return '0%';
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-xs text-gray-500">
            {showPercentage ? getStatusText() : ''}
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
