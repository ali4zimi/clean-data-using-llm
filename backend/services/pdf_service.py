import os
from PyPDF2 import PdfReader
from config import Config

class PDFService:
    @staticmethod
    def extract_text_from_pdf(pdf_path):
        """Extract text from PDF file"""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError("PDF file not found")
        
        reader = PdfReader(pdf_path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text
    
    @staticmethod
    def save_extracted_text(text, filename='extracted_text.txt'):
        """Save extracted text to file"""
        text_file_path = os.path.join(Config.DATA_DIR, filename)
        with open(text_file_path, 'w', encoding='utf-8') as file:
            file.write(text)
        return text_file_path
