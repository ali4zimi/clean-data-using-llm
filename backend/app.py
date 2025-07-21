import os
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from flask import Flask, current_app, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Define constants 
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
DATA_DIR = 'data'

# Ensure the upload and data directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# ┌─────────────────────────────────────────────────────────────┐
# │ Home route: Returns a welcome message as JSON               │
# └─────────────────────────────────────────────────────────────┘
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the PDF Text Extractor API'})


# ┌─────────────────────────────────────────────────────────────┐
# │ Index route: Renders the upload HTML page                   │
# └─────────────────────────────────────────────────────────────┘
@app.route('/upload', methods = ['GET'])
def index():
    return render_template('index.html')


# ┌─────────────────────────────────────────────────────────────┐
# │                    API ENDPOINTS SECTION                    │
# │   (All Flask route definitions for the application below)   │
# └─────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────┐
# │ Upload route: Handles PDF file upload and saves to server   │
# └─────────────────────────────────────────────────────────────┘
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        pdf_path = os.path.join(UPLOAD_FOLDER, "uploaded_file.pdf")
        file.save(pdf_path)
        
        return jsonify({'message': 'File uploaded successfully', 'file_path': pdf_path}), 200
    
    return jsonify({'error': 'Invalid file format. Only PDF files are allowed.'}), 400




# ┌─────────────────────────────────────────────────────────────┐
# │ Downloadable file route                                     │
# └─────────────────────────────────────────────────────────────┘
@app.route('/download-pdf-file', methods=['GET'])
def download_uploaded_file():
    pdf_file = os.path.join(UPLOAD_FOLDER, 'uploaded_file.pdf')
    if not os.path.exists(pdf_file):
        return jsonify({'error': 'No PDF file found'}), 404
    return send_from_directory(UPLOAD_FOLDER, 'uploaded_file.pdf', as_attachment=True)

# ┌─────────────────────────────────────────────────────────────┐
# │ Get uploaded file URL route                                 │
# │ PDF file for download                                       │
# └─────────────────────────────────────────────────────────────┘
@app.route('/uploaded-file-url', methods=['GET'])
def get_uploaded_file_url():
    pdf_file = os.path.join(UPLOAD_FOLDER, 'uploaded_file.pdf')
    if not os.path.exists(pdf_file):
        return None
    return jsonify({'file_url': pdf_file}), 200


# ┌─────────────────────────────────────────────────────────────┐
# │ Extract-text route: Extracts text from uploaded PDF and     │
# │ saves it to a text file                                     │
# └─────────────────────────────────────────────────────────────┘
@app.route('/extract-text', methods=['POST'])
def extract_text():
    # Get file from data directory
    pdf_file = os.path.join(UPLOAD_FOLDER, 'uploaded_file.pdf')
    if not os.path.exists(pdf_file):
        return jsonify({'error': 'No PDF file found to extract text from'}), 404
    # Extract text from the PDF
    reader = PdfReader(pdf_file)
    text = ''
    for page in reader.pages:
        text += page.extract_text() or ''
    
    # Save the extracted text to a Text file
    text_file_path = os.path.join(DATA_DIR, 'extracted_text.txt')
    with open(text_file_path, 'w', encoding='utf-8') as file:
        file.write(text)

    return jsonify({'message': 'Text extracted successfully', 'file_url': text_file_path, 'text': text}), 200


# ┌─────────────────────────────────────────────────────────────┐
# │ Clean-data route: Processes extracted text, uses Gemini AI  │
# │ to extract German words, meanings, and categories, then     │
# │ saves as CSV                                                │
# └─────────────────────────────────────────────────────────────┘
@app.route('/clean-with-ai', methods=['POST'])
def clean_with_ai():
    # get extracted_text, prompt from request
    user_api_key = request.json.get('user_api_key')
    os.environ['GEMINI_API_KEY'] = user_api_key
    user_prompt = request.json.get('user_prompt')
    extracted_text = request.json.get('extracted_text')
    ai_provider = request.json.get('ai_provider', 'gemini')

    prompt = f"""{user_prompt}
            Text: 
            {extracted_text}
            """

    # Process the text with the selected AI provider
    if ai_provider == 'gemini':
        content = process_with_gemini(user_api_key, prompt)
    elif ai_provider == 'openai':
        content = process_with_openai(user_api_key, prompt)
    else:
        return jsonify({'error': 'Invalid AI provider specified'}), 400

    # Save the cleaned data to a new text file
    cleaned_text_path = os.path.join(DATA_DIR, 'cleaned_data.txt')
    with open(cleaned_text_path, 'w', encoding='utf-8') as file:
        file.write(content)

    return jsonify({'message': 'Data cleaned successfully', 'content': content}), 200


# ───────────────── END OF API ENDPOINTS SECTION ───────────────#



# ┌─────────────────────────────────────────────────────────────┐
# │                  HELPER FUNCTIONS SECTION                   │
# │   (All helper functions used in the application below)      │
# └─────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────┐
# │ Process with Gemini                                         │
# │ Uses Gemini AI to process the extracted text and returns    │
# └─────────────────────────────────────────────────────────────┘
def process_with_gemini(user_api_key, prompt):
    # Initialize Gemini Client
    # genai.set_api_key(user_api_key)
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
        # thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    content = response.text.strip()
    return content


# ┌─────────────────────────────────────────────────────────────┐
# │ Process with OpenAI                                         │
# │ Uses OpenAI to process the extracted text and returns       │
# │ the processed content                                       │
# └─────────────────────────────────────────────────────────────┘       

def process_with_openai(user_api_key, prompt):
    return "OpenAI processing is not implemented yet. Please use Gemini AI."


# ┌─────────────────────────────────────────────────────────────┐
# │ Main entry point: Runs the Flask app in debug mode          │
# └─────────────────────────────────────────────────────────────┘
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
