import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, Question
from routes.auth_routes import auth_bp
from routes.interview_routes import interview_bp
from routes.skill_routes import skill_bp
from routes.roadmap_routes import roadmap_bp
from routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    # Allow all headers, methods, and origins for local development
    CORS(app, supports_credentials=True)
    
    # Initialize Database
    db.init_app(app)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    # Custom JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "The token has expired.", "error": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Signature verification failed.", "error": "token_invalid"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Request does not contain an access token.", "error": "authorization_required"}), 401
    
    # Register Route Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(interview_bp, url_prefix='/api/interviews')
    app.register_blueprint(skill_bp, url_prefix='/api/skills')
    app.register_blueprint(roadmap_bp, url_prefix='/api/roadmaps')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Home Page Endpoint
    @app.route('/')
    def index():
        return jsonify({
            "app": "InterviewAce AI API",
            "status": "Online",
            "version": "1.0.0"
        })
        
    # Database table creation and seeding
    with app.app_context():
        db.create_all()
        seed_questions()
        
    return app

def seed_questions():
    """
    Seeds the database with standard default questions from our preset pool.
    """
    from services.ai_service import PRESET_QUESTIONS
    
    # Check if we need to seed missing questions
    print("Checking database for missing default interview questions...")
    seeded_count = 0
    for category, difficulties in PRESET_QUESTIONS.items():
        for difficulty, questions in difficulties.items():
            for q_text in questions:
                # Check if this exact question text exists in this category/difficulty
                exists = Question.query.filter_by(
                    category=category,
                    difficulty=difficulty,
                    question=q_text
                ).first()
                
                if not exists:
                    question = Question(
                        category=category,
                        difficulty=difficulty,
                        question=q_text
                    )
                    db.session.add(question)
                    seeded_count += 1
                    
    if seeded_count > 0:
        try:
            db.session.commit()
            print(f"Successfully seeded {seeded_count} new questions.")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding database questions: {e}")
    else:
        print("Database is already up to date with all preset questions.")

if __name__ == '__main__':
    app = create_app()
    # Read port from config and run
    app.run(host='0.0.0.0', port=app.config['PORT'], debug=app.config['DEBUG'])
