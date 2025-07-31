import os
import json
from config import Config

class FileService:
    @staticmethod
    def save_json_data(data, filename):
        """Save data as JSON file"""
        file_path = os.path.join(Config.DATA_DIR, filename)
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=2)
        return file_path
    
    @staticmethod
    def load_json_data(filename):
        """Load JSON data from file"""
        file_path = os.path.join(Config.DATA_DIR, filename)
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return None
    
    @staticmethod
    def file_exists(folder, filename):
        """Check if file exists in specified folder"""
        file_path = os.path.join(folder, filename)
        return os.path.exists(file_path)
