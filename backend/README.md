# Data Cleaning Pipeline Backend

A Flask-based backend API for the data cleaning pipeline that extracts text from PDFs, processes it with AI providers, and provides structured data for frontend applications.

## Features

- **PDF Text Extraction**: Automated text extraction from uploaded PDF documents
- **AI Processing**: Clean and structure text data using AI providers (Gemini, OpenAI)
- **Template System**: Pre-defined prompts for common data extraction tasks
- **File Management**: Organized upload and data storage directories
- **RESTful API**: Complete REST API for frontend integration
- **Error Handling**: Comprehensive error responses and validation
- **Docker Support**: Ready for containerization

## Prerequisites

- Python 3.11 or higher
- pip package manager
- Virtual environment (recommended)
- Gemini API key (for AI processing)

## Installation

1. **Set up virtual environment**:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

## Usage

### Development Mode

Start the development server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Production Mode

For production deployment:

```bash
export FLASK_ENV=production
python app.py
```

## Docker Deployment

Build and run using Docker:

```bash
docker build -t data-cleaning-backend .
docker run -p 5000:5000 -e GEMINI_API_KEY=your_api_key data-cleaning-backend
```

## Project Structure

```
backend/
├── app.py                      # Main application entry point
├── config.py                   # Configuration settings
├── requirements.txt            # Dependencies
├── .env                       # Environment variables
├── Dockerfile                 # Docker configuration
├── routes/
│   ├── __init__.py
│   ├── upload_routes.py       # File upload/download routes
│   ├── processing_routes.py   # Text extraction and AI processing
│   └── template_routes.py     # Prompt template routes
├── services/
│   ├── __init__.py
│   ├── file_service.py        # File handling operations
│   ├── pdf_service.py         # PDF text extraction
│   ├── ai_service.py          # AI processing (Gemini, OpenAI)
│   └── template_service.py    # Template management
├── utils/
│   ├── __init__.py
│   ├── validators.py          # Input validation functions
│   └── constants.py           # Application constants
├── models/
│   ├── __init__.py
│   └── schemas.py             # Data models/schemas
├── templates/
│   └── index.html            # Upload HTML page
├── uploads/                   # Upload directory
└── data/                      # Processed data directory
```

## API Endpoints

### File Operations
- `POST /upload` - Upload PDF file for processing
- `GET /download-pdf-file` - Download uploaded PDF file
- `GET /uploaded-file-url` - Get uploaded file URL/path

### Text Processing
- `POST /extract-text` - Extract text from uploaded PDF
- `POST /clean-with-ai` - Process extracted text with AI providers

### Template Management  
- `GET /prompt-templates` - Get available prompt templates for data extraction

### Web Interface
- `GET /` - API welcome message and status
- `GET /upload` - Simple upload page for testing

## API Usage Examples

### Upload a PDF
```bash
curl -X POST -F "file=@document.pdf" http://localhost:5000/upload
```

### Extract Text
```bash
curl -X POST http://localhost:5000/extract-text
```

### Process with AI
```bash
curl -X POST http://localhost:5000/clean-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "Extract customer data with fields: name, email, phone",
    "extracted_text": "Your extracted text here",
    "ai_provider": "gemini"
  }'
```

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Your Gemini API key for AI processing
- `FLASK_ENV` - Environment mode (development/production)
- `FLASK_DEBUG` - Enable debug mode (True/False)

### Supported AI Providers
- **Gemini AI** - Google's Gemini API (primary)
- **OpenAI** - OpenAI API (planned support)

## Technologies Used

- **Flask 3.0** - Python web framework
- **PyPDF2** - PDF text extraction
- **Google Gemini AI** - Text processing and structuring
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management

## Frontend Integration

This backend is designed to work with a Next.js frontend application. The frontend should:
- Set `BACKEND_URL=http://localhost:5000` in environment variables
- Use the API endpoints for file upload, text extraction, and AI processing
- Handle the JSON responses for data display and database storage

## Development

### Run Tests
```bash
python test_structure.py
```

### Development Scripts
- `python app.py` - Start development server
- `python test_structure.py` - Verify modular structure
- `docker build -t backend .` - Build Docker image
