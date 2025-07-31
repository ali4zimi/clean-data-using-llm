#!/usr/bin/env python3
"""
Test script to simulate frontend API requests with different API key scenarios
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_api_endpoint(endpoint, payload, description):
    """Test an API endpoint with given payload"""
    print(f"\n🧪 Testing: {description}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=30)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {str(e)}")
        return False
    except json.JSONDecodeError:
        print(f"   ❌ Invalid JSON response: {response.text}")
        return False

def main():
    print("=== Frontend API Key Integration Test ===")
    
    # Test 1: API key from frontend (should work)
    test1_payload = {
        "user_api_key": "AIzaSyDF2GrZUUyPk8naOxtijDvLnXNK-7B9vYM",
        "user_prompt": "Extract customer data with fields: name, email, phone",
        "extracted_text": "John Doe, email: john@example.com, phone: 123-456-7890",
        "ai_provider": "gemini"
    }
    
    test1_result = test_api_endpoint(
        "/clean-with-ai",
        test1_payload,
        "Frontend API key provided"
    )
    
    # Test 2: No API key (should fall back to environment)
    test2_payload = {
        "user_prompt": "Extract customer data with fields: name, email, phone", 
        "extracted_text": "Jane Smith, email: jane@example.com, phone: 987-654-3210",
        "ai_provider": "gemini"
    }
    
    test2_result = test_api_endpoint(
        "/clean-with-ai",
        test2_payload,
        "No API key provided (environment fallback)"
    )
    
    # Test 3: Invalid API key (should fail)
    test3_payload = {
        "user_api_key": "invalid_api_key_123",
        "user_prompt": "Extract customer data",
        "extracted_text": "Some text here",
        "ai_provider": "gemini"
    }
    
    test3_result = test_api_endpoint(
        "/clean-with-ai",
        test3_payload,
        "Invalid API key provided"
    )
    
    # Test 4: Missing required fields
    test4_payload = {
        "user_api_key": "AIzaSyDF2GrZUUyPk8naOxtijDvLnXNK-7B9vYM",
        "user_prompt": "Extract data"
        # Missing extracted_text
    }
    
    test4_result = test_api_endpoint(
        "/clean-with-ai", 
        test4_payload,
        "Missing required fields"
    )
    
    print(f"\n=== Test Results Summary ===")
    print(f"✅ Frontend API key: {'PASS' if test1_result else 'FAIL'}")
    print(f"✅ Environment fallback: {'PASS' if test2_result else 'FAIL'}")
    print(f"❌ Invalid API key (expected fail): {'PASS' if not test3_result else 'FAIL'}")
    print(f"❌ Missing fields (expected fail): {'PASS' if not test4_result else 'FAIL'}")
    
    overall_success = test1_result and test2_result and not test3_result and not test4_result
    print(f"\n🎯 Overall Test Result: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")

if __name__ == "__main__":
    print("Waiting 3 seconds for Flask app to fully start...")
    time.sleep(3)
    main()
