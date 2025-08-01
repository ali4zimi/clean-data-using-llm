import React from 'react';

interface QueryTypeConfig {
  queryType: 'insert' | 'ai';
  onQueryTypeChange: (type: 'insert' | 'ai') => void;
}

export default function QueryTypeSelector({ queryType, onQueryTypeChange }: QueryTypeConfig) {
  return (
    <div className="mb-4">
      <label htmlFor="query-type" className="block text-sm font-medium text-gray-700 mb-2">
        Query Generation Method:
      </label>
      <select
        id="query-type"
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={queryType}
        onChange={(e) => onQueryTypeChange(e.target.value as 'insert' | 'ai')}
      >
        <option value="insert">Standard INSERT Query</option>
        <option value="ai">AI-Generated Custom Query</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        {queryType === 'insert' 
          ? 'Generate standard SQL INSERT statements for your data'
          : 'Use AI to create custom SQL queries based on your specific requirements'
        }
      </p>
    </div>
  );
}
