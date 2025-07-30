import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL;
        const backendResponse = await fetch(`${backendUrl}/prompt-templates`, {
            method: 'GET',
        });
        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('Failed to fetch prompt templates:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch prompt templates' },
                { status: backendResponse.status }
            );
        }
        const templates = await backendResponse.json();
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching prompt templates:', error);
        return NextResponse.json(
            { error: 'Internal server error while fetching prompt templates' },
            { status: 500 }
        );
    }
}