import os
import json
from google import genai

class AIService:
    @staticmethod
    def process_with_gemini(user_api_key, prompt):
        """Process text using Gemini AI"""
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )
        return response.text.strip()
    
    @staticmethod
    def process_with_openai(user_api_key, prompt):
        """Process text using OpenAI (not implemented yet)"""
        return "OpenAI processing is not implemented yet. Please use Gemini AI."
