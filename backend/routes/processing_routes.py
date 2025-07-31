import os
import json
from flask import Blueprint, request, jsonify
from config import Config
from services.pdf_service import PDFService
from services.ai_service import AIService
from services.file_service import FileService

processing_bp = Blueprint('processing', __name__)

@processing_bp.route('/extract-text', methods=['POST'])
def extract_text():
    """Extract text from uploaded PDF"""
    pdf_file = os.path.join(Config.UPLOAD_FOLDER, 'uploaded_file.pdf')
    
    try:
        # Extract text from PDF
        text = PDFService.extract_text_from_pdf(pdf_file)
        
        # Save extracted text
        text_file_path = PDFService.save_extracted_text(text)
        
        return jsonify({
            'message': 'Text extracted successfully', 
            'file_url': text_file_path, 
            'text': text
        }), 200
        
    except FileNotFoundError:
        return jsonify({'error': 'No PDF file found to extract text from'}), 404
    except Exception as e:
        return jsonify({'error': f'Error extracting text: {str(e)}'}), 500

@processing_bp.route('/clean-with-ai', methods=['POST'])
def clean_with_ai():
    """Process extracted text with AI"""
    # Get request data
    user_api_key = request.json.get('user_api_key') or os.getenv('GEMINI_API_KEY')
    user_prompt = request.json.get('user_prompt')
    extracted_text = request.json.get('extracted_text')
    ai_provider = request.json.get('ai_provider', 'gemini')

    if not user_prompt or not extracted_text:
        return jsonify({'error': 'Missing required fields: user_prompt and extracted_text'}), 400
    
    if not user_api_key:
        return jsonify({'error': 'API key is required. Please provide user_api_key in request or set GEMINI_API_KEY environment variable'}), 400

    # Create full prompt
    prompt = f"""{user_prompt}
            Text: 
            {extracted_text}
            """

    try:
        # Process the text with the selected AI provider
        if ai_provider == 'gemini':
            content = AIService.process_with_gemini(user_api_key, prompt)
        elif ai_provider == 'openai':
            content = AIService.process_with_openai(user_api_key, prompt)
        else:
            return jsonify({'error': 'Invalid AI provider specified'}), 400
        
        # Convert AI response string to Python object
        try:
            content = json.loads(content)
        except json.JSONDecodeError:
            return jsonify({'error': 'AI response is not valid JSON'}), 500

        # Save parsed JSON data to file
        FileService.save_json_data(content, 'cleaned_data.json')

        return jsonify({'message': 'Data cleaned successfully', 'content': content}), 200
        
    except ValueError as e:
        # Handle API key validation errors
        if "API key" in str(e):
            return jsonify({'error': str(e)}), 401
        else:
            return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error processing with AI: {str(e)}'}), 500
