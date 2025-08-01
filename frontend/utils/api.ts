/**
 * API utilities for handling common API operations
 */

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export const apiCall = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const uploadFile = async (file: File, endpoint: string = '/api/upload-file'): Promise<APIResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

export const extractText = async (fileUrl: string): Promise<APIResponse<{ text: string }>> => {
  return apiCall('/api/extract-text', {
    method: 'POST',
    body: JSON.stringify({ fileUrl }),
  });
};

export const processWithAI = async (
  extractedText: string,
  userPrompt: string,
  aiProvider: string,
  apiKey: string
): Promise<APIResponse<{ content: any }>> => {
  return apiCall('/api/clean-with-ai', {
    method: 'POST',
    body: JSON.stringify({
      extracted_text: extractedText,
      user_prompt: userPrompt,
      ai_provider: aiProvider,
      user_api_key: apiKey,
    }),
  });
};

export const generateAIQuery = async (
  tableName: string,
  headers: string[],
  sampleData: any[][],
  totalRows: number,
  userPrompt: string,
  apiKey: string,
  provider: string
): Promise<APIResponse<{ query: string }>> => {
  return apiCall('/api/generate-ai-query', {
    method: 'POST',
    body: JSON.stringify({
      tableName,
      headers,
      sampleData,
      totalRows,
      userPrompt,
      apiKey,
      provider,
    }),
  });
};
