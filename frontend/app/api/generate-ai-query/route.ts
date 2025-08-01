import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { tableName, headers, sampleData, totalRows, userPrompt, apiKey, provider } = await request.json();
        const backendUrl = process.env.BACKEND_URL;

        if (!tableName || !headers || !sampleData || !userPrompt || !apiKey || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields: tableName, headers, sampleData, userPrompt, apiKey, or provider' },
                { status: 400 }
            );
        }

        const response = await fetch(`${backendUrl}/generate-ai-query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table_name: tableName,
                headers,
                sample_data: sampleData,
                total_rows: totalRows,
                user_prompt: userPrompt,
                user_api_key: apiKey,
                ai_provider: provider
            }),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                // Extract meaningful error message
                let errorMessage = 'Failed to generate AI query';
                
                if (errorData.error) {
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (errorData.error.message) {
                        errorMessage = errorData.error.message;
                    }
                }
                
                // Handle specific API key errors
                if (errorMessage.includes('API key not valid') || errorMessage.includes('INVALID_ARGUMENT')) {
                    errorMessage = 'Invalid API key. Please check your API key and try again.';
                } else if (errorMessage.includes('PERMISSION_DENIED')) {
                    errorMessage = 'API access denied. Please check your API key permissions.';
                } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
                    errorMessage = 'API quota exceeded. Please check your usage limits.';
                }
                
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            } catch (parseError) {
                return NextResponse.json({ error: 'Failed to process request' }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.ok ? 200 : 500 });
        
    } catch (error) {
        console.error('Error generating AI query:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI query' },
            { status: 500 }
        );
    }
}