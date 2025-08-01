import React from 'react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  placeholder?: string;
  height?: string;
}

export default function PromptEditor({ 
  prompt, 
  onPromptChange, 
  placeholder = "Enter your prompt here...",
  height = "200px" 
}: PromptEditorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
        AI Processing Prompt:
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
