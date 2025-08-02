"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSettings } from '@/contexts/SettingsContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { settings, updateSettings, saveSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Check if user came from wizard
  const fromWizard = searchParams.get('from') === 'wizard';
  const wizardStep = searchParams.get('step') || '1';

  const handleBackToWizard = () => {
    router.push(`/ai-data-wizard?step=${wizardStep}&from=settings`);
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    updateSettings({ [key]: value } as any);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await saveSettings();
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    updateSettings({
      defaultAiProvider: 'openai',
      defaultApiKey: '',
      autoSaveEnabled: true,
      maxFileSize: '10',
      defaultPromptTemplate: '',
    });
    setHasChanges(true);
    toast.success('Settings reset to default values');
  };

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          {fromWizard && (
            <p className="text-sm text-gray-600 mt-1">
              Configure your AI settings to continue with data processing
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {fromWizard && (
            <Button
              variant="secondary"
              onClick={handleBackToWizard}
              size="sm"
              className="mr-2"
            >
              ← Back to Wizard (Step {wizardStep})
            </Button>
          )}
          {hasChanges && (
            <>
              <Button
                variant="secondary"
                onClick={handleResetSettings}
                size="sm"
              >
                Reset to Default
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Configuration Section */}
        <Card className={`p-6 ${fromWizard ? 'border-blue-200 bg-blue-50' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">AI Configuration</h2>
            {fromWizard && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Required
              </span>
            )}
          </div>
          <p className={`mb-6 ${fromWizard ? 'text-blue-700' : 'text-gray-600'}`}>
            {fromWizard 
              ? 'Configure your AI provider and API key to enable data processing in the wizard.'
              : 'Set your default AI provider and API key for data processing.'
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-2">
                Default AI Provider
              </label>
              <select
                id="ai-provider"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.defaultAiProvider}
                onChange={(e) => handleSettingChange('defaultAiProvider', e.target.value)}
              >
                <option value="openai">OpenAI (GPT-4)</option>
                <option value="google">Google (Gemini)</option>
              </select>
            </div>

            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                Default API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="api-key"
                  placeholder="Enter your API key here"
                  className="w-full p-3 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.defaultApiKey}
                  onChange={(e) => handleSettingChange('defaultApiKey', e.target.value)}
                />
                {settings.defaultApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSettingChange('defaultApiKey', '');
                      toast.success('API key cleared');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors duration-200 text-xs"
                    title="Clear API key"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </div>
        </Card>

        {/* Processing Settings Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Processing Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure how the application handles data processing.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-save processed data</label>
                <p className="text-xs text-gray-500">Automatically save processed data to downloads</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.autoSaveEnabled}
                  onChange={(e) => handleSettingChange('autoSaveEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label htmlFor="max-file-size" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <select
                id="max-file-size"
                className="w-full md:w-48 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
              >
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="25">25 MB</option>
                <option value="50">50 MB</option>
              </select>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Build:</strong> Production</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </Card>
      </div>
    </main>
  );
}