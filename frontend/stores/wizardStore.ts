import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface Step {
  name: string;
  status: 'incomplete' | 'complete';
}

interface PersistedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data: string; // base64 encoded file data
}

interface WizardState {
  // Step navigation
  currentStep: number;
  steps: Step[];
  
  // File and data state
  uploadedFile: File | null;
  persistedFile: PersistedFile | null; // For localStorage persistence
  extractedText: string;
  processedData: any[];
  cleanedDataCSV: any[] | null;
  columnOrder: string[];
  
  // AI Processing state
  prompt: string;
  selectedTemplate: string;
  
  // Database integration state
  tableName: string;
  queryType: 'insert' | 'ai';
  aiPrompt: string;
  showFullTableStep4: boolean;
  
  // Processing flags
  isExtracting: boolean;
  isProcessing: boolean;
  
  // Hydration flag
  hasHydrated: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateStepStatus: (stepIndex: number, status: 'incomplete' | 'complete') => void;
  
  // File and data actions
  setUploadedFile: (file: File | null) => void;
  setExtractedText: (text: string) => void;
  setProcessedData: (data: any[], userColumnOrder?: string[]) => void;
  updateColumnOrder: (newOrder: string[]) => void;
  
  // File persistence helpers
  convertFileToBase64: (file: File) => Promise<void>;
  restoreFileFromPersisted: () => void;
  
  // AI Processing actions
  setPrompt: (prompt: string) => void;
  setSelectedTemplate: (template: string) => void;
  
  // Database integration actions
  setTableName: (name: string) => void;
  setQueryType: (type: 'insert' | 'ai') => void;
  setAiPrompt: (prompt: string) => void;
  setShowFullTableStep4: (show: boolean) => void;
  
