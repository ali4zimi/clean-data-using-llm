'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Layout Components
import StepNavigation from '@/components/layout/StepNavigation';

// Feature Components
import FileUploadStep from '@/components/features/file-upload/FileUploadStep';
import TextExtractionStep from '@/components/features/text-extraction/TextExtractionStep';
import AIProcessingStep from '@/components/features/ai-processing/AIProcessingStep';
import DatabaseIntegrationStep from '@/components/features/database-integration/DatabaseIntegrationStep';

// UI Components
import Button from '@/components/ui/Button';

// Hooks
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useProcessingState } from '@/hooks/useProcessingState';

const INITIAL_STEPS = [
  { name: "Upload PDF", status: "incomplete" as const },
  { name: "Text Extraction", status: "incomplete" as const },
  { name: "Process with AI", status: "incomplete" as const },
  { name: "Database Integration", status: "incomplete" as const }
];

export default function DataCleaningPipeline() {
  // Step navigation state
  const {
    steps,
    currentStep,
    updateStepStatus,
    goToStep,
    nextStep,
    previousStep,
    resetSteps,
    getNextButtonText,
    getPreviousButtonText
  } = useStepNavigation(INITIAL_STEPS);

  // Processing state (now includes all form fields)
  const {
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
    aiProvider,
    aiApiKey,
    selectedTemplate,
    
    // Form field state - Step 4
    tableName,
    queryType,
    aiPrompt,
    dbAiProvider,
    dbApiKey,
    
    // Processing states
    isExtracting,
    isProcessing,
    
    // Setters
    setUploadedFile,
    setExtractedText,
    setShowFullTableStep3,
    setShowFullTableStep4,
    setPrompt,
    setAiProvider,
    setAiApiKey,
    setSelectedTemplate,
    setTableName,
    setQueryType,
    setAiPrompt,
    setDbAiProvider,
    setDbApiKey,
    setIsExtracting,
    setIsProcessing,
    
    // Complex operations
    updateProcessedData,
    updateColumnOrder,
    syncAIConfigurationToDatabase,
    resetProcessingState
  } = useProcessingState();

  // Wrapper functions for step navigation with AI sync
  const handleGoToStep = (stepNumber: number) => {
    // Sync AI configuration when going to step 4
    if (stepNumber === 4) {
      syncAIConfigurationToDatabase();
    }
    goToStep(stepNumber);
  };

  const handleNextStep = () => {
    // Sync AI configuration when moving to step 4
    if (currentStep === 3) {
      syncAIConfigurationToDatabase();
    }
    nextStep();
  };

  // Handlers
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    updateStepStatus(0, 'complete');
  };

  const handleExtractionComplete = (text: string) => {
    setExtractedText(text);
    setIsExtracting(false);
    if (text) {
      updateStepStatus(1, 'complete');
      toast.success('Text extracted successfully!');
    } else {
      toast.error('Failed to extract text from PDF');
    }
  };

  const handleProcessingComplete = (data: any, userColumnOrder?: string[]) => {
    updateProcessedData(data, userColumnOrder);
    setIsProcessing(false);
    if (data) {
      updateStepStatus(2, 'complete');
      toast.success('Data processed successfully with AI!');
    } else {
      toast.error('Failed to process data with AI');
    }
  };

  const handleDatabaseComplete = () => {
    updateStepStatus(3, 'complete');
  };

  const handleRestart = () => {
    resetSteps();
    resetProcessingState();
    toast.success('Process restarted - ready for new upload');
  };

  const canGoToNextStep = () => {
    return steps[currentStep - 1]?.status === "complete";
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
            onTextChange={setExtractedText}
          />
        );

      case 3:
        return (
          <AIProcessingStep
            extractedText={extractedText}
            prompt={prompt}
            aiProvider={aiProvider}
            apiKey={aiApiKey}
            selectedTemplate={selectedTemplate}
            onPromptChange={setPrompt}
            onAiProviderChange={setAiProvider}
            onApiKeyChange={setAiApiKey}
            onSelectedTemplateChange={setSelectedTemplate}
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
            dbAiProvider={dbAiProvider}
            dbApiKey={dbApiKey}
            onComplete={handleDatabaseComplete}
            onColumnOrderChange={updateColumnOrder}
            onTableNameChange={setTableName}
            onQueryTypeChange={setQueryType}
            onAiPromptChange={setAiPrompt}
            onDbAiProviderChange={setDbAiProvider}
            onDbApiKeyChange={setDbApiKey}
            showFullTable={showFullTableStep4}
            onShowFullTableChange={setShowFullTableStep4}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center p-4 md:p-8 pt-8 md:pt-8">
      <div className='w-full max-w-2xl h-fit flex flex-col gap-3'>
        {/* Step Navigation */}
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleGoToStep}
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
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNextStep}
              disabled={!canGoToNextStep()}
              className="w-full sm:w-auto"
            >
              {getNextButtonText()}
            </Button>
          ) : (
            <Button
              onClick={handleRestart}
              variant="success"
              className="w-full sm:w-auto"
            >
              Start New Process
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
