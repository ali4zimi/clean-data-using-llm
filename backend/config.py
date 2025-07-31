import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UPLOAD_FOLDER = 'uploads'
    DATA_DIR = 'data'
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    @staticmethod
    def init_app(app):
        # Ensure directories exist
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.DATA_DIR, exist_ok=True)