  // Processing flags actions
  setIsExtracting: (extracting: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  
  // Hydration actions
  setHasHydrated: (hydrated: boolean) => void;
  
  // Utility actions
  resetWizard: () => void;
  canGoToNextStep: () => boolean;
  getNextButtonText: () => string;
  getPreviousButtonText: () => string;
}

const INITIAL_STEPS: Step[] = [
  { name: "Upload PDF", status: "incomplete" },
  { name: "Text Extraction", status: "incomplete" },
  { name: "Process with AI", status: "incomplete" },
  { name: "Database Integration", status: "incomplete" }
];

const initialState = {
  // Step navigation
  currentStep: 1,
  steps: INITIAL_STEPS,
  
  // File and data state
  uploadedFile: null,
  persistedFile: null,
  extractedText: '',
  processedData: [],
  cleanedDataCSV: null,
  columnOrder: [],
  
  // AI Processing state
  prompt: '',
  selectedTemplate: '',
  
  // Database integration state
  tableName: '',
  queryType: 'insert' as const,
  aiPrompt: '',
  showFullTableStep4: false,
  
  // Processing flags
  isExtracting: false,
  isProcessing: false,
  
  // Hydration flag
  hasHydrated: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Step navigation actions
      setCurrentStep: (step: number) => set({ currentStep: step }),
      
      goToStep: (step: number) => {
        const state = get();
        if (step === 1 || (step > 1 && state.steps[step - 2]?.status === 'complete')) {
          set({ currentStep: step });
        }
      },
      
      nextStep: () => {
        const state = get();
        if (state.currentStep < 4 && state.canGoToNextStep()) {
          set({ currentStep: state.currentStep + 1 });
        }
      },
      
      previousStep: () => {
        const state = get();
        if (state.currentStep > 1) {
          set({ currentStep: state.currentStep - 1 });
        }
      },
      
      updateStepStatus: (stepIndex: number, status: 'incomplete' | 'complete') => {
        const state = get();
        const newSteps = [...state.steps];
        newSteps[stepIndex].status = status;
        set({ steps: newSteps });
      },
      
      // File and data actions
      setUploadedFile: (file: File | null) => {
        set({ uploadedFile: file });
        // Also convert to base64 for persistence if file exists
        if (file) {
          const store = get();
          store.convertFileToBase64(file);
        } else {
          set({ persistedFile: null });
        }
      },
      
      setExtractedText: (text: string) => set({ extractedText: text }),
      
      setProcessedData: (data: any[], userColumnOrder?: string[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const headers = userColumnOrder && userColumnOrder.length > 0 
            ? userColumnOrder 
            : Object.keys(data[0]);
          
          const headerRow = headers;
          const dataRows = data.map((item: any) => 
            headers.map(header => item[header] || '')
          );
          const processedData = [headerRow, ...dataRows];
          
          set({ 
            processedData,
            cleanedDataCSV: data,
            columnOrder: headers
          });
        } else {
          set({ processedData: data, cleanedDataCSV: data });
        }
      },
      
      updateColumnOrder: (newOrder: string[]) => {
        const state = get();
        if (state.cleanedDataCSV && Array.isArray(state.cleanedDataCSV) && state.cleanedDataCSV.length > 0) {
          const reorderedData = [
            newOrder,
            ...state.cleanedDataCSV.map((item: any) => 
              newOrder.map(header => item[header] || '')
            )
          ];
          set({ 
            columnOrder: newOrder,
            processedData: reorderedData
          });
        } else {
          set({ columnOrder: newOrder });
        }
      },
      
      // File persistence helpers
      convertFileToBase64: async (file: File) => {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove the data URL prefix to store just the base64 data
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          const persistedFile: PersistedFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: base64
          };
          
          set({ persistedFile });
        } catch (error) {
          console.error('Error converting file to base64:', error);
        }
      },
      
      restoreFileFromPersisted: () => {
        const state = get();
        if (state.persistedFile && !state.uploadedFile) {
          try {
            // Convert base64 back to File
            const byteCharacters = atob(state.persistedFile.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            const file = new File([byteArray], state.persistedFile.name, {
              type: state.persistedFile.type,
              lastModified: state.persistedFile.lastModified,
            });
            
            set({ uploadedFile: file });
          } catch (error) {
            console.error('Error restoring file from persisted data:', error);
          }
        }
      },
      
      // AI Processing actions
      setPrompt: (prompt: string) => set({ prompt }),
      setSelectedTemplate: (template: string) => set({ selectedTemplate: template }),
      
      // Database integration actions
      setTableName: (name: string) => set({ tableName: name }),
      setQueryType: (type: 'insert' | 'ai') => set({ queryType: type }),
      setAiPrompt: (prompt: string) => set({ aiPrompt: prompt }),
      setShowFullTableStep4: (show: boolean) => set({ showFullTableStep4: show }),
      
      // Processing flags actions
      setIsExtracting: (extracting: boolean) => set({ isExtracting: extracting }),
      setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
      
      // Hydration actions
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      
      // Utility actions
      resetWizard: () => {
        const state = get();
        set({
          ...initialState,
          hasHydrated: state.hasHydrated, // Preserve hydration state
        });
      },
      
      canGoToNextStep: () => {
        const state = get();
        return state.steps[state.currentStep - 1]?.status === 'complete';
      },
      
      getNextButtonText: () => {
        const state = get();
        if (state.currentStep === 4) return "Complete";
        return "Next Step";
      },
      
      getPreviousButtonText: () => "Previous Step",
    }),
    {
      name: 'wizard-storage', // localStorage key
      partialize: (state) => ({
        // Only persist certain parts of the state
        currentStep: state.currentStep,
        steps: state.steps,
        persistedFile: state.persistedFile, // Persist file as base64
        extractedText: state.extractedText,
        processedData: state.processedData,
        cleanedDataCSV: state.cleanedDataCSV,
        columnOrder: state.columnOrder,
        prompt: state.prompt,
        selectedTemplate: state.selectedTemplate,
        tableName: state.tableName,
        queryType: state.queryType,
        aiPrompt: state.aiPrompt,
        showFullTableStep4: state.showFullTableStep4,
        // Note: Don't persist File objects, processing flags, or hasHydrated
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated when rehydration completes
        state?.setHasHydrated(true);
      },
    }
  )
);
