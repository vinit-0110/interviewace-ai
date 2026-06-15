from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from auth import generate_user_token, verify_google_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with this email already exists."}), 409
        
    try:
        user = User(name=name, email=email)
        user.set_password(password)
        
        # If database is empty, make the first user an admin (for convenience)
        if User.query.count() == 0:
            user.role = 'admin'
            
        db.session.add(user)
        db.session.commit()
        
        token = generate_user_token(user)
        return jsonify({
            "message": "User registered successfully.",
            "token": token,
            "user": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Registration failed.", "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password."}), 401
        
    token = generate_user_token(user)
    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    data = request.get_json() or {}
    token = data.get('token', '')
    
    if not token:
        return jsonify({"message": "Google authentication token is required."}), 400
        
    google_info = verify_google_token(token)
    if not google_info:
        return jsonify({"message": "Invalid Google token authentication failed."}), 401
        
    email = google_info.get('email', '').strip().lower()
    name = google_info.get('name', 'Google User').strip()
    
    user = User.query.filter_by(email=email).first()
    
    try:
        if not user:
            # Create a new user since it's a new email
            user = User(name=name, email=email)
            # Set a random strong password for safety
            import secrets
            user.set_password(secrets.token_hex(16))
            
            db.session.add(user)
            db.session.commit()
            
        jwt_token = generate_user_token(user)
        return jsonify({
            "message": "Google login successful.",
            "token": jwt_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Google login database registration failed.", "error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"message": "User not found."}), 404
        
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    password = data.get('password', '')
    
    if name:
        user.name = name
    if password:
        user.set_password(password)
        
    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully.",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update profile.", "error": str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({"message": "Email is required."}), 400
        
    user = User.query.filter_by(email=email).first()
    # For security reasons, do not explicitly confirm if user exists
    # but mock send password reset link
    if user:
        print(f"[MOCK EMAIL] Send password reset instructions to: {email}")
        
    return jsonify({
        "message": "If this email is registered, we have sent instructions to reset your password."
    }), 200
