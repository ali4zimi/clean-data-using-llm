'use client';

import React, { useState, useMemo } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import DataTable from '../data-table/DataTable';
import DataActions from '../data-table/DataActions';
import QueryTypeSelector from './QueryTypeSelector';
import SQLQueryDisplay from './SQLQueryDisplay';
import PromptEditor from '../ai-processing/PromptEditor';
import { ColumnDef, ColumnOrderState } from '@tanstack/react-table';
import toast from 'react-hot-toast';

interface DatabaseIntegrationStepProps {
  processedData: string[][] | null;
  columnOrder: string[];
  tableName: string;
  queryType: 'insert' | 'ai';
  aiPrompt: string;
  aiPromptPlaceholder?: string;
  dbAiProvider: 'openai' | 'google';
  dbApiKey: string;
  onComplete: () => void;
  onColumnOrderChange?: (newOrder: string[]) => void;
  onTableNameChange: (name: string) => void;
  onQueryTypeChange: (type: 'insert' | 'ai') => void;
  onAiPromptChange: (prompt: string) => void;
  onDbAiProviderChange: (provider: 'openai' | 'google') => void;
  onDbApiKeyChange: (key: string) => void;
  showFullTable?: boolean;
  onShowFullTableChange?: (show: boolean) => void;
}

