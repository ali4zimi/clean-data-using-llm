import React from 'react';

interface Step {
  name: string;
  status: 'incomplete' | 'complete';
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

export default function StepNavigation({ steps, currentStep, onStepClick }: StepNavigationProps) {
  return (
    <div className="w-full m-auto p-4 flex bg-white rounded-lg shadow-md">
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
                  onStepClick(stepNumber);
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
  );
}
