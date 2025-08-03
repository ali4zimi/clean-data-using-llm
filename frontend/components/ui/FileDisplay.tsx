import React from 'react';

interface FileDisplayProps {
  name: string;
  size?: number;
  type?: 'PDF' | 'TXT' | 'JSON' | 'CSV';
  status?: 'uploading' | 'complete' | 'error';
  onView?: () => void;
  onDownload?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function FileDisplay({
  name,
  size,
  type = 'PDF',
  status = 'complete',
  onView,
  onDownload,
  onAction,
  actionLabel,
  className = ''
}: FileDisplayProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'PDF': return 'text-blue-600 bg-blue-100 border-blue-200 bg-blue-50';
      case 'TXT': return 'text-green-600 bg-green-100 border-green-200 bg-green-50';
      case 'JSON': return 'text-purple-600 bg-purple-100 border-purple-200 bg-purple-50';
      case 'CSV': return 'text-orange-600 bg-orange-100 border-orange-200 bg-orange-50';
      default: return 'text-gray-600 bg-gray-100 border-gray-200 bg-gray-50';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'PDF': return 'border-blue-200';
      case 'TXT': return 'border-green-200';
      case 'JSON': return 'border-purple-200';
      case 'CSV': return 'border-orange-200';
      default: return 'border-gray-200';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'PDF': return 'bg-blue-50';
      case 'TXT': return 'bg-green-50';
      case 'JSON': return 'bg-purple-50';
      case 'CSV': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'PDF': return 'text-blue-700';
      case 'TXT': return 'text-green-700';
      case 'JSON': return 'text-purple-700';
      case 'CSV': return 'text-orange-700';
      default: return 'text-gray-700';
    }
  };

  const getTagColor = () => {
    switch (type) {
      case 'PDF': return 'text-blue-600 bg-blue-100';
      case 'TXT': return 'text-green-600 bg-green-100';
      case 'JSON': return 'text-purple-600 bg-purple-100';
      case 'CSV': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`flex items-center justify-between border rounded p-3 ${getBorderColor()} ${getBackgroundColor()} ${className}`}>
      <div className="flex items-center">
        <span className={`text-xs font-medium mr-2 px-2 py-1 rounded ${getTagColor()}`}>
          {type}
        </span>
        <span className={getTextColor()}>{name}</span>
        {size && (
          <span className="text-xs text-gray-400 ml-2">
            ({size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`})
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        {onView && (
          <button
            onClick={onView}
            className={`text-sm px-2 py-1 border rounded hover:bg-opacity-75 transition-colors ${getBorderColor()} hover:${getBackgroundColor()}`}
            style={{ color: getTextColor().replace('text-', '') }}
          >
            View
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className={`text-sm px-2 py-1 border rounded hover:bg-opacity-75 transition-colors ${getBorderColor()} hover:${getBackgroundColor()}`}
            style={{ color: getTextColor().replace('text-', '') }}
          >
            Download
          </button>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={`text-sm px-2 py-1 border rounded hover:bg-opacity-75 transition-colors ${getBorderColor()} hover:${getBackgroundColor()} ${
              status === 'uploading' ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={status === 'uploading'}
            style={{ color: getTextColor().replace('text-', '') }}
          >
            {status === 'uploading' ? 'Processing...' : actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
