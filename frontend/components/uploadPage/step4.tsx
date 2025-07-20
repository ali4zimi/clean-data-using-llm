'use client';

import { useState } from 'react';

interface Step4Props {
    processedData: string[][] | null;
    onComplete: () => void;
}

export default function Step4({ processedData, onComplete }: Step4Props) {
    const [tableName, setTableName] = useState('vocabulary');
    const [sqlQuery, setSqlQuery] = useState('');
    const [showQuery, setShowQuery] = useState(false);
    
    const generateInsertQuery = () => {
        if (!processedData || processedData.length === 0) return;
        
        const headers = processedData[0];
        const rows = processedData.slice(1);
        
        // Create table structure
        const tableStructure = `-- Create table structure\nCREATE TABLE IF NOT EXISTS ${tableName} (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n${headers.map(header => `    ${header.toLowerCase().replace(/\s+/g, '_')} TEXT`).join(',\n')}\n);\n\n`;
        
        // Create insert statements
        const insertStatements = rows.map(row => {
            const values = row.map(cell => `'${cell.replace(/'/g, "''")}'`).join(', ');
            return `INSERT INTO ${tableName} (${headers.map(h => h.toLowerCase().replace(/\s+/g, '_')).join(', ')}) VALUES (${values});`;
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
                            placeholder="Enter table name"
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Data Preview:</h3>
                        <div className="overflow-x-auto max-h-48 overflow-y-auto border border-gray-300 rounded bg-gray-50">
                            <table className="min-w-full text-sm border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        {processedData[0].map((header: string, index: number) => (
                                            <th key={index} className="border border-gray-300 px-3 py-2 text-left font-medium">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.slice(1, 4).map((row: string[], rowIndex: number) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {row.map((cell: string, cellIndex: number) => (
                                                <td key={cellIndex} className="border border-gray-300 px-3 py-2">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Showing first 3 rows of {processedData.length - 1} total entries
                        </p>
                    </div>
                    
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
