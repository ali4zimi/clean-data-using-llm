"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  const handleStartExtraction = () => {
    router.push('/ai-data-wizard');
  };

  const handleViewDocs = () => {
    router.push('/docs');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Data Cleaning Pipeline</h1>
      <p className="mt-4 text-lg mb-8 text-center max-w-2xl">
        Transform your raw data into clean, structured information using AI-powered extraction and processing tools.
      </p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleStartExtraction}
          className="min-w-48"
        >
          Start Data Extraction
        </Button>
        
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={handleViewDocs}
          className="min-w-48"
        >
          View Documentation
        </Button>
      </div>
    </main>
  );
}
