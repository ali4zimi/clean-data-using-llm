# Data Cleaning Pipeline Frontend

A Next.js-based frontend application for data cleaning pipeline that extracts text from PDFs, processes it with AI, and stores structured data in a database.

## Features

- **PDF Upload**: Upload PDF documents for text extraction
- **Text Extraction**: Automated text extraction from uploaded PDFs
- **AI Processing**: Clean and structure text data using AI providers (Gemini)
- **Database Integration**: Store processed data in PostgreSQL database (to be implemented as Docker service)
- **Interactive UI**: Step-by-step wizard interface with progress tracking

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Backend API server (for AI processing and database operations)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   BACKEND_URL=http://localhost:8000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Note**: You can also provide your API key directly in the application interface when sending prompts instead of using the environment variable.

## Usage

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build and start the production version:

```bash
npm run build
npm start
```

## Docker Deployment

Build and run using Docker:

```bash
docker build -t data-cleaning-frontend .
docker run -p 3000:3000 data-cleaning-frontend
```

## Project Structure

```
├── app/
│   ├── api/                  # API routes
│   │   ├── clean-with-ai/    # AI processing endpoint
│   │   ├── extract-text/     # Text extraction endpoint
│   │   ├── prompt-templates/ # Template management
│   │   └── upload-file/      # File upload handling
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main upload wizard
├── components/
│   └── uploadPage/           # Step components
│       ├── step1.tsx         # PDF upload
│       ├── step2.tsx         # Text extraction
│       ├── step3.tsx         # AI processing
│       └── step4.tsx         # Database integration
└── lib/
    └── db.ts              # Database utilities
```

## Configuration

The application requires a backend API server to handle:
- PDF text extraction
- AI processing (Gemini API integration)
- Database operations

Make sure your backend server is running and accessible via the `BACKEND_URL` environment variable.

### API Key Configuration

You have two options for providing your AI provider API key:

1. **Environment Variable**: Add `GEMINI_API_KEY` to your `.env.local` file (recommended for development)
2. **Runtime Input**: Enter your API key directly in the application interface when prompted during AI processing

This flexibility allows you to use the application without pre-configuring API keys if preferred.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **PostgreSQL** - Database storage (to be implemented as Docker service)
- **Gemini AI** - Text processing and structuring
- **React Table** - Data table components

## Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with a backend API for:
- File upload and text extraction
- AI-powered data cleaning
- Database operations

You can configure your AI provider (Gemini) API key either:
- In the `.env.local` file as `GEMINI_API_KEY`
- Directly in the application interface when processing data

This provides flexibility for different deployment scenarios and user preferences.