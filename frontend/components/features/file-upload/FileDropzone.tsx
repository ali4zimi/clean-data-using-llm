'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface FileDropzoneProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

export default function FileDropzone({ 
  onFileUpload, 
  isUploading, 
  acceptedTypes = '.pdf',
  maxSize = 10 
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return false;
    }
    
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0 && validateFile(droppedFiles[0])) {
      onFileUpload(droppedFiles[0]);
    }
  }, [isUploading, onFileUpload, maxSize]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;

    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    if (selectedFiles.length > 0 && validateFile(selectedFiles[0])) {
      onFileUpload(selectedFiles[0]);
    }
  };

  return (
    <div className="mx-auto">
      <div
        className={`relative border-2 border-dashed p-10 rounded-lg text-center transition-colors cursor-pointer ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'
        } ${isUploading ? 'cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white mt-2 font-medium">Uploading...</p>
            </div>
          </div>
        )}

        <input
          id="fileInput"
          type="file"
          accept={acceptedTypes}
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <div className={isUploading ? 'opacity-50' : ''}>
          <p className="text-gray-600">Drag and drop your PDF file here, or click to browse</p>
          <p className="text-sm text-gray-400 mt-2">Accepted: PDF file only (max {maxSize}MB)</p>
        </div>
      </div>
    </div>
  );
}
