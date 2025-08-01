import React from 'react';

interface AIProviderConfig {
  provider: string;
  apiKey: string;
  onProviderChange: (provider: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export default function AIProviderConfig({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange
}: AIProviderConfig) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="mb-4">
        <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-2">
          AI Provider:
        </label>
        <select
          id="ai-provider"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
        >
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="google">Google (Gemini)</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
          API Key:
        </label>
        <input
          type="password"
          id="api-key"
          placeholder="Enter your API key here"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>
    </div>
  );
}
