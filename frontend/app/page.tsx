'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Step1 from '@/components/uploadPage/step1';
import Step2 from '@/components/uploadPage/step2';
import Step3 from '@/components/uploadPage/step3';
import Step4 from '@/components/uploadPage/step4';

export default function UploadPage() {
    const [steps, setSteps] = useState([
        { name: "Upload PDF", status: "incomplete" },
        { name: "Text Extraction", status: "incomplete" },
        { name: "Process with AI", status: "incomplete" },
        { name: "Database Integration", status: "incomplete" }
    ]);
    const [currentStep, setCurrentStep] = useState(1);
    
    // Shared state for all steps
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [textFiles, setTextFiles] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [aiProvider, setAiProvider] = useState('gemini');
    const [extractedText, setExtractedText] = useState('');
    const [processedData, setProcessedData] = useState<string[][] | null>(null);
    const [cleanedDataCSV, setCleanedDataCSV] = useState<any[] | null>(null);
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFullTableStep3, setShowFullTableStep3] = useState(false); // Separate state for Step 3 table
    const [showFullTableStep4, setShowFullTableStep4] = useState(false); // Separate state for Step 4 table

    const updateStepStatus = (stepIndex: number, status: 'incomplete' | 'complete') => {
        const newSteps = [...steps];
        newSteps[stepIndex].status = status;
        setSteps(newSteps);
    };

    const getNextButtonText = () => {
        switch (currentStep) {
            case 1:
                return "Extract Text →";
            case 2:
                return "Process with AI →";
            case 3:
                return "Database Integration →";
            case 4:
                return "Finish";
            default:
                return "Next Step";
        }
    };

    const getPreviousButtonText = () => {
        switch (currentStep) {
            case 2:
                return "← Back to Upload";
            case 3:
                return "← Back to Text";
            case 4:
                return "← Back to AI Process";
            default:
                return "← Previous";
        }
    };

    const handleNextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            const newSteps = [...steps];
            newSteps[currentStep - 1].status = "incomplete";
            setSteps(newSteps);
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1 
                        file={uploadedFile}
                        onFileChange={(file: File | null) => {
                            setUploadedFile(file);
                            updateStepStatus(0, file ? 'complete' : 'incomplete');
                        }}
                    />
                );
            case 2:
                return (
                    <Step2 
                        uploadedFile={uploadedFile}
                        textFile={textFiles.length > 0 ? textFiles[0] : null}
                        isExtracting={isExtracting}
                        onTextReady={(text: string) => {
                            setExtractedText(text);
                        }}
                        onExtractionStart={() => {
                            setIsExtracting(true);
                            updateStepStatus(1, 'incomplete');
                        }}
                        onExtractionComplete={(newTextFile: string) => {
                            setTextFiles([newTextFile]);
                            setIsExtracting(false);
                            updateStepStatus(1, 'complete');
                        }}
                    />
                );
            case 3:
                return (
                    <Step3 
                        extractedText={extractedText}
                        prompt={prompt}
                        aiProvider={aiProvider}
                        onPromptChange={setPrompt}
                        onAiProviderChange={setAiProvider}
                        isProcessing={isProcessing}
                        onProcessingStart={() => setIsProcessing(true)}
                        onProcessingComplete={(data, userColumnOrder) => {
                            setCleanedDataCSV(data);
                            // Handle JSON array data instead of CSV string
                            if (data && Array.isArray(data)) {
                                // Convert JSON data to 2D array format for Step 4
                                if (data.length > 0) {
                                    // Use user's column order if provided, otherwise use object keys
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
                            setIsProcessing(false);
                            updateStepStatus(2, 'complete');
                        }}
                        cleanedData={cleanedDataCSV}
                        columnOrder={columnOrder}
                        showFullTable={showFullTableStep3}
                        onShowFullTableChange={setShowFullTableStep3}
                        onColumnOrderChange={(newOrder) => {
                            setColumnOrder(newOrder);
                            // Update cleanedDataCSV to reflect the new column order (for CSV downloads)
                            // This ensures the data structure stays consistent across steps
                            if (cleanedDataCSV && Array.isArray(cleanedDataCSV) && cleanedDataCSV.length > 0) {
                                // Update processedData with new column order
                                const reorderedData = [
                                    newOrder,
                                    ...cleanedDataCSV.map((item: any) => 
                                        newOrder.map(header => item[header] || '')
                                    )
                                ];
                                setProcessedData(reorderedData);
                            }
                        }}
                    />
                );
            case 4:
                return (
                    <Step4 
                        processedData={processedData}
                        columnOrder={columnOrder}
                        showFullTable={showFullTableStep4}
                        onShowFullTableChange={setShowFullTableStep4}
                        onComplete={() => updateStepStatus(3, 'complete')}
                        onColumnOrderChange={(newOrder) => {
                            setColumnOrder(newOrder);
                            // Update processedData with new column order
                            if (processedData && processedData.length > 0) {
                                const originalHeaders = processedData[0];
                                const rows = processedData.slice(1);
                                
                                // Reorder the data according to new column order
                                const reorderedData = [
                                    newOrder,
                                    ...rows.map(row => 
                                        newOrder.map(header => {
                                            const originalIndex = originalHeaders.indexOf(header);
                                            return originalIndex !== -1 ? row[originalIndex] || '' : '';
                                        })
                                    )
                                ];
                                setProcessedData(reorderedData);
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <main className="w-full min-h-screen bg-gray-100 flex justify-center p-4 md:p-8 pt-8 md:pt-16">
            <div className='w-full max-w-2xl h-fit flex flex-col gap-3'>
                <div id="steps-container" className="w-full m-auto p-4 flex bg-white rounded-lg shadow-md">
                    {steps.map((step, index, arr) => {
                        const stepNumber = index + 1;
                        return (
                            <div key={stepNumber} className={`flex ${stepNumber < arr.length ? 'w-full' : 'w-fit'}`}>
                                <div
                                    className={`w-[40px] h-[40px] rounded-[50%] flex justify-center items-center transition-colors duration-200 ${
                                        stepNumber <= currentStep || 
                                        step.status === 'complete' || 
                                        (stepNumber > 1 && steps[stepNumber - 2]?.status === 'complete') 
                                        ? 'cursor-pointer' : 'cursor-not-allowed'
                                    } ${
                                        stepNumber === currentStep && step.status !== 'complete' ? 'bg-green-600 ring-4 ring-green-300' :
                                        stepNumber === currentStep ? 'bg-green-500 ring-4 ring-green-300' : 
                                        step.status === 'complete' ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                                    onClick={() => {
                                        if (stepNumber <= currentStep || 
                                            step.status === 'complete' || 
                                            (stepNumber > 1 && steps[stepNumber - 2]?.status === 'complete')) {
                                            setCurrentStep(stepNumber);
                                        }
                                    }}
                                >
                                    <span className={`text-xl ${stepNumber === currentStep || step.status === 'complete' ? 'text-white' : 'text-slate-600'}`}>
                                        {stepNumber}
                                    </span>
                                </div>
                                {stepNumber < arr.length && (
                                    <div className={`flex-grow h-[2px] m-auto mx-2 ${
                                        step.status === 'complete' ? 'bg-green-500' : 'bg-slate-300'
                                    }`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {renderStepContent()}

                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                    <button
                        id="prev-step"
                        className={`px-4 py-2 rounded w-full sm:w-auto ${currentStep > 1 ? "bg-gray-300 text-gray-700 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        onClick={handlePreviousStep}
                        disabled={currentStep === 1}
                    >
                        {getPreviousButtonText()}
                    </button>
                    {currentStep < steps.length ? (
                        <button
                            id="next-step"
                            className={`px-4 py-2 rounded w-full sm:w-auto ${steps[currentStep - 1]?.status === "complete" ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-200 text-blue-400 cursor-not-allowed"}`}
                            onClick={handleNextStep}
                            disabled={steps[currentStep - 1]?.status !== "complete"}
                        >
                            {getNextButtonText()}
                        </button>
                    ) : (
                        <button
                            id="restart-step"
                            className="px-4 py-2 rounded w-full sm:w-auto bg-green-500 text-white cursor-pointer hover:bg-green-600"
                            onClick={() => {
                                setCurrentStep(1);
                                setUploadedFile(null);
                                setTextFiles([]);
                                setExtractedText('');
                                setProcessedData(null);
                                setCleanedDataCSV(null);
                                setColumnOrder([]);
                                setShowFullTableStep3(false);
                                setShowFullTableStep4(false);
                                setSteps(steps.map(step => ({ ...step, status: 'incomplete' })));
                                toast.success('Process restarted - ready for new upload');
                            }}
                        >
                            Start New Process
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}