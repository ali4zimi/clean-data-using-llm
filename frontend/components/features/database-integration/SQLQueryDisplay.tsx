import React from 'react';
import Button from '../../ui/Button';

interface SQLQueryDisplayProps {
  query: string;
  onCopy: () => void;
  onDownload: () => void;
}

export default function SQLQueryDisplay({ query, onCopy, onDownload }: SQLQueryDisplayProps) {
  if (!query) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Generated SQL Query:</h3>
        <div className="space-x-2">
          <Button
            onClick={onCopy}
            variant="secondary"
            size="sm"
          >
            Copy to Clipboard
          </Button>
          <Button
            onClick={onDownload}
            variant="success"
            size="sm"
          >
            Download SQL File
          </Button>
        </div>
      </div>
      <textarea
        value={query}
        readOnly
        className="w-full h-64 p-3 bg-gray-50 border border-gray-300 rounded text-sm font-mono text-gray-700 resize-none"
      />
    </div>
  );
}
