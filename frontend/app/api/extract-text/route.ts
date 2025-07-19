import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { fileUrl } = await request.json();
    const backendUrl = process.env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/extract-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ file_url: data.file_url, text: data.text });
}
