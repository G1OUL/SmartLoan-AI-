import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.database import db
from app.seed_data import seed_database

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.predict import predict_bp
    from app.routes.applications import applications_bp
    from app.routes.calculator import calculator_bp
    from app.routes.banks import banks_bp
    from app.routes.documents import documents_bp
    from app.routes.pdf_report import pdf_bp
    from app.routes.admin import admin_bp
    from app.routes.chat import chat_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(calculator_bp)
    app.register_blueprint(banks_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(pdf_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(chat_bp)
    
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'SmartLoan AI REST API',
            'version': '1.0.0'
        }), 200
        
    with app.app_context():
        # Ensure uploads folder exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        # Create tables and seed data
        seed_database()
        
    return app
