'use client';

import { useState } from 'react';
import Dropzone from './dropzone';

interface Step1Props {
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export default function Step1({ file, onFileChange }: Step1Props) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadStart = () => {
        setIsUploading(true);
    };

    const handleUploadComplete = (uploadedFiles: File[]) => {
        setIsUploading(false);
        // Only one file is allowed, so pick the first or null
        if (uploadedFiles.length > 0) {
            onFileChange(uploadedFiles[0]);
        } else {
            onFileChange(null);
        }
    };

    const handleFileChange = (newFiles: File[]) => {
        // Only one file is allowed
        onFileChange(newFiles.length > 0 ? newFiles[0] : null);
    };

    return (
        <div id="content step-1-content" className="w-full m-auto p-4 content-center justify-center bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload PDF File</h2>
            <Dropzone 
                files={file ? [file] : []} 
                onFilesChange={handleFileChange}
                isUploading={isUploading}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}
