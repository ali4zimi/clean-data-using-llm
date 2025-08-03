'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import FileDisplay from '../../ui/FileDisplay';
import EditableTextAccordion from '../../ui/EditableTextAccordion';
import { useNotify } from '../../../hooks/useNotify';
import toast from 'react-hot-toast';

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentText, setCurrentText] = useState(extractedText || '');
  
  const notify = useNotify();

  // Sync with extractedText prop changes
  useEffect(() => {
    setCurrentText(extractedText || '');
    setHasUnsavedChanges(false);
  }, [extractedText]);

  const handleTextExtraction = async () => {
    if (!uploadedFile) return;

    setHasStartedExtraction(true);
    onExtractionStart();

    // Create a progress toast
    const toastId = toast.loading(
      <div className="flex flex-col space-y-2">
        <div className="font-medium">Extracting Text from PDF</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: '10%' }}
          ></div>
        </div>
        <div className="text-sm text-gray-600">Starting extraction...</div>
      </div>,
      {
        duration: Infinity, // Keep toast open until we dismiss it
      }
    );

    try {
      // Update progress: Getting file URL
      toast.loading(
        <div className="flex flex-col space-y-2">
          <div className="font-medium">Extracting Text from PDF</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: '30%' }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">Getting file URL...</div>
        </div>,
        { id: toastId }
      );

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

      // Update progress: Processing PDF
      toast.loading(
        <div className="flex flex-col space-y-2">
          <div className="font-medium">Extracting Text from PDF</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: '70%' }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">Processing PDF content...</div>
        </div>,
        { id: toastId }
      );

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
      
      // Update progress: Finalizing
      toast.loading(
        <div className="flex flex-col space-y-2">
          <div className="font-medium">Extracting Text from PDF</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">Finalizing extraction...</div>
        </div>,
        { id: toastId }
      );

      onExtractionComplete(text);
      
      // Show success notification and dismiss loading toast
      toast.dismiss(toastId);
      
      // Add to notification center (this will also show a toast automatically)
      notify.success('Text Extraction Complete', `Successfully extracted ${text.split(' ').length} words from PDF`);
    } catch (error) {
      console.error('PDF extraction error:', error);
      onExtractionComplete("");
      
      // Show error notification and dismiss loading toast
      toast.dismiss(toastId);
      
      // Add to notification center (this will also show a toast automatically)
      notify.error('Text Extraction Failed', 'Failed to extract text from PDF. Please try again.');
      
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

  const handleSaveChanges = (newText: string) => {
    onTextChange(newText);
    setHasUnsavedChanges(false);
    setCurrentText(newText);
  };

  const handleDiscardChanges = () => {
    setCurrentText(extractedText || '');
    setHasUnsavedChanges(false);
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

      {/* Text File & Editor - Integrated Accordion Alert Box */}
      <EditableTextAccordion
        title="Text File"
        filename="extracted_text.txt"
        text={extractedText || ''}
        currentText={currentText}
        showEditor={showTextView}
        hasUnsavedChanges={hasUnsavedChanges}
        placeholder="Extracted text will appear here..."
        onToggleEditor={() => setShowTextView(!showTextView)}
        onTextChange={(newText) => {
          setCurrentText(newText);
          setHasUnsavedChanges(newText !== (extractedText || ''));
        }}
        onSave={() => handleSaveChanges(currentText)}
        onDiscard={handleDiscardChanges}
        emptyStateMessage={
          !uploadedFile ? 'No PDF file uploaded' : 
          !hasStartedExtraction ? 'Click "Extract Text" to generate text file' :
          isExtracting ? 'Extracting text...' :
          'No text file available'
        }
      />
    </Card>
  );
}
