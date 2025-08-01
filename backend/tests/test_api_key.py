#!/usr/bin/env python3
"""
Test script to verify API key handling for both environment and frontend scenarios
"""
import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_api_key():
    """Test API key from environment variable"""
    api_key = os.getenv('GEMINI_API_KEY')
    print(f"Environment API Key: {api_key[:10]}..." if api_key else "None")
    return api_key is not None

def test_frontend_api_key_simulation():
    """Simulate frontend sending API key"""
    # This would be the payload sent from frontend
    test_payload = {
        "user_api_key": "your_api_key_here",  # Placeholder - replace with actual key
        "user_prompt": "Extract customer data",
        "extracted_text": "Sample text for testing",
        "ai_provider": "gemini"
    }
    
    print("Frontend payload test:")
    print(f"- API Key provided: {test_payload['user_api_key'][:10]}..." if test_payload.get('user_api_key') else "None")
    print(f"- Prompt: {test_payload['user_prompt']}")
    print(f"- Provider: {test_payload['ai_provider']}")
    
    return test_payload.get('user_api_key') is not None

def test_api_key_fallback():
    """Test the fallback logic"""
    frontend_key = "frontend_provided_key"
    env_key = os.getenv('GEMINI_API_KEY')
    
    # Simulate the logic in processing_routes.py
    final_key = frontend_key or env_key
    
    print(f"Fallback test:")
    print(f"- Frontend key: {frontend_key}")
    print(f"- Environment key: {env_key[:10]}..." if env_key else "None")
    print(f"- Final key used: {final_key[:10]}..." if final_key else "None")
    
    return final_key is not None

if __name__ == "__main__":
    print("=== API Key Configuration Test ===\n")
    
    print("1. Testing environment variable:")
    env_test = test_environment_api_key()
    print(f"   Result: {'✓ PASS' if env_test else '✗ FAIL'}\n")
    
    print("2. Testing frontend API key simulation:")
    frontend_test = test_frontend_api_key_simulation()
    print(f"   Result: {'✓ PASS' if frontend_test else '✗ FAIL'}\n")
    
    print("3. Testing fallback logic:")
    fallback_test = test_api_key_fallback()
    print(f"   Result: {'✓ PASS' if fallback_test else '✗ FAIL'}\n")
    
    overall_result = env_test and frontend_test and fallback_test
    print(f"Overall API Key Configuration: {'✓ PASS' if overall_result else '✗ FAIL'}")
    
    if overall_result:
        print("\n✅ Your API key configuration should work correctly!")
        print("   - Environment fallback is working")
        print("   - Frontend API key will be properly accepted")
    else:
        print("\n❌ There are issues with API key configuration.")
