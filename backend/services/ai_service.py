import os
import json
from flask import jsonify
from google import genai

class AIService:
    @staticmethod
    def process_with_gemini(user_api_key, prompt):
        # Process text using Gemini AI
        if not user_api_key:
            # then try to get the API key from environment variable
            user_api_key = os.getenv('GEMINI_API_KEY')
            if not user_api_key:
                raise ValueError("Gemini API key is required")
        try:
            # Set the API key in environment for genai client
            client = genai.Client(api_key=user_api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                },
            )
            return response.text.strip()
        except Exception as e:
            # Handle API key errors specifically
            if "API_KEY" in str(e) or "authentication" in str(e).lower():
                raise ValueError(f"Invalid Gemini API key: {str(e)}")
            else:
                raise Exception(f"Gemini API error: {str(e)}")
    
    @staticmethod
    def process_with_openai(user_api_key, prompt):
        """Process text using OpenAI (not implemented yet)"""
        return "OpenAI processing is not implemented yet. Please use Gemini AI."
