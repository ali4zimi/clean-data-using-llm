def validate_file_upload(file):
    """Validate uploaded file"""
    if not file:
        return False, "No file provided"
    
    if file.filename == '':
        return False, "No selected file"
    
    if not file.filename.endswith('.pdf'):
        return False, "Invalid file format. Only PDF files are allowed."
    
    return True, "Valid file"

def validate_ai_request(data):
    """Validate AI processing request"""
    required_fields = ['user_prompt', 'extracted_text']
    
    for field in required_fields:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    
    ai_provider = data.get('ai_provider', 'gemini')
    if ai_provider not in ['gemini', 'openai']:
        return False, "Invalid AI provider. Must be 'gemini' or 'openai'"
    
    return True, "Valid request"
