# Data Cleaning Pipeline

A full-stack application for extracting text from PDFs and cleaning/structuring data using AI providers. The system consists of a Flask backend API and a Next.js frontend with an interactive step-by-step interface.

## Features

- **PDF Processing**: Automated text extraction from uploaded PDF documents
- **AI Integration**: Clean and structure text using Gemini and OpenAI
- **Interactive UI**: Step-by-step wizard interface with progress tracking
- **Template System**: Pre-defined prompts for common data extraction tasks
- **Database Storage**: PostgreSQL integration for processed data (to be implemented as Docker service)
- **Docker Support**: Full containerization with Docker Compose

## Architecture

- **Backend**: Flask API (Python) - PDF processing, AI integration, data storage
- **Frontend**: Next.js (TypeScript) - Interactive UI, file upload, progress tracking
- **Database**: PostgreSQL for data persistence (to be implemented as Docker service)
- **AI Providers**: Gemini API (primary), OpenAI support

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd data-cleaning-pipeline
   ```

2. **Set up environment variables:**
   Create `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/           # Flask API server
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── frontend/          # Next.js application
│   ├── app/           # App router pages
│   └── components/    # React components
└── docker-compose.yml # Container orchestration
```

## Usage

1. Upload a PDF document
2. Extract text automatically
3. Choose an AI processing template
4. Review and save structured data

For detailed setup instructions, see the README files in `backend/` and `frontend/` directories.

- **Rebuild services:**
  ```bash
  docker-compose up --build
  ```

- **Remove containers and volumes:**
  ```bash
  docker-compose down -v
  ```

## Service Details

### Backend (Flask)
- **Port:** 5000
- **Build Context:** `./backend`
- **Volumes:** 
  - `./backend/uploads:/app/uploads` (for file uploads)
  - `./backend/data:/app/data` (for processed data)

### Frontend (Next.js)
- **Port:** 3000
- **Build Context:** `./frontend`
- **Environment:** 
  - `NEXT_PUBLIC_API_URL=http://backend:5000` (for API communication)

## Development Notes

- The frontend communicates with the backend using the internal Docker network
- File uploads and data processing are persisted through Docker volumes
- Both services will restart automatically unless manually stopped
- Make sure to set up your environment variables before running the containers
- **Coming Next**: PostgreSQL database service will be added to the Docker Compose setup for data persistence
