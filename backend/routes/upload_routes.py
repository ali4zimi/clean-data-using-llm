import os
from flask import Blueprint, request, jsonify, send_from_directory
from config import Config
from services.file_service import FileService

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle PDF file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        pdf_path = os.path.join(Config.UPLOAD_FOLDER, "uploaded_file.pdf")
        file.save(pdf_path)
        return jsonify({'message': 'File uploaded successfully', 'file_path': pdf_path}), 200
    
    return jsonify({'error': 'Invalid file format. Only PDF files are allowed.'}), 400

@upload_bp.route('/download-pdf-file', methods=['GET'])
def download_uploaded_file():
    """Download uploaded PDF file"""
    if not FileService.file_exists(Config.UPLOAD_FOLDER, 'uploaded_file.pdf'):
        return jsonify({'error': 'No PDF file found'}), 404
    return send_from_directory(Config.UPLOAD_FOLDER, 'uploaded_file.pdf', as_attachment=True)

@upload_bp.route('/uploaded-file-url', methods=['GET'])
def get_uploaded_file_url():
    """Get uploaded file URL"""
    pdf_file = os.path.join(Config.UPLOAD_FOLDER, 'uploaded_file.pdf')
    if not os.path.exists(pdf_file):
        return None
    return jsonify({'file_url': pdf_file}), 200
