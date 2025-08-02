'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import FileDisplay from '../../ui/FileDisplay';
import PromptSelector from './PromptSelector';
import PromptEditor from './PromptEditor';

interface PromptTemplate {
  id: number;
  name: string;
  prompt: string;
}

interface AIProcessingStepProps {
  extractedText: string;
  prompt: string;
  aiProvider: string;
  apiKey: string;
  selectedTemplate: string;
  onPromptChange: (prompt: string) => void;
  onSelectedTemplateChange: (templateId: string) => void;
  onExtractedTextChange: (text: string) => void;
  isProcessing: boolean;
  onProcessingStart: () => void;
  onProcessingComplete: (data: any, columnOrder?: string[]) => void;
}

export default function AIProcessingStep({
  extractedText,
  prompt,
  aiProvider,
  apiKey,
  selectedTemplate,
  onPromptChange,
  onSelectedTemplateChange,
  onExtractedTextChange,
  isProcessing,
  onProcessingStart,
  onProcessingComplete
}: AIProcessingStepProps) {
  const [showTextView, setShowTextView] = useState(false);
  const [editableText, setEditableText] = useState(extractedText);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    setEditableText(extractedText);
  }, [extractedText]);

  // Fetch prompt templates on component mount
  useEffect(() => {
    const fetchPromptTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await fetch('/api/prompt-templates');
        if (response.ok) {
          const data = await response.json();
          setPromptTemplates(data.templates || []);
        } else {
          throw new Error('Failed to fetch prompt templates');
        }
      } catch (error) {
        console.error('Error fetching prompt templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchPromptTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    onSelectedTemplateChange(templateId);
    if (templateId === '') {
      return;
    }
    
    const template = promptTemplates.find(t => t.id.toString() === templateId);
    if (template) {
      onPromptChange(template.prompt);
    }
  };

  const handleProcess = async () => {
    if (!editableText) {
      throw new Error('No text to process. Please complete text extraction first.');
    }

    if (!prompt.trim()) {
      throw new Error('Please enter a prompt for AI processing.');
    }

    if (!apiKey.trim()) {
      throw new Error('Please enter your API key.');
    }

    onProcessingStart();
    
    try {
      const response = await fetch('/api/clean-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extracted_text: editableText,
          user_prompt: prompt,
          ai_provider: aiProvider,
          user_api_key: apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process text with AI');
      }

      const data = await response.json();
      onProcessingComplete(data.content);
    } catch (error) {
      console.error('AI processing error:', error);
      onProcessingComplete(null);
      throw error; // Let parent handle the error
    }
  };

  const canProcess = editableText.length > 0 && prompt.trim().length > 0 && apiKey.trim().length > 0;

  return (
    <Card title="Data Cleaning with AI">
      {/* Extracted Text Display */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Text:</h3>
        {editableText ? (
          <FileDisplay
            name="extracted_text.txt"
            size={editableText.length}
            type="TXT"
            onView={() => setShowTextView(!showTextView)}
          />
        ) : (
          <div className="border rounded p-3 bg-gray-50 border-gray-200">
            <p className="text-gray-500 text-sm">No text extracted yet</p>
          </div>
        )}
      </div>

      {/* Text Editor */}
      {showTextView && editableText && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Edit Extracted Text:</h3>
            <Button
              onClick={() => setShowTextView(false)}
              variant="secondary"
              size="sm"
            >
              Hide
            </Button>
          </div>
          <textarea
            value={editableText}
            className="w-full h-60 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 resize-none focus:outline-none"
            placeholder="Extracted text will appear here..."
            onChange={(e) => {
              const newText = e.target.value;
              setEditableText(newText);
              onExtractedTextChange(newText);
            }}
          />
        </div>
      )}

      {/* Prompt Configuration */}
      <PromptSelector
        templates={promptTemplates}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateSelect}
        loading={loadingTemplates}
      />

      <PromptEditor
        prompt={prompt}
        onPromptChange={(newPrompt) => {
          onPromptChange(newPrompt);
          // Reset template selection when manually editing
          if (selectedTemplate !== '' && newPrompt !== promptTemplates.find(t => t.id.toString() === selectedTemplate)?.prompt) {
            onSelectedTemplateChange('');
          }
        }}
      />

      {/* AI Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">ℹ️</span>
            <h4 className="font-semibold text-blue-800">AI Configuration</h4>
          </div>
        </div>
        <p className="text-blue-700 text-sm mb-2">
          Using <strong>{aiProvider === 'openai' ? 'OpenAI (GPT-4)' : 'Google (Gemini)'}</strong> for processing.
        </p>
        {!apiKey && (
          <p className="text-red-600 text-sm">
            ⚠️ No API key configured. Please set your default API key in{' '}
            <a href="/settings?from=wizard&step=3" className="font-semibold underline hover:text-red-800">
              Settings
            </a>{' '}
            to enable AI processing.
          </p>
        )}
        {apiKey && (
          <p className="text-green-600 text-sm">
            ✅ API key configured and ready for processing.{' '}
            <a
              href="/settings?from=wizard&step=3"
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Change
            </a>
          </p>
        )}
      </div>

      {/* Process Button */}
      <Button 
        onClick={handleProcess}
        disabled={isProcessing || !canProcess}
        loading={isProcessing}
        className="w-full"
      >
        Start AI Processing
      </Button>
    </Card>
  );
}
