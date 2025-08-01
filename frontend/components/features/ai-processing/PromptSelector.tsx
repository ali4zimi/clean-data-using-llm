import React from 'react';

interface PromptTemplate {
  id: number;
  name: string;
  prompt: string;
}

interface PromptSelectorProps {
  templates: PromptTemplate[];
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  loading?: boolean;
}

export default function PromptSelector({ 
  templates, 
  selectedTemplate, 
  onTemplateSelect, 
  loading = false 
}: PromptSelectorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="prompt-template" className="block text-sm font-medium text-gray-700 mb-2">
        Prompt Template:
      </label>
      <select
        id="prompt-template"
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        value={selectedTemplate}
        onChange={(e) => onTemplateSelect(e.target.value)}
        disabled={loading}
      >
        <option value="">Select a template...</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id.toString()}>
            {template.name}
          </option>
        ))}
      </select>
      {loading && (
        <p className="text-sm text-gray-500 mb-2">Loading templates...</p>
      )}
    </div>
  );
}
