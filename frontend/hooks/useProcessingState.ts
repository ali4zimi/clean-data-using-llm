import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export interface ProcessingState {
  // File and data state
  uploadedFile: File | null;
  extractedText: string;
  processedData: string[][] | null;
  cleanedDataCSV: any[] | null;
  columnOrder: string[];
  showFullTableStep3: boolean;
  showFullTableStep4: boolean;
  
  // Form field state - Step 3 (AI Processing)
  prompt: string;
  selectedTemplate: string;
  
  // Form field state - Step 4 (Database Integration)
  tableName: string;
  queryType: 'insert' | 'ai';
  aiPrompt: string;
  
  // Processing states
  isExtracting: boolean;
  isProcessing: boolean;
}

export function useProcessingState() {
  const { settings } = useSettings();
  
  // File and data state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [processedData, setProcessedData] = useState<string[][] | null>(null);
  const [cleanedDataCSV, setCleanedDataCSV] = useState<any[] | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [showFullTableStep3, setShowFullTableStep3] = useState(false);
  const [showFullTableStep4, setShowFullTableStep4] = useState(false);

  // Form field state - Step 3 (AI Processing)
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Form field state - Step 4 (Database Integration)
  const [tableName, setTableName] = useState('');
  const [queryType, setQueryType] = useState<'insert' | 'ai'>('insert');
  const [aiPrompt, setAiPrompt] = useState('');

  // Processing states
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateProcessedData = (data: any, userColumnOrder?: string[]) => {
    setCleanedDataCSV(data);
    
    if (data && Array.isArray(data)) {
      if (data.length > 0) {
        const headers = userColumnOrder && userColumnOrder.length > 0 
          ? userColumnOrder 
          : Object.keys(data[0]);
        
        setColumnOrder(headers);
        const headerRow = headers;
        const dataRows = data.map((item: any) => 
          headers.map(header => item[header] || '')
        );
        setProcessedData([headerRow, ...dataRows]);
      } else {
        setProcessedData(null);
      }
    } else {
      setProcessedData(null);
    }
  };

  const updateColumnOrder = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    
    // Update processedData with new column order
    if (cleanedDataCSV && Array.isArray(cleanedDataCSV) && cleanedDataCSV.length > 0) {
      const reorderedData = [
        newOrder,
        ...cleanedDataCSV.map((item: any) => 
          newOrder.map(header => item[header] || '')
        )
      ];
      setProcessedData(reorderedData);
    }
  };

  const resetProcessingState = () => {
    // Reset file and data state
    setUploadedFile(null);
    setExtractedText('');
    setProcessedData(null);
    setCleanedDataCSV(null);
    setColumnOrder([]);
    setShowFullTableStep3(false);
    setShowFullTableStep4(false);
    
    // Reset form field state
    setPrompt('');
    setSelectedTemplate('');
    setTableName('');
    setQueryType('insert');
    setAiPrompt('');
    
    // Reset processing states
    setIsExtracting(false);
    setIsProcessing(false);
  };

  return {
    // File and data state
    uploadedFile,
    extractedText,
    processedData,
    cleanedDataCSV,
    columnOrder,
    showFullTableStep3,
    showFullTableStep4,
    
    // Form field state - Step 3
    prompt,
    selectedTemplate,
    
    // Form field state - Step 4
    tableName,
    queryType,
    aiPrompt,
    
    // Processing states
    isExtracting,
    isProcessing,
    
    // File and data setters
    setUploadedFile,
    setExtractedText,
    setProcessedData,
    setCleanedDataCSV,
    setColumnOrder,
    setShowFullTableStep3,
    setShowFullTableStep4,
    
    // Form field setters - Step 3
    setPrompt,
    setSelectedTemplate,
    
    // Form field setters - Step 4
    setTableName,
    setQueryType,
    setAiPrompt,
    
    // Processing state setters
    setIsExtracting,
    setIsProcessing,
    
    // Complex operations
    updateProcessedData,
    updateColumnOrder,
    resetProcessingState,
    
    // Settings from context
    aiProvider: settings.defaultAiProvider,
    apiKey: settings.defaultApiKey,
  };
}
