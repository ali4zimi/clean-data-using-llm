'use client';

import { useState } from 'react';

interface Step4Props {
    processedData: string[][] | null;
    onComplete: () => void;
}

export default function Step4({ processedData, onComplete }: Step4Props) {
    const [showFullTable, setShowFullTable] = useState(false);
    
    const handleDownloadCsv = () => {
        if (!processedData) return;
        
        // Convert array to CSV string
        const csvContent = processedData.map((row: string[]) => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocabulary_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        onComplete();
    };

    return (
        <div id="step-4-content" className="w-full m-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Display Results</h2>
            
            {processedData && Array.isArray(processedData) && processedData.length > 0 ? (
                <>
                    <p className="mb-4 text-green-600">
                        Your vocabulary data has been processed successfully! 
                        Found {processedData.length - 1} vocabulary entries.
                    </p>
                    
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">
                                {showFullTable ? 'Complete Results:' : 'Preview (first 5 entries):'}
                            </h3>
                            <button
                                onClick={() => setShowFullTable(!showFullTable)}
                                className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                            >
                                {showFullTable ? 'Show Preview' : 'Show All'}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-300 rounded">
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
                                    {(showFullTable ? processedData.slice(1) : processedData.slice(1, 6))
                                        .map((row: string[], rowIndex: number) => (
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
                        {!showFullTable && processedData.length > 6 && (
                            <p className="text-xs text-gray-500 mt-2">
                                Showing 5 of {processedData.length - 1} entries. Click "Show All" to see complete table.
                            </p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <button 
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition-colors"
                            onClick={handleDownloadCsv}
                        >
                            Download CSV
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
