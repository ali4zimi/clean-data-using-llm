"use client";

import React from 'react';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-gray-100 flex justify-center p-4 md:p-8 pt-8 md:pt-8">
      <div className='w-full max-w-2xl h-fit flex flex-col gap-3'>
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <Card className="p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-500">👤</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">User Profile</h2>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🚧</span>
              <h3 className="text-xl font-semibold text-yellow-800">Under Development</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              The profile page is currently under development. We're working hard to bring you 
              features like user management, preferences, and account settings.
            </p>
            <div className="text-sm text-yellow-600">
              <p>Coming soon:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User account management</li>
                <li>Processing history</li>
                <li>Usage statistics</li>
                <li>Export preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </main>
  );
}