'use client';

import React from 'react';
import { useNotify } from '@/hooks/useNotify';
import { useNotifications } from '@/contexts/NotificationContext';
import Button from '@/components/ui/Button';

export default function NotificationTestPage() {
  const notify = useNotify();
  const { notifications, clearAllNotifications } = useNotifications();

  const testNotifications = () => {
    notify.success('File Processing', 'Your data has been successfully processed and is ready for download.');
    
    setTimeout(() => {
      notify.error('Connection Error', 'Failed to connect to the AI service. Please check your API key and try again.');
    }, 1000);
    
    setTimeout(() => {
      notify.warning('API Limit Warning', 'You are approaching your monthly API usage limit (85% used).');
    }, 2000);
    
    setTimeout(() => {
      notify.info('System Update', 'New AI processing capabilities are now available. Check out the updated templates!');
    }, 3000);
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-gray-100 flex justify-center p-4 md:p-8 pt-8 md:pt-8">
      <div className='w-full max-w-2xl h-fit flex flex-col gap-6'>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Notification System Test</h1>
          <p className="text-gray-600 mb-6">
            Test the integrated notification system that combines toast notifications with persistent navbar storage.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={testNotifications}
              className="w-full"
            >
              Test All Notification Types
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => notify.success('Success Test', 'This is a success notification!')}
                variant="success"
              >
                Test Success
              </Button>
              
              <Button 
                onClick={() => notify.error('Error Test', 'This is an error notification!')}
                className="bg-red-500 hover:bg-red-600"
              >
                Test Error
              </Button>
              
              <Button 
                onClick={() => notify.warning('Warning Test', 'This is a warning notification!')}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Test Warning
              </Button>
              
              <Button 
                onClick={() => notify.info('Info Test', 'This is an info notification!')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Test Info
              </Button>
            </div>
            
            {notifications.length > 0 && (
              <Button 
                onClick={clearAllNotifications}
                variant="secondary"
                className="w-full"
              >
                Clear All Notifications
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Notifications appear as toast messages and are stored in the navbar notification area</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Each notification type (success, error, warning, info) has distinct styling and icons</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Notifications can be marked as read, deleted individually, or cleared all at once</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>The notification bell shows a badge with the count of unread notifications</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
