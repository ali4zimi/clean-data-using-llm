'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
    ColumnOrderState,
} from '@tanstack/react-table';

interface Step3Props {
    extractedText: string;
    prompt: string;
    aiProvider: string;
    onPromptChange: (prompt: string) => void;
    onAiProviderChange: (provider: string) => void;
    isProcessing: boolean;
    onProcessingStart: () => void;
    onProcessingComplete: (data: any, columnOrder?: string[]) => void;
    cleanedData?: any[] | null; // Allow null as well
    columnOrder?: string[]; // Add column order prop
    onColumnOrderChange?: (newOrder: string[]) => void; // Add callback for column order changes
    showFullTable?: boolean; // Add shared table expansion state
    onShowFullTableChange?: (show: boolean) => void; // Add callback for table expansion changes
}

export default function Step3({ extractedText, prompt, aiProvider, onPromptChange, onAiProviderChange, isProcessing, onProcessingStart, onProcessingComplete, cleanedData, columnOrder: propColumnOrder, onColumnOrderChange, showFullTable: propShowFullTable, onShowFullTableChange }: Step3Props) {
    const [processingMessage, setProcessingMessage] = useState('');
    const [showTextView, setShowTextView] = useState(false);
    const [editableText, setEditableText] = useState(extractedText);
    const [apiKey, setApiKey] = useState('');
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
    const downloadDropdownRef = useRef<HTMLDivElement>(null);

    // Use shared showFullTable state from parent, with fallback to local state
    const showFullTable = propShowFullTable ?? false;

    useEffect(() => {
        setEditableText(extractedText);
    }, [extractedText]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
                setShowDownloadDropdown(false);
            }
        }

        if (showDownloadDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDownloadDropdown]);

    // Sync column order from parent (when coming from Step4 or when parent order changes)
    useEffect(() => {
        if (propColumnOrder && propColumnOrder.length > 0) {
            // Always sync with parent's column order when it changes
            // This ensures that changes from Step 4 are reflected in Step 3
            if (JSON.stringify(propColumnOrder) !== JSON.stringify(columnOrder)) {
                setColumnOrder(propColumnOrder);
            }
        }
    }, [propColumnOrder, columnOrder]);

    // Prepare data for TanStack Table
    const tableData = useMemo(() => {
        if (!cleanedData || !Array.isArray(cleanedData) || cleanedData.length === 0) {
            return [];
        }
        return cleanedData;
    }, [cleanedData]);

    // Create columns based on data
    const columns = useMemo<ColumnDef<any>[]>(() => {
        if (!cleanedData || !Array.isArray(cleanedData) || cleanedData.length === 0) {
            return [];
        }

        const allKeys = Object.keys(cleanedData[0]);
        
        return allKeys.map((key) => ({
            id: key,
            accessorKey: key,
            header: key,
            cell: ({ getValue }) => getValue() || '',
        }));
    }, [cleanedData]);

    // Initialize column order when data changes
    useEffect(() => {
        if (cleanedData && Array.isArray(cleanedData) && cleanedData.length > 0) {
            const keys = Object.keys(cleanedData[0]);
            // Only set column order if we don't have one yet, or if parent provided one
            if (columnOrder.length === 0 && (!propColumnOrder || propColumnOrder.length === 0)) {
                setColumnOrder(keys);
            }
        }
    }, [cleanedData, columnOrder.length, propColumnOrder]);

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            columnOrder,
        },
        onColumnOrderChange: (updaterOrValue) => {
            const newOrder = typeof updaterOrValue === 'function' 
                ? updaterOrValue(columnOrder) 
                : updaterOrValue;
            
            setColumnOrder(newOrder);
            
            // Notify parent about column order change
            if (onColumnOrderChange) {
                onColumnOrderChange(newOrder);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handleDownloadCsv = () => {
        if (!cleanedData || !Array.isArray(cleanedData)) return;
        
        // Convert JSON to CSV format
        if (cleanedData.length === 0) return;
        
        // Use the current column order
        const headers = columnOrder.length > 0 ? columnOrder : Object.keys(cleanedData[0]);
        const csvContent = [
            headers.join(','), // Header row
            ...cleanedData.map(item => 
                headers.map(header => {
                    const value = item[header] || '';
                    // Escape commas and quotes in CSV
                    return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                        ? `"${value.replace(/"/g, '""')}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadJson = () => {
        if (!cleanedData || !Array.isArray(cleanedData)) return;
        
        // Reorder JSON data according to current column order
        const orderedData = cleanedData.map(item => {
            const orderedItem: any = {};
            const headers = columnOrder.length > 0 ? columnOrder : Object.keys(item);
            headers.forEach(header => {
                orderedItem[header] = item[header] || '';
            });
            return orderedItem;
        });
        
        const jsonContent = JSON.stringify(orderedData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_data.json';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleProcess = async () => {
        if (!editableText) {
            setProcessingMessage('No text to process. Please complete text extraction first.');
            return;
        }

        if (!prompt.trim()) {
            setProcessingMessage('Please enter a prompt for AI processing.');
            return;
        }

        if (!apiKey.trim()) {
            setProcessingMessage('Please enter your API key.');
            return;
        }

        onProcessingStart();
        setProcessingMessage('Processing text with AI...');
        
        try {
            const response = await fetch('/api/clean-with-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    extracted_text: editableText,
                    user_prompt: prompt,
                    ai_provider: aiProvider,
                    user_api_key: apiKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process text');
            }

            const data = await response.json();
            
            
            onProcessingComplete(data.cleaned_data, columnOrder.length > 0 ? columnOrder : undefined);
            setProcessingMessage('Processing completed successfully!');
        } catch (error) {
            setProcessingMessage(`Error during processing: ${error instanceof Error ? error.message : 'Unknown error'}`);
            onProcessingComplete(null);
        }
    };

    const canProcess = editableText.length > 0 && prompt.trim().length > 0 && apiKey.trim().length > 0;

    return (
        <div id="step-3-content" className="w-full m-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Data Cleaning with AI</h2>

            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Text:</h3>
                {editableText ? (
                    <div className="flex items-center justify-between border rounded p-2 bg-green-50 border-green-200">
                        <div className="flex items-center">
                            <span className="text-green-600 text-xs font-medium mr-2 px-2 py-1 bg-green-100 rounded">TXT</span>
                            <span className="text-green-700">extracted_text.txt</span>
                            <span className="text-xs text-gray-400 ml-2">({editableText.length} characters)</span>
                        </div>
                        <button
                            onClick={() => setShowTextView(!showTextView)}
                            className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                        >
                            {showTextView ? 'Hide' : 'View/Edit'}
                        </button>
                    </div>
                ) : (
                    <div className="border rounded p-3 bg-gray-50 border-gray-200">
                        <p className="text-gray-500 text-sm">No text extracted yet</p>
                    </div>
                )}
            </div>

            {showTextView && editableText && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Edit Extracted Text:</h3>
                        <button
                            onClick={() => setShowTextView(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Hide
                        </button>
                    </div>
                    <textarea
                        value={editableText}
                        className="w-full h-60 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 resize-none focus:outline-none"
                        placeholder="Extracted text will appear here..."
                        onChange={(e) => setEditableText(e.target.value)}
                    />
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    AI Processing Prompt:
                </label>
                <textarea 
                    id="prompt" 
                    className="w-full h-32 p-2 border rounded mb-4" 
                    value={prompt} 
                    placeholder="Enter your prompt here..." 
                    style={{ height: '200px' }} 
                    onChange={(e) => onPromptChange(e.target.value)}
                />
            </div>
             
            <div className="mb-4">
                <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-2">
                    Select AI Provider:
                </label>
                <select
                    id="ai-provider"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={aiProvider}
                    onChange={(e) => onAiProviderChange(e.target.value)}
                >
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-2">
                    API Key:
                </label>
                <input
                    type="text"
                    id="api-key"
                    placeholder='Enter your API key here'
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>

            <p className="mb-4 text-gray-600">
                {canProcess 
                    ? "Ready to process the extracted text with AI."
                    : "Please complete text extraction, enter a prompt, and provide your API key first."
                }
            </p>
            
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                onClick={handleProcess}
                disabled={isProcessing || !canProcess}
            >
                {isProcessing ? 'Processing...' : 'Start AI Processing'}
            </button>

            {processingMessage && (
                <p className={`mt-2 ${processingMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {processingMessage}
                </p>
            )}

            {/* Display cleaned data table */}
            {cleanedData && Array.isArray(cleanedData) && cleanedData.length > 0 && (
                <div className="mt-6">
                    <p className="mb-4 text-green-600">
                        Data processing completed successfully! Found {tableData.length} entries.
                    </p>
                    
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Processed Data:</h3>
                        <div className="flex items-center justify-between border rounded p-2 bg-green-50 border-green-200">
                            <div className="flex items-center">
                                <span className="text-green-600 text-xs font-medium mr-2 px-2 py-1 bg-green-100 rounded">JSON</span>
                                <span className="text-green-700">processed_data.json</span>
                                <span className="text-xs text-gray-400 ml-2">({tableData.length} entries)</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onShowFullTableChange && onShowFullTableChange(!showFullTable)}
                                    className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                                >
                                    {showFullTable ? 'Hide Table' : 'View Table'}
                                </button>
                                <div className="relative" ref={downloadDropdownRef}>
                                    <button 
                                        className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors flex items-center"
                                        onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                                    >
                                        Download
                                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {showDownloadDropdown && (
                                        <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-300 z-10">
                                            <button
                                                onClick={() => {
                                                    handleDownloadCsv();
                                                    setShowDownloadDropdown(false);
                                                }}
                                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                                            >
                                                CSV
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDownloadJson();
                                                    setShowDownloadDropdown(false);
                                                }}
                                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                                            >
                                                JSON
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {showFullTable && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">
                                💡 Drag the ⋮⋮ handles to reorder columns. Click column names to sort data.
                            </p>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-300 rounded">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-gray-100 sticky top-0">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th 
                                                        key={header.id} 
                                                        className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200 select-none"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        draggable={true}
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.setData('text/plain', header.column.id);
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                        }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            const draggedColumnId = e.dataTransfer.getData('text/plain');
                                                            const targetColumnId = header.column.id;
                                                            
                                                            if (draggedColumnId !== targetColumnId) {
                                                                const draggedIndex = columnOrder.indexOf(draggedColumnId);
                                                                const targetIndex = columnOrder.indexOf(targetColumnId);
                                                                
                                                                if (draggedIndex !== -1 && targetIndex !== -1) {
                                                                    const newOrder = [...columnOrder];
                                                                    const [movedColumn] = newOrder.splice(draggedIndex, 1);
                                                                    newOrder.splice(targetIndex, 0, movedColumn);
                                                                    setColumnOrder(newOrder);
                                                                    
                                                                    // Notify parent about column order change
                                                                    if (onColumnOrderChange) {
                                                                        onColumnOrderChange(newOrder);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        style={{ 
                                                            userSelect: 'none',
                                                            cursor: 'grab'
                                                        }}
                                                        onMouseDown={(e) => {
                                                            (e.target as HTMLElement).style.cursor = 'grabbing';
                                                        }}
                                                        onMouseUp={(e) => {
                                                            (e.target as HTMLElement).style.cursor = 'grab';
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center">
                                                                <span className="mr-2" style={{ cursor: 'grab' }} title="Drag to reorder columns">⋮⋮</span>
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                            </span>
                                                            <span className="ml-1">
                                                                {{
                                                                    asc: '↑',
                                                                    desc: '↓',
                                                                }[header.column.getIsSorted() as string] ?? '↕'}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {table.getRowModel().rows.map((row, index) => (
                                            <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="border border-gray-300 px-3 py-2">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

