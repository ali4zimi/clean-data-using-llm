import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: `File ${file.name} is not a PDF` },
                { status: 400 }
            );
        }

        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            return NextResponse.json(
                { error: 'Backend URL not configured' },
                { status: 500 }
            );
        }

        const backendFormData = new FormData();
        backendFormData.append('file', file);

        try {
            const backendResponse = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: backendFormData,
            });

            if (!backendResponse.ok) {
                const errorText = await backendResponse.text();
                console.error(`Backend upload failed for ${file.name}:`, errorText);
                return NextResponse.json(
                    { error: `Failed to upload ${file.name} to backend` },
                    { status: backendResponse.status }
                );
            }

            const result = await backendResponse.json();

            // Simulate a delay for demonstration purposes
            // await new Promise(resolve => setTimeout(resolve, 2000));

            return NextResponse.json({
                success: true,
                message: 'File uploaded successfully',
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                backendResponse: result
            });

        } catch (error) {
            console.error(`Upload error for ${file.name}:`, error);
            return NextResponse.json(
                { error: `Failed to upload ${file.name}` },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error during file upload' },
            { status: 500 }
        );
    }
}

// Get uploaded file url
export async function GET(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        return NextResponse.json(
            { error: 'Backend URL not configured' },
            { status: 500 }
        );
    }

    try {
        const backendResponse = await fetch(`${backendUrl}/uploaded-file-url`, {
            method: 'GET',
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('Failed to fetch uploaded file URL:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch uploaded file URL' },
                { status: backendResponse.status }
            );
        }

        const result = await backendResponse.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching uploaded file URL:', error);
        return NextResponse.json(
            { error: 'Internal server error while fetching uploaded file URL' },
            { status: 500 }
        );
    }
}