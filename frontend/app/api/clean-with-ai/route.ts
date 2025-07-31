import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { extracted_text, user_prompt, ai_provider, user_api_key } = await request.json();
    const backendUrl = process.env.BACKEND_URL;


    if (!extracted_text || !user_prompt || !ai_provider || !user_api_key) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    const response = await fetch(`${backendUrl}/clean-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_api_key, extracted_text, user_prompt, ai_provider })
    });



    if (!response.ok) {
        try {
            const errorData = await response.json();
            // Extract meaningful error message
            let errorMessage = 'Failed to process text with AI';
            
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
}
