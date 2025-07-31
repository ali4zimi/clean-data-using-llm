from flask import Flask, jsonify, render_template
from flask_cors import CORS
from config import Config
from routes.upload_routes import upload_bp
from routes.processing_routes import processing_bp
from routes.template_routes import template_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Initialize configuration
    Config.init_app(app)
    
    # Register blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(processing_bp)
    app.register_blueprint(template_bp)
    
    @app.route('/')
    def home():
        return jsonify({'message': 'Welcome to the PDF Text Extractor API'})
    
    @app.route('/upload', methods=['GET'])
    def index():
        return render_template('index.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
