'use client';

import React from 'react';
import Card from '../../ui/Card';
import FileDropzone from './FileDropzone';
import FileDisplay from '../../ui/FileDisplay';

interface FileUploadStepProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadComplete: (file: File) => void;
}

export default function FileUploadStep({ 
  file, 
  onFileChange, 
  isUploading, 
  onUploadStart, 
  onUploadComplete 
}: FileUploadStepProps) {
  const handleFileUpload = async (uploadedFile: File) => {
    onUploadStart();

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      onFileChange(uploadedFile);
      onUploadComplete(uploadedFile);
    } catch (error) {
      console.error('Upload error:', error);
      onFileChange(null);
      throw error; // Let the parent handle the error
    }
  };

  return (
    <Card title="Upload PDF File">
      <FileDropzone 
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />
      
      {file && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded File:</h3>
          <FileDisplay
            name={file.name}
            size={file.size}
            type="PDF"
            status={isUploading ? 'uploading' : 'complete'}
          />
        </div>
      )}
    </Card>
  );
}
