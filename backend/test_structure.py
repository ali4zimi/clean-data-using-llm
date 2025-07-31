#!/usr/bin/env python3
"""
Test script to verify the modular Flask application structure
"""

def test_imports():
    """Test all module imports"""
    print("🔍 Testing module imports...")
    
    try:
        from config import Config
        print("✅ Config module imported successfully")
        
        from services.ai_service import AIService
        print("✅ AI Service module imported successfully")
        
        from services.pdf_service import PDFService
        print("✅ PDF Service module imported successfully")
        
        from services.file_service import FileService
        print("✅ File Service module imported successfully")
        
        from services.template_service import TemplateService
        print("✅ Template Service module imported successfully")
        
        from routes.upload_routes import upload_bp
        print("✅ Upload routes module imported successfully")
        
        from routes.processing_routes import processing_bp
        print("✅ Processing routes module imported successfully")
        
        from routes.template_routes import template_bp
        print("✅ Template routes module imported successfully")
        
        from utils.validators import validate_file_upload
        print("✅ Validators module imported successfully")
        
        from utils.constants import AI_PROVIDERS
        print("✅ Constants module imported successfully")
        
        from models.schemas import UploadResponse
        print("✅ Schemas module imported successfully")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    return True

def test_flask_app():
    """Test Flask app creation"""
    print("\n🔍 Testing Flask app creation...")
    
    try:
        from app import create_app
        from config import Config
        
        app = create_app()
        
        print(f"✅ Flask app created successfully: {app.name}")
        print(f"✅ Registered blueprints: {list(app.blueprints.keys())}")
        
        # Test configuration
        Config.init_app(app)
        print("✅ Configuration initialized successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Flask app creation error: {e}")
        return False

def test_services():
    """Test service functionality"""
    print("\n🔍 Testing service functionality...")
    
    try:
        from services.template_service import TemplateService
        templates = TemplateService.get_prompt_templates()
        print(f"✅ Template service works: {len(templates)} templates available")
        
        return True
        
    except Exception as e:
        print(f"❌ Service test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting modular Flask application verification...\n")
    
    success = True
    success &= test_imports()
    success &= test_flask_app()
    success &= test_services()
    
    print("\n" + "="*50)
    if success:
        print("🎉 All tests passed! The modular structure is working correctly.")
        print("✅ Your Flask application is ready to run!")
    else:
        print("❌ Some tests failed. Please check the error messages above.")
    print("="*50)

if __name__ == "__main__":
    main()
