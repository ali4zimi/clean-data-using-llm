'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';
import { useWizardStore } from '@/stores/wizardStore';
import { useSettings } from '@/contexts/SettingsContext';

// Layout Components
import StepNavigation from '@/components/layout/StepNavigation';

// Feature Components
import FileUploadStep from '@/components/features/file-upload/FileUploadStep';
import TextExtractionStep from '@/components/features/text-extraction/TextExtractionStep';
import AIProcessingStep from '@/components/features/ai-processing/AIProcessingStep';
import DatabaseIntegrationStep from '@/components/features/database-integration/DatabaseIntegrationStep';

// UI Components
import Button from '@/components/ui/Button';

export default function DataCleaningPipeline() {
  // Notification system
  const notify = useNotify();

  // Zustand store
  const {
    // State
    currentStep,
    steps,
    uploadedFile,
    extractedText,
    processedData,
    cleanedDataCSV,
    columnOrder,
    prompt,
    selectedTemplate,
    tableName,
    queryType,
    aiPrompt,
    showFullTableStep4,
    isExtracting,
    isProcessing,
    
    // Actions
    setCurrentStep,
    goToStep,
    nextStep,
    previousStep,
    updateStepStatus,
    setUploadedFile,
    setExtractedText,
    setProcessedData,
    updateColumnOrder,
    setPrompt,
    setSelectedTemplate,
    setTableName,
    setQueryType,
    setAiPrompt,
    setShowFullTableStep4,
    setIsExtracting,
    setIsProcessing,
    resetWizard,
    canGoToNextStep,
    getNextButtonText,
    getPreviousButtonText,
    restoreFileFromPersisted,
    hasHydrated,
  } = useWizardStore();

  // Settings context for AI provider and API key
  const { settings } = useSettings();

  // Handle URL parameters for step navigation with persistence priority
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only use URL step parameter if coming from external navigation (like settings)
    const stepParam = searchParams.get('step');
    const fromParam = searchParams.get('from');
    
    if (stepParam && fromParam) {
      // Coming from external navigation (like settings), respect URL
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= 4) {
        goToStep(stepNumber);
      }
    }
    // If no 'from' parameter, let persisted currentStep take precedence
  }, [searchParams, goToStep]);

  // Restore file from persisted data after hydration completes
  useEffect(() => {
    if (hasHydrated) {
      restoreFileFromPersisted();
    }
  }, [hasHydrated, restoreFileFromPersisted]);

  // Event handlers
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    updateStepStatus(0, 'complete');
    notify.success('File Upload', `Successfully uploaded ${file.name}`);
  };

  const handleExtractionComplete = (text: string) => {
    setExtractedText(text);
    setIsExtracting(false);
    if (text) {
      updateStepStatus(1, 'complete');
      notify.success('Text Extraction', 'Text extracted successfully from PDF!');
    } else {
      notify.error('Text Extraction Failed', 'Could not extract text from the uploaded PDF file');
    }
  };

  const handleTextChange = (text: string) => {
    setExtractedText(text);
    // Mark step as complete if text exists, incomplete if empty
    if (text.trim()) {
      updateStepStatus(1, 'complete');
    } else {
      updateStepStatus(1, 'incomplete');
    }
  };

  const handleProcessingComplete = (data: any, userColumnOrder?: string[]) => {
    setProcessedData(data, userColumnOrder);
    setIsProcessing(false);
    if (data) {
      updateStepStatus(2, 'complete');
      notify.success('AI Processing', 'Data processed successfully with AI!');
    } else {
      notify.error('AI Processing Failed', 'Could not process data with AI - please check your configuration');
    }
  };

  const handleDatabaseComplete = () => {
    updateStepStatus(3, 'complete');
    notify.success('Database Integration', 'Data successfully integrated with database!');
  };

  const handleRestart = () => {
    resetWizard();
    notify.success('Reset Complete', 'Wizard has been reset. You can start fresh!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadStep
            file={uploadedFile}
            onFileChange={setUploadedFile}
            isUploading={false}
            onUploadStart={() => {}}
            onUploadComplete={handleFileUpload}
          />
        );

      case 2:
        return (
          <TextExtractionStep
            uploadedFile={uploadedFile}
            extractedText={extractedText}
            isExtracting={isExtracting}
            onExtractionStart={() => setIsExtracting(true)}
            onExtractionComplete={handleExtractionComplete}
            onTextChange={handleTextChange}
          />
        );

      case 3:
        return (
          <AIProcessingStep
            extractedText={extractedText}
            prompt={prompt}
            aiProvider={settings.defaultAiProvider}
            apiKey={settings.defaultApiKey}
            selectedTemplate={selectedTemplate}
            onPromptChange={setPrompt}
            onSelectedTemplateChange={setSelectedTemplate}
            onExtractedTextChange={handleTextChange}
            isProcessing={isProcessing}
            onProcessingStart={() => setIsProcessing(true)}
            onProcessingComplete={handleProcessingComplete}
          />
        );

      case 4:
        return (
          <DatabaseIntegrationStep
            processedData={processedData}
            columnOrder={columnOrder}
            tableName={tableName}
            queryType={queryType}
            aiPrompt={aiPrompt}
            dbAiProvider={settings.defaultAiProvider}
            dbApiKey={settings.defaultApiKey}
            onComplete={handleDatabaseComplete}
            onColumnOrderChange={updateColumnOrder}
            onTableNameChange={setTableName}
            onQueryTypeChange={setQueryType}
            onAiPromptChange={setAiPrompt}
            onDbAiProviderChange={() => {}}
            onDbApiKeyChange={() => {}}
            showFullTable={showFullTableStep4}
            onShowFullTableChange={setShowFullTableStep4}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-gray-100 flex justify-center p-4 md:p-8 pt-8 md:pt-8">
      <div className='w-full max-w-2xl h-fit flex flex-col gap-3'>
        {!hasHydrated ? (
          // Show loading state during hydration
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {/* Step Navigation */}
            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
            
            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <Button
                onClick={previousStep}
                disabled={currentStep === 1}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {getPreviousButtonText()}
              </Button>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleRestart}
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                >
                  Restart
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 4 || !canGoToNextStep()}
                  className="flex-1 sm:flex-none"
                >
                  {getNextButtonText()}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