export default function DatabaseIntegrationStep({
  processedData,
  columnOrder,
  tableName,
  queryType,
  aiPrompt,
  dbAiProvider,
  dbApiKey,
  onComplete,
  onColumnOrderChange,
  onTableNameChange,
  onQueryTypeChange,
  onAiPromptChange,
  onDbAiProviderChange,
  onDbApiKeyChange,
  showFullTable = false,
  onShowFullTableChange
}: DatabaseIntegrationStepProps) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [showQuery, setShowQuery] = useState(false);
  const [localColumnOrder, setLocalColumnOrder] = useState<ColumnOrderState>(columnOrder || []);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Convert 2D array to object array for TanStack Table
  const tableData = useMemo(() => {
    if (!processedData || processedData.length < 2) return [];
    
    const headers = processedData[0];
    const rows = processedData.slice(1);
    
    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }, [processedData]);

  // Create columns for TanStack Table
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!processedData || processedData.length === 0) return [];
    
    const headers = processedData[0];
    
    return headers.map((header) => ({
      id: header,
      accessorKey: header,
      header: header,
      cell: ({ getValue }) => getValue() || '',
    }));
  }, [processedData]);

  const handleColumnOrderChange = (newOrder: ColumnOrderState) => {
    setLocalColumnOrder(newOrder);
    if (onColumnOrderChange) {
      onColumnOrderChange(newOrder);
    }
  };

  const generateInsertQuery = () => {
    if (!processedData || processedData.length === 0 || !tableName.trim()) {
      toast.error('Please provide a table name and ensure data is available');
      return;
    }

    try {
      const orderedHeaders = localColumnOrder.length > 0 ? localColumnOrder : processedData[0];
      const rows = processedData.slice(1);
      
      // Create table structure
      const tableStructure = `-- Create table structure\nCREATE TABLE IF NOT EXISTS ${tableName} (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n${orderedHeaders.map(header => `    ${header.toLowerCase().replace(/\s+/g, '_')} TEXT`).join(',\n')}\n);\n\n`;
      
      // Create insert statements
      const insertStatements = rows.map(row => {
        const originalHeaders = processedData[0];
        const orderedValues = orderedHeaders.map(header => {
          const originalIndex = originalHeaders.indexOf(header);
          return originalIndex !== -1 ? row[originalIndex] || '' : '';
        });
        
        const values = orderedValues.map(cell => `'${cell.replace(/'/g, "''")}'`).join(', ');
        return `INSERT INTO ${tableName} (${orderedHeaders.map(h => h.toLowerCase().replace(/\s+/g, '_')).join(', ')}) VALUES (${values});`;
      }).join('\n');
      
      const fullQuery = tableStructure + insertStatements;
      setSqlQuery(fullQuery);
      setShowQuery(true);
      toast.success('SQL query generated successfully!');
    } catch (error) {
      console.error('Error generating SQL:', error);
      toast.error('Failed to generate SQL query');
    }
  };

  const generateAIQuery = async () => {
    if (!processedData || processedData.length === 0 || !tableName.trim()) {
      toast.error('Please provide a table name and ensure data is available');
      return;
    }

    if (!aiPrompt.trim()) {
      toast.error('Please provide a prompt for AI query generation');
      return;
    }

    if (!dbApiKey.trim()) {
      toast.error('Please provide an API key');
      return;
    }

    try {
      toast.loading('Generating AI query...', { id: 'ai-query' });
      
      const orderedHeaders = localColumnOrder.length > 0 ? localColumnOrder : processedData[0];
      const rows = processedData.slice(1);
      
      // Prepare sample data for AI analysis (first 5 rows)
      const sampleData = rows.slice(0, 5).map(row => {
        const originalHeaders = processedData[0];
        const orderedValues = orderedHeaders.map(header => {
          const originalIndex = originalHeaders.indexOf(header);
          return originalIndex !== -1 ? row[originalIndex] || '' : '';
        });
        return orderedValues;
      });

      const payload = {
        tableName,
        headers: orderedHeaders,
        sampleData,
        totalRows: rows.length,
        userPrompt: aiPrompt.trim(),
        apiKey: dbApiKey.trim(),
        provider: dbAiProvider
      };

      const response = await fetch('/api/generate-ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI query');
      }

      const result = await response.json();
      setSqlQuery(result.query);
      setShowQuery(true);
      toast.success('AI query generated successfully!', { id: 'ai-query' });
    } catch (error) {
      console.error('Error generating AI query:', error);
      toast.error('Failed to generate AI query', { id: 'ai-query' });
    }
  };

  const handleGenerateQuery = () => {
    if (queryType === 'insert') {
      generateInsertQuery();
    } else {
      generateAIQuery();
    }
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(sqlQuery);
      toast.success('SQL query copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadSQLFile = () => {
    try {
      const blob = new Blob([sqlQuery], { type: 'text/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_query.sql`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('SQL file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading SQL file:', error);
      toast.error('Failed to download SQL file');
    }
  };

  const downloadCSV = () => {
    if (!processedData || processedData.length === 0) {
      toast.error('No data available to download');
      return;
    }

    try {
      const orderedHeaders = localColumnOrder.length > 0 ? localColumnOrder : processedData[0];
      const originalHeaders = processedData[0];
      const rows = processedData.slice(1);

      // Reorder data according to current column order
      const reorderedData = [
        orderedHeaders,
        ...rows.map(row => 
          orderedHeaders.map(header => {
            const originalIndex = originalHeaders.indexOf(header);
            return originalIndex !== -1 ? row[originalIndex] || '' : '';
          })
        )
      ];

      // Convert to CSV
      const csvContent = reorderedData
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_data.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV file');
    }
  };

  const downloadJSON = () => {
    if (!processedData || processedData.length === 0) {
      toast.error('No data available to download');
      return;
    }

    try {
      const orderedHeaders = localColumnOrder.length > 0 ? localColumnOrder : processedData[0];
      const originalHeaders = processedData[0];
      const rows = processedData.slice(1);

      // Convert to JSON format with ordered columns
      const jsonData = rows.map(row => {
        const obj: any = {};
        orderedHeaders.forEach(header => {
          const originalIndex = originalHeaders.indexOf(header);
          obj[header] = originalIndex !== -1 ? row[originalIndex] || '' : '';
        });
        return obj;
      });

      const jsonContent = JSON.stringify(jsonData, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_data.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('JSON file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast.error('Failed to download JSON file');
    }
  };

  return (
    <Card title="Advanced Query Generation">
      {processedData && processedData.length > 0 ? (
        <>  
          {/* Data Table & Preview - Integrated Accordion Alert Box */}
          <div className="mb-4">
            <div className="bg-orange-100 border border-orange-200 rounded-lg overflow-visible relative">
              <div 
                className="p-4 cursor-pointer transition-colors rounded-lg"
                onClick={() => onShowFullTableChange && onShowFullTableChange(!showFullTable)}
              >
                <div className="flex items-center justify-between ">
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-2 px-2 py-1 rounded bg-orange-100 text-orange-600 border border-orange-400">CSV</span>
                    <div>
                      <h4 className="text-sm font-medium text-orange-800">processed_data.csv</h4>
                      <p className="text-xs text-orange-600">{tableData.length} rows × {columns.length} columns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowFullTableChange && onShowFullTableChange(!showFullTable);
                      }}
                      className="text-sm px-2 py-1 border border-orange-300 rounded hover:bg-orange-100 transition-colors text-orange-700"
                    >
                      {showFullTable ? 'Hide Table' : 'View Table'}
                    </button>
                    <Dropdown
                      isOpen={showDownloadDropdown}
                      onClose={() => setShowDownloadDropdown(false)}
                      trigger={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDownloadDropdown(!showDownloadDropdown);
                          }}
                          className="text-sm px-2 py-1 border border-orange-300 rounded hover:bg-orange-100 transition-colors text-orange-700 flex items-center"
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
                            downloadCSV();
                            setShowDownloadDropdown(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            downloadJSON();
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
              {showFullTable && (
                <div className="border-t border-orange-200 p-4 bg-orange-50 rounded-b-lg">
                  <DataTable
                    data={tableData}
                    columns={columns}
                    columnOrder={localColumnOrder}
                    onColumnOrderChange={handleColumnOrderChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Table Name Input */}
          <div className="mb-4">
            <label htmlFor="table-name" className="block text-sm font-medium text-gray-700 mb-2">
              Table Name:
            </label>
            <input
              type="text"
              id="table-name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tableName}
              onChange={(e) => onTableNameChange(e.target.value)}
              placeholder="Enter table name (e.g., customers)"
            />
          </div>

          {/* Query Type Selector */}
          <QueryTypeSelector
            queryType={queryType}
            onQueryTypeChange={onQueryTypeChange}
          />

          {/* AI Query Configuration */}
          {queryType === 'ai' && (
            <>
              <PromptEditor 
                prompt={aiPrompt}
                onPromptChange={onAiPromptChange}
                label="AI Prompt:"
                placeholder={`Describe what kind of SQL query you want to generate. For example:\n
                                • Create a table with proper data types and constraints
                                • Update existing records based on certain conditions
                                • Merge this table with an existing one
                                • Generate stored procedures for data manipulation`}
                height="144px"
                customPlaceholder={true}
              />

              {/* AI Configuration Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">ℹ️</span>
                    <h4 className="font-semibold text-blue-800">AI Configuration</h4>
                  </div>
                </div>
                <p className="text-blue-700 text-sm mb-2">
                  Using <strong>{dbAiProvider === 'openai' ? 'OpenAI (GPT-4)' : 'Google (Gemini)'}</strong> for query generation.
                </p>
                {!dbApiKey && (
                  <p className="text-red-600 text-sm">
                    ⚠️ No API key configured. Please set your default API key in{' '}
                    <a href="/settings?from=wizard&step=4" className="font-semibold underline hover:text-red-800">
                      Settings
                    </a>{' '}
                    to enable AI query generation.
                  </p>
                )}
                {dbApiKey && (
                  <p className="text-green-600 text-sm">
                    ✅ API key configured and ready for query generation.{' '}
                    <a
                      href="/settings?from=wizard&step=4"
                      className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Change
                    </a>
                  </p>
                )}
              </div>
            </>
          )}

          {/* Generate Query Button */}
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateQuery}
              disabled={!tableName.trim() || (queryType === 'ai' && (!aiPrompt.trim() || !dbApiKey.trim()))}
              className="w-full"
            >
              {queryType === 'insert' ? 'Generate SQL Insert Query' : 'Generate AI Custom Query'}
            </Button>

            {/* SQL Query Display */}
            {showQuery && sqlQuery && (
              <SQLQueryDisplay
                query={sqlQuery}
                onCopy={copyToClipboard}
                onDownload={downloadSQLFile}
              />
            )}
          </div>
        </>
      ) : (
        <p className="mb-4 text-gray-600">
          No processed data available. Please complete the previous steps first.
        </p>
      )}
    </Card>
  );
}
