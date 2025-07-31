'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface DropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    isUploading: boolean;
    onUploadStart: () => void;
    onUploadComplete: (uploadedFiles: File[]) => void;
}

export default function Dropzone({ files, onFilesChange, isUploading, onUploadStart, onUploadComplete }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file only');
            return false;
        }
        
        // Check file size (e.g., max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return false;
        }
        
        return true;
    };

    const uploadFile = async (file: File) => {
        if (!validateFile(file)) {
            return;
        }

        onUploadStart();

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            const updatedFiles = [...files, file];
            onFilesChange(updatedFiles);
            onUploadComplete([file]);
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = 'Failed to upload file. Please try again.';
            toast.error(errorMessage);
            onUploadComplete([]);
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (isUploading) return;

        const droppedFiles = Array.from(event.dataTransfer.files);
        if (droppedFiles.length > 0) {
            uploadFile(droppedFiles[0]);
        }
    }, [files, isUploading, onFilesChange, onUploadStart, onUploadComplete]);

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
        if (selectedFiles.length > 0) {
            uploadFile(selectedFiles[0]);
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
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={isUploading}
                />

                <div className={isUploading ? 'opacity-50' : ''}>
                    <p className="text-gray-600">Drag and drop your PDF file here, or click to browse</p>
                    <p className="text-sm text-gray-400 mt-2">Accepted: PDF file only</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Uploaded File:</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between border rounded p-2 bg-green-50 border-green-200">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="text-green-700">{file.name}</span>
                                </div>
                                <span className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
