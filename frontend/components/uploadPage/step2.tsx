'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Step2Props {
    uploadedFile: File | null;
    textFile: string | null;
    isExtracting: boolean;
    onTextReady: (text: string) => void;
    onExtractionStart: () => void;
    onExtractionComplete: (extractedText: string) => void;
}

export default function Step2({
    uploadedFile,
    textFile,
    isExtracting,
    onTextReady,
    onExtractionStart,
    onExtractionComplete,
}: Step2Props) {
    const [selectedText, setSelectedText] = useState('');
    const [hasStartedExtraction, setHasStartedExtraction] = useState(false);
    const [showTextView, setShowTextView] = useState(false);
    const [textFileUrl, setTextFileUrl] = useState('');

    useEffect(() => {
        if (textFile) {
            setHasStartedExtraction(true);
        }
    }, [textFile]);

    const handleTextExtraction = async () => {
        if (uploadedFile) {
            setHasStartedExtraction(true);
            onExtractionStart();

            try {
                // First, get the uploaded file URL from the backend
                const fileUrlResponse = await fetch('/api/upload-file', {
                    method: 'GET',
                });

                if (!fileUrlResponse.ok) {
                    throw new Error('Failed to get file URL');
                }

                const fileUrlResult = await fileUrlResponse.json();
                const fileUrl = fileUrlResult.file_url;

                if (!fileUrl) {
                    throw new Error('File URL not found');
                }

                // Then, extract text using the file URL
                const response = await fetch('/api/extract-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileUrl: fileUrl,
                    }),
                });

                if (!response.ok) {
                    throw new Error('PDF extraction failed');
                }

                const result = await response.json();

                // Store both the text and file URL if available
                if (result.file_url) {
                    setTextFileUrl(result.file_url);
                }

                // Automatically call onTextReady when extraction completes
                const extractedText = result.text || "";
                onTextReady(extractedText);
                onExtractionComplete(extractedText);
                toast.success('Text extracted successfully!');
            } catch (error) {
                console.error('PDF extraction error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from PDF';
                toast.error(errorMessage);
                onExtractionComplete("");
            }
        }
    };

    const handleViewText = async (extractedText: string) => {
        try {
            setSelectedText(extractedText);
            setShowTextView(true);
            onTextReady(extractedText);
        } catch (error) {
            console.error('Error loading text:', error);
            toast.error('Failed to load text content');
        }
    };

    const handleDownloadPdf = () => {
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = uploadedFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleDownloadText = () => {
        if (textFile) {
            const blob = new Blob([textFile], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${uploadedFile?.name.replace('.pdf', '') || 'extracted'}_text.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div id="text-extraction" className="w-full m-auto p-4 content-center justify-center bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Text Extraction</h2>

            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded File:</h3>
                <div className="space-y-2">
                    {/* PDF File */}
                    {uploadedFile && (
                        <div className="flex items-center justify-between border rounded p-2 bg-blue-50 border-blue-200">
                            <div className="flex items-center">
                                <span className="text-blue-600 text-xs font-medium mr-2 px-2 py-1 bg-blue-100 rounded">PDF</span>
                                <span className="text-blue-700">{uploadedFile.name}</span>
                                <span className="text-xs text-gray-400 ml-2">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                                onClick={handleTextExtraction}
                                disabled={isExtracting}
                                className={`text-sm px-2 py-1 border rounded transition-colors ${
                                    isExtracting 
                                        ? 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                        : 'text-blue-500 hover:text-blue-700 border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                {isExtracting ? 'Extracting...' : 'Extract Text'}
                            </button>
                        </div>
                    )}

                    {!uploadedFile && (
                        <p className="text-gray-500 text-sm">No files available</p>
                    )}
                </div>
            </div>

            {/* Progress Bar and Status */}
            {uploadedFile && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Extraction Progress</span>
                        <span className="text-xs text-gray-500">
                            {!hasStartedExtraction ? '0%' : isExtracting ? 'Processing...' : textFile ? '100%' : 'Failed'}
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                !hasStartedExtraction ? 'w-0 bg-gray-300' :
                                isExtracting ? 'w-1/2 bg-blue-500' :
                                textFile ? 'w-full bg-green-500' : 'w-full bg-red-500'
                            }`}
                        ></div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="text-sm">
                        {!hasStartedExtraction ? (
                            <p className="text-gray-600">Click "Extract Text" to start processing your PDF</p>
                        ) : isExtracting ? (
                            <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                <span>Extracting text from PDF...</span>
                            </div>
                        ) : textFile ? (
                            <p className="text-green-600">✓ Text extraction completed successfully!</p>
                        ) : (
                            <p className="text-red-600">✗ Text extraction failed. Please try again.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Text File:</h3>
                {textFile && textFile.length > 0 ? (
                    <div className="flex items-center justify-between border rounded p-2 bg-green-50 border-green-200">
                        <div className="flex items-center">
                            <span className="text-green-600 text-xs font-medium mr-2 px-2 py-1 bg-green-100 rounded">TXT</span>
                            <span className="text-green-700">extracted_text.txt</span>
                            <span className="text-xs text-gray-400 ml-2">({textFile.length} characters)</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleViewText(textFile)}
                                className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                            >
                                View
                            </button>
                            <button
                                onClick={handleDownloadText}
                                className="text-green-500 hover:text-green-700 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="border rounded p-3 bg-gray-50 border-gray-200 ">
                        <p className="text-gray-500 text-sm">
                            {!uploadedFile ? 'No PDF file uploaded' : 
                             !hasStartedExtraction ? 'Click "Extract Text" to generate text file' :
                             isExtracting ? 'Extracting text...' :
                             'No text file available'}
                        </p>
                    </div>
                )}
            </div>


            {showTextView && selectedText && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Extracted Text Content:</h3>
                        <button
                            onClick={() => setShowTextView(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Hide
                        </button>
                    </div>
                    <textarea
                        value={selectedText}
                        className="w-full h-60 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 resize-none focus:outline-none"
                        placeholder="Extracted text will appear here..."
                        onChange={(e) => {
                            setSelectedText(e.target.value);
                            onTextReady(e.target.value);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
