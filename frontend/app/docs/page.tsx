"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function DocsPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <h1 className="text-4xl font-bold mb-6">Documentation</h1>
      <p className="mt-4 text-lg mb-8 text-center max-w-2xl">
        Welcome to the DataCleanAI documentation. Here you will find guides and references to help you use our AI-powered data processing pipeline effectively.
      </p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleBackToHome}
          className="min-w-48"
        >
          Back to Home
        </Button>
      </div>
    </main>
  );
}