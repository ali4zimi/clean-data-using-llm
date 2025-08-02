import React, { useState } from 'react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  placeholder?: string;
  height?: string;
  label?: string;
  customPlaceholder?: boolean; // Flag to enable custom placeholder rendering
}

export default function PromptEditor({ 
  prompt, 
  onPromptChange, 
  placeholder = "Enter your prompt here...",
  height = "200px",
  label = "AI Processing Prompt:",
  customPlaceholder = false
}: PromptEditorProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(customPlaceholder && !prompt.trim());

  // If not using custom placeholder, render the simple version
  if (!customPlaceholder) {
    return (
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <textarea 
          id="prompt" 
          className="w-full p-2 border rounded mb-4" 
          value={prompt} 
          placeholder={placeholder}
          style={{ height }}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </div>
    );
  }

  // Custom placeholder version
  return (
    <div className="mb-4">
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <textarea 
          id="prompt" 
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          value={prompt}
          style={{ height }}
          onChange={(e) => {
            const value = e.target.value;
            onPromptChange(value);
            setShowPlaceholder(!value.trim());
          }}
          onFocus={() => setShowPlaceholder(false)}
          onBlur={() => setShowPlaceholder(!prompt.trim())}
          placeholder={showPlaceholder ? "" : "Enter your prompt here..."}
        />
        {showPlaceholder && (
          <div className="absolute inset-0 p-3 pointer-events-none text-gray-400 text-sm overflow-hidden">
            {placeholder.split('\n').map((line, index) => (
              <div key={index} className={index === 0 ? "" : "mt-0.5"}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
