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

    // if (!response.ok) {
    //     const errorData = await response.json();
    //     return NextResponse.json({ error: errorData.error || 'Unknown error' }, { status: 500 });
    // }

    const data = await response.json();

    return NextResponse.json({ cleaned_data: data.content });
}
