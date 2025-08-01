'use client';

import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import FileDisplay from '../../ui/FileDisplay';

interface TextExtractionStepProps {
  uploadedFile: File | null;
  extractedText: string | null;
  isExtracting: boolean;
  onExtractionStart: () => void;
  onExtractionComplete: (text: string) => void;
  onTextChange: (text: string) => void;
}

export default function TextExtractionStep({
  uploadedFile,
  extractedText,
  isExtracting,
  onExtractionStart,
  onExtractionComplete,
  onTextChange
}: TextExtractionStepProps) {
  const [showTextView, setShowTextView] = useState(false);
  const [hasStartedExtraction, setHasStartedExtraction] = useState(false);

  const handleTextExtraction = async () => {
    if (!uploadedFile) return;

    setHasStartedExtraction(true);
    onExtractionStart();

    try {
      // Get the uploaded file URL from the backend
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

      // Extract text using the file URL
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
      const text = result.text || "";
      
      onExtractionComplete(text);
    } catch (error) {
      console.error('PDF extraction error:', error);
      onExtractionComplete("");
      throw error; // Let parent handle the error
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
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
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

  const getProgressStatus = () => {
    if (!hasStartedExtraction) return 'idle';
    if (isExtracting) return 'processing';
    if (extractedText) return 'complete';
    return 'error';
  };

  const getProgressValue = () => {
    if (!hasStartedExtraction) return 0;
    if (isExtracting) return 50;
    if (extractedText) return 100;
    return 100; // Show full bar for error state
  };

  return (
    <Card title="Text Extraction">
      {/* Uploaded File Display */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded File:</h3>
        {uploadedFile ? (
          <FileDisplay
            name={uploadedFile.name}
            size={uploadedFile.size}
            type="PDF"
            onAction={handleTextExtraction}
            actionLabel="Extract Text"
            status={isExtracting ? 'uploading' : 'complete'}
          />
        ) : (
          <p className="text-gray-500 text-sm">No files available</p>
        )}
      </div>

      {/* Progress Bar */}
      {uploadedFile && (
        <ProgressBar
          progress={getProgressValue()}
          status={getProgressStatus()}
          label="Extraction Progress"
        />
      )}

      {/* Extracted Text Display */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Text File:</h3>
        {extractedText && extractedText.length > 0 ? (
          <FileDisplay
            name="extracted_text.txt"
            size={extractedText.length}
            type="TXT"
            onView={() => setShowTextView(true)}
            onDownload={handleDownloadText}
          />
        ) : (
          <div className="border rounded p-3 bg-gray-50 border-gray-200">
            <p className="text-gray-500 text-sm">
              {!uploadedFile ? 'No PDF file uploaded' : 
               !hasStartedExtraction ? 'Click "Extract Text" to generate text file' :
               isExtracting ? 'Extracting text...' :
               'No text file available'}
            </p>
          </div>
        )}
      </div>

      {/* Text Editor */}
      {showTextView && extractedText && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Extracted Text Content:</h3>
            <Button
              onClick={() => setShowTextView(false)}
              variant="secondary"
              size="sm"
            >
              Hide
            </Button>
          </div>
          <textarea
            value={extractedText}
            className="w-full h-60 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 resize-none focus:outline-none"
            placeholder="Extracted text will appear here..."
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
      )}
    </Card>
  );
}
