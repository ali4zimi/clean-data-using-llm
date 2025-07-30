'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    ColumnOrderState,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';

interface Step4Props {
    processedData: string[][] | null;
    columnOrder: string[];
    onComplete: () => void;
    onColumnOrderChange?: (newOrder: string[]) => void; // Add callback for column order changes
    showFullTable?: boolean; // Add shared table expansion state
    onShowFullTableChange?: (show: boolean) => void; // Add callback for table expansion changes
}

export default function Step4({ processedData, columnOrder, onComplete, onColumnOrderChange, showFullTable: propShowFullTable, onShowFullTableChange }: Step4Props) {
    const [tableName, setTableName] = useState('');
    const [sqlQuery, setSqlQuery] = useState('');
    const [showQuery, setShowQuery] = useState(false);
    const [localColumnOrder, setLocalColumnOrder] = useState<ColumnOrderState>(columnOrder || []);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
    const downloadDropdownRef = useRef<HTMLDivElement>(null);

    // Use shared showFullTable state from parent, with fallback to local state
    const showFullTable = propShowFullTable ?? false;

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

    // Initialize and sync local column order with prop changes
    useEffect(() => {
        if (processedData && processedData.length > 0) {
            const headers = processedData[0];
            if (columnOrder && columnOrder.length > 0) {
                setLocalColumnOrder(columnOrder);
            } else {
                setLocalColumnOrder(headers);
            }
        }
    }, [processedData, columnOrder]);

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

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            columnOrder: localColumnOrder,
            columnVisibility,
            sorting,
        },
        onColumnOrderChange: (updaterOrValue) => {
            const newOrder = typeof updaterOrValue === 'function' 
                ? updaterOrValue(localColumnOrder) 
                : updaterOrValue;
            
            setLocalColumnOrder(newOrder);
            
            // Notify parent about column order change
            if (onColumnOrderChange) {
                onColumnOrderChange(newOrder);
            }
        },
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    
    const generateInsertQuery = () => {
        if (!processedData || processedData.length === 0) return;
        
        // Use the current column order (either from Step3 or local reordering)
        const orderedHeaders = localColumnOrder.length > 0 ? localColumnOrder : processedData[0];
        const rows = processedData.slice(1);
        
        // Create table structure using ordered headers
        const tableStructure = `-- Create table structure\nCREATE TABLE IF NOT EXISTS ${tableName} (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n${orderedHeaders.map(header => `    ${header.toLowerCase().replace(/\s+/g, '_')} TEXT`).join(',\n')}\n);\n\n`;
        
        // Create insert statements using ordered headers
        const insertStatements = rows.map(row => {
            // Map the row data according to the ordered headers
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
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sqlQuery);
        alert('SQL query copied to clipboard!');
    };

    const downloadSQLFile = () => {
        const blob = new Blob([sqlQuery], { type: 'text/sql' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName}_insert.sql`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        if (!processedData || processedData.length === 0) return;

        // Use the current column order for CSV export
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
    };

    const downloadJSON = () => {
        if (!processedData || processedData.length === 0) return;

        // Use the current column order for JSON export
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
    };

    return (
        <div id="step-4-content" className="w-full m-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Database Integration</h2>
            
            {processedData && Array.isArray(processedData) && processedData.length > 0 ? (
                <>
                    <p className="mb-4 text-green-600">
                        Generate SQL queries to insert your processed data into a database.
                    </p>
                    
                    <div className="mb-4">
                        <label htmlFor="table-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Table Name:
                        </label>
                        <input
                            type="text"
                            id="table-name"
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="Enter table name (e.g., customers)"
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Data Preview:</h3>
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
                                                            const draggedIndex = localColumnOrder.indexOf(draggedColumnId);
                                                            const targetIndex = localColumnOrder.indexOf(targetColumnId);
                                                            
                                                            if (draggedIndex !== -1 && targetIndex !== -1) {
                                                                const newOrder = [...localColumnOrder];
                                                                const [movedColumn] = newOrder.splice(draggedIndex, 1);
                                                                newOrder.splice(targetIndex, 0, movedColumn);
                                                                
                                                                // Use TanStack's column order change handler
                                                                table.setColumnOrder(newOrder);
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
                        <p className="text-xs text-gray-500 mt-1">
                            Showing all {tableData.length} entries. Column order affects SQL generation.
                        </p>
                    </div>
                    )}
                    
                    <div className="space-y-3">
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            onClick={generateInsertQuery}
                            disabled={!tableName.trim()}
                        >
                            Generate SQL Insert Query
                        </button>

                        {showQuery && sqlQuery && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">Generated SQL Query:</h3>
                                    <div className="space-x-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                                        >
                                            Copy to Clipboard
                                        </button>
                                        <button
                                            onClick={downloadSQLFile}
                                            className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                                        >
                                            Download SQL File
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={sqlQuery}
                                    readOnly
                                    className="w-full h-64 p-3 bg-gray-50 border border-gray-300 rounded text-sm font-mono text-gray-700 resize-none"
                                />
                            </div>
                        )}

                        <button 
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                            onClick={onComplete}
                        >
                            Complete Process
                        </button>
                    </div>
                </>
            ) : (
                <p className="mb-4 text-gray-600">
                    No processed data available. Please complete the previous steps first.
                </p>
            )}
        </div>
    );
}
