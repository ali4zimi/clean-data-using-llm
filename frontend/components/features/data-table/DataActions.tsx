import React from 'react';
import Dropdown from '../../ui/Dropdown';

interface DataActionsProps {
  data: any[];
  columnOrder: string[];
  showTable: boolean;
  onShowTableChange: (show: boolean) => void;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  itemCount?: number;
  fileName?: string;
}

export default function DataActions({
  data,
  columnOrder,
  showTable,
  onShowTableChange,
  onDownloadCSV,
  onDownloadJSON,
  itemCount,
  fileName = 'processed_data'
}: DataActionsProps) {
  const [showDownloadDropdown, setShowDownloadDropdown] = React.useState(false);
  const count = itemCount || data.length;

  // Determine file type and colors based on fileName extension
  const getFileInfo = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return {
          type: 'CSV',
          displayName: fileName,
          tagColor: 'text-orange-600 bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          bgColor: 'bg-orange-50',
          hoverBg: 'hover:bg-orange-50'
        };
      case 'json':
      default:
        return {
          type: 'JSON',
          displayName: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
          tagColor: 'text-green-600 bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50',
          hoverBg: 'hover:bg-green-50'
        };
    }
  };

  const fileInfo = getFileInfo();

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Processed Data:</h3>
      <div className={`flex items-center justify-between border rounded p-2 ${fileInfo.bgColor} ${fileInfo.borderColor}`}>
        <div className="flex items-center">
          <span className={`text-xs font-medium mr-2 px-2 py-1 rounded ${fileInfo.tagColor}`}>{fileInfo.type}</span>
          <span className={fileInfo.textColor}>{fileInfo.displayName}</span>
          <span className="text-xs text-gray-400 ml-2">({count} entries)</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onShowTableChange(!showTable)}
            className={`text-sm px-2 py-1 border rounded hover:bg-opacity-75 transition-colors ${fileInfo.borderColor} ${fileInfo.hoverBg} ${fileInfo.textColor}`}
          >
            {showTable ? 'Hide Table' : 'View Table'}
          </button>
          <Dropdown
            isOpen={showDownloadDropdown}
            onClose={() => setShowDownloadDropdown(false)}
            trigger={
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className={`text-sm px-2 py-1 border rounded hover:bg-opacity-75 transition-colors ${fileInfo.borderColor} ${fileInfo.hoverBg} ${fileInfo.textColor} flex items-center`}
              >
                Download
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
          >
            <div className="w-24">
              <button
                onClick={() => {
                  onDownloadCSV();
                  setShowDownloadDropdown(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
              >
                CSV
              </button>
              <button
                onClick={() => {
                  onDownloadJSON();
                  setShowDownloadDropdown(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
              >
                JSON
              </button>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
