import os
from urllib import response
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from flask import Flask, current_app, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
from google import genai
from google.genai import types
import json

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
# |  Prompt template route: Returns a prompt template for       │
# |  AI processing                                              │
# └─────────────────────────────────────────────────────────────┘
@app.route('/prompt-templates', methods=['GET'])
def prompt_template(): 
    templates = [
        {
            "id": 1,
            "name": "German Word Extraction",
            "prompt": "You are a language learning assistant. Please extract all german words and respective meanings " +
                    "from the following text, find the meaning in english and also if it is nown find their gender. " +
                    "Also, classify the words into categories. For example, categorize the words into categories like food, travel, etc. " +
                    "If the word does not have example sentence, make one up. \n\n" +
                    "Format your response as the following structure: \n" +
                    "de_word, de_example, de_gender, de_category, en_word, en_example"
        },
        {
            "id": 2,
            "name": "Dutch Word Extraction",
            "prompt": "You are a language learning assistant. Please extract all dutch words and respective meanings " +
                    "from the following text, find the meaning in english and also if it is nown find their gender. " +
                    "Also, classify the words into categories. For example, categorize the words into categories like food, travel, etc. " +
                    "If the word does not have example sentence, make one up. \n\n" +
                    "Format your response as the following structure: \n" +
                    "nl_word, nl_example, nl_category, en_word, en_example"
        },
        {
            "id": 3,
            "name": "Extract customer data",
            "prompt": "You are a data extraction assistant. Please extract customer data from the following text. " +
                    "Extract the following fields: name, email, phone number, address."
        },
        {
            "id": 4,
            "name": "Extract product data",
            "prompt": "You are a data extraction assistant. Please extract product data from the following text. " +
                    "Extract the following fields: product name, price, description, category."
        },
        {
            "id": 5,
            "name": "Extract financial data",
            "prompt": "You are a financial data extraction assistant. Please extract financial data from the following text. " +
                    "Extract the following fields: transaction date, amount, description, category."
        }
    ]
    return jsonify({'templates': templates}), 200


# ┌─────────────────────────────────────────────────────────────┐
# │ Clean-data route: Processes extracted text, uses Gemini AI  │
# │ to extract German words, meanings, and categories, then     │
# │ saves as CSV                                                │
# └─────────────────────────────────────────────────────────────┘
@app.route('/clean-with-ai', methods=['POST'])
def clean_with_ai():
    
    # Sample json data for testing because ai processing takes time
    # read cleaned data from the data directory and return it as json.
    # clean_data_file = os.path.join(DATA_DIR, 'cleaned_data.txt')
    # if not os.path.exists(clean_data_file):
    #     return jsonify({'error': 'No cleaned data file found'}), 404

    # with open(clean_data_file, 'r', encoding='utf-8') as file:
    #     try:
    #         data = json.load(file)  # ✅ Parse the JSON content
    #     except json.JSONDecodeError:
    #         return jsonify({'error': 'Invalid JSON format in the file'}), 400

    # if not data:
    #     return jsonify({'error': 'Cleaned data file is empty'}), 400

    # # ✅ Return it directly
    # return jsonify({'content': data}), 200

    
    # get extracted_text, prompt from request
    user_api_key = request.json.get('user_api_key') or os.getenv('GEMINI_API_KEY')
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
    
    # Convert AI response string to Python object
    try:
        content = json.loads(content)
    except json.JSONDecodeError:
        return jsonify({'error': 'AI response is not valid JSON'}), 500


    # Save parsed JSON data to file
    cleaned_text_path = os.path.join(DATA_DIR, 'cleaned_data.json')
    with open(cleaned_text_path, 'w', encoding='utf-8') as file:
        json.dump(content, file, ensure_ascii=False, indent=2)

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
        config={
            "response_mime_type": "application/json",
            # "response_schema": list[Recipe],
        },
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
