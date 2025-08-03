'use client';

import React from 'react';

interface EditableTextAccordionProps {
  title: string;
  filename: string;
  text: string;
  currentText: string;
  showEditor: boolean;
  hasUnsavedChanges: boolean;
  placeholder?: string;
  onToggleEditor: () => void;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  emptyStateMessage?: string;
}

export default function EditableTextAccordion({
  title,
  filename,
  text,
  currentText,
  showEditor,
  hasUnsavedChanges,
  placeholder = "Text will appear here...",
  onToggleEditor,
  onTextChange,
  onSave,
  onDiscard,
  emptyStateMessage = "No text available"
}: EditableTextAccordionProps) {
  if (!text || text.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}:</h3>
        <div className="border rounded p-3 bg-gray-50 border-gray-200">
          <p className="text-gray-500 text-sm">{emptyStateMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}:</h3>
      <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
        <div 
          className="p-3 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={onToggleEditor}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xs font-medium mr-2 px-2 py-1 rounded bg-green-100 text-green-600 border border-green-400">TXT</span>
              <div>
                <h4 className="text-sm font-medium text-green-800">{filename}</h4>
                <p className="text-xs text-green-600">{text.length} characters</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave();
                    }}
                    className="text-sm px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscard();
                    }}
                    className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    Discard
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditor();
                }}
                className="text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-200 transition-colors text-green-700"
              >
                {showEditor ? 'Hide Editor' : 'Show Editor'}
              </button>
            </div>
          </div>
        </div>
        
        {showEditor && (
          <div className="border-t border-green-200 p-4 bg-green-50">
            <textarea
              value={currentText}
              className="w-full h-60 p-3 bg-white border border-green-300 rounded text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={placeholder}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
