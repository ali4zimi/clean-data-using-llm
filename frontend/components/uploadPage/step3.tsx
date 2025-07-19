'use client';

import { useState, useEffect } from 'react';

interface Step3Props {
    extractedText: string;
    prompt: string;
    aiProvider: string;
    onPromptChange: (prompt: string) => void;
    onAiProviderChange: (provider: string) => void;
    isProcessing: boolean;
    onProcessingStart: () => void;
    onProcessingComplete: (data: any) => void;
    cleanedData?: string;
}

export default function Step3({ extractedText, prompt, aiProvider, onPromptChange, onAiProviderChange, isProcessing, onProcessingStart, onProcessingComplete, cleanedData }: Step3Props) {
    const [processingMessage, setProcessingMessage] = useState('');
    const [showTextView, setShowTextView] = useState(false);
    const [editableText, setEditableText] = useState(extractedText);
    const [apiKey, setApiKey] = useState('');
    const [showFullTable, setShowFullTable] = useState(false);

    useEffect(() => {
        setEditableText(extractedText);
    }, [extractedText]);

    // Function to parse CSV data
    const parseCSV = (csvText: string) => {
        if (!csvText) return { headers: [], rows: [] };
        
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return { headers: [], rows: [] };
        
        // Parse headers from first line
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // Parse data rows
        const rows = lines.slice(1).map(line => {
            return line.split(',').map(cell => cell.trim().replace(/"/g, ''));
        });
        
        return { headers, rows };
    };

    const csvData = cleanedData ? parseCSV(cleanedData) : { headers: [], rows: [] };

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
            
            
            onProcessingComplete(data.cleaned_data);
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
            {cleanedData && csvData.headers.length > 0 && (
                <div className="mt-6">
                    <p className="mb-4 text-green-600">
                        Data processing completed successfully! Found {csvData.rows.length} entries.
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
                                        {csvData.headers.map((header, index) => (
                                            <th key={index} className="border border-gray-300 px-3 py-2 text-left font-medium">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showFullTable ? csvData.rows : csvData.rows.slice(0, 5))
                                        .map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="border border-gray-300 px-3 py-2">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!showFullTable && csvData.rows.length > 5 && (
                            <p className="text-xs text-gray-500 mt-2">
                                Showing 5 of {csvData.rows.length} entries. Click "Show All" to see complete table.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
