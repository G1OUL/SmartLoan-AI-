import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.database import db
from app.seed_data import seed_database

jwt = JWTManager()

def create_app(config_class=Config):
    # The combined Render deployment serves the Vite build from the repository root.
    frontend_dist = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')
    )
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    # Register API blueprints
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
            'service': 'SmartLoan AI REST API + Web App',
            'version': '1.0.0'
        }), 200

    # Serve the React app and its built assets from this same web service.
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path == 'health' or path.startswith('api/'):
            return jsonify({'error': 'Not found'}), 404
        if not os.path.isdir(frontend_dist):
            return jsonify({
                'error': 'Frontend build not found',
                'hint': 'Check the Render build command'
            }), 503
        requested_file = os.path.join(frontend_dist, path)
        if path and os.path.isfile(requested_file):
            return send_from_directory(frontend_dist, path)
        return send_from_directory(frontend_dist, 'index.html')

    with app.app_context():
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        seed_database()

    return app
