import { useState } from 'react';

export interface StepData {
  name: string;
  status: 'incomplete' | 'complete';
}

export function useStepNavigation(initialSteps: StepData[]) {
  const [steps, setSteps] = useState<StepData[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(1);

  const updateStepStatus = (stepIndex: number, status: 'incomplete' | 'complete') => {
    const newSteps = [...steps];
    newSteps[stepIndex].status = status;
    setSteps(newSteps);
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      const newSteps = [...steps];
      newSteps[currentStep - 1].status = "incomplete";
      setSteps(newSteps);
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(1);
    setSteps(steps.map(step => ({ ...step, status: 'incomplete' })));
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 1: return "Extract Text →";
      case 2: return "Process with AI →";
      case 3: return "Database Integration →";
      case 4: return "Finish";
      default: return "Next Step";
    }
  };

  const getPreviousButtonText = () => {
    switch (currentStep) {
      case 2: return "← Back to Upload";
      case 3: return "← Back to Text";
      case 4: return "← Back to AI Process";
      default: return "← Previous";
    }
  };

  return {
    steps,
    currentStep,
    updateStepStatus,
    goToStep,
    nextStep,
    previousStep,
    resetSteps,
    getNextButtonText,
    getPreviousButtonText
  };
}
