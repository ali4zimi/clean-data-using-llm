'use client';

import { useState } from 'react';
import Step1 from '@/components/uploadPage/step1';
import Step2 from '@/components/uploadPage/step2';
import Step3 from '@/components/uploadPage/step3';
import Step4 from '@/components/uploadPage/step4';

export default function UploadPage() {
    const [steps, setSteps] = useState([
        { name: "Upload PDF", status: "incomplete" },
        { name: "Text Extraction", status: "incomplete" },
        { name: "Process with AI", status: "incomplete" },
        { name: "Display Results", status: "incomplete" }
    ]);
    const [currentStep, setCurrentStep] = useState(1);
    
    // Shared state for all steps
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [textFiles, setTextFiles] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [prompt, setPrompt] = useState('You are a language learning assistant. Please extract all german words and respective meanings ' +
        'from the following text, find the meaning in english and also if it is nown find their gender. ' +
        'Also, classify the words into categories. For example, categorize the words into categories like food, travel, etc.' +
        '\nIf the word does not have example sentence, leave it blank.' +
        '\nFormat your response as a CSV with the following structure:' +
        '\n\nde_word, de_example, de_gender, de_category, en_word, en_example');
    const [aiProvider, setAiProvider] = useState('gemini');
    const [extractedText, setExtractedText] = useState('');
    const [processedData, setProcessedData] = useState<string[][] | null>(null);
    const [cleanedDataCSV, setCleanedDataCSV] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

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
                return "View Results →";
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
                            updateStepStatus(1, 'complete');
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
                        onProcessingComplete={(data) => {
                            setCleanedDataCSV(data);
                            // Parse CSV string into 2D array for Step 4
                            if (data) {
                                const lines = data.trim().split('\n');
                                const parsedData = lines.map((line: string) => 
                                    line.split(',').map((cell: string) => cell.trim().replace(/"/g, ''))
                                );
                                setProcessedData(parsedData);
                            } else {
                                setProcessedData(null);
                            }
                            setIsProcessing(false);
                            updateStepStatus(2, 'complete');
                        }}
                        cleanedData={cleanedDataCSV}
                    />
                );
            case 4:
                return (
                    <Step4 
                        processedData={processedData}
                        onComplete={() => updateStepStatus(3, 'complete')}
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
                                    className={`w-[40px] h-[40px] rounded-[50%] flex justify-center items-center transition-colors duration-200 cursor-pointer ${
                                        stepNumber === currentStep ? 'bg-blue-500' : 
                                        step.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                    onClick={() => setCurrentStep(stepNumber)}
                                >
                                    <span className={`text-xl ${stepNumber === currentStep || step.status === 'complete' ? 'text-white' : 'text-gray-600'}`}>
                                        {stepNumber}
                                    </span>
                                </div>
                                {stepNumber < arr.length && (
                                    <div className="flex-grow h-[2px] m-auto bg-gray-300 mx-2"></div>
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
                                setSteps(steps.map(step => ({ ...step, status: 'incomplete' })));
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