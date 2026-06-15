import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Roadmap
from services.ai_service import AIService

roadmap_bp = Blueprint('roadmap', __name__)

@roadmap_bp.route('', methods=['GET'])
@jwt_required()
def get_roadmap():
    user_id = get_jwt_identity()
    # Return the most recently created roadmap
    roadmap = Roadmap.query.filter_by(user_id=int(user_id)).order_by(Roadmap.created_at.desc()).first()
    if not roadmap:
        return jsonify({"message": "No roadmap found. Complete a practice session or submit weak areas to generate one."}), 404
    return jsonify(roadmap.to_dict()), 200

@roadmap_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_roadmap():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    skill = data.get('skill', 'General Web Development').strip()
    weak_areas = data.get('weak_areas', '').strip()
    
    if not weak_areas:
        return jsonify({"message": "Weak areas list is required to generate a custom roadmap."}), 400
        
    try:
        # Generate roadmap content using AI or local heuristic fallback
        roadmap_content = AIService.generate_roadmap(weak_areas, skill)
        
        # Save to database
        roadmap = Roadmap(
            user_id=int(user_id),
            content=json.dumps(roadmap_content)
        )
        db.session.add(roadmap)
        db.session.commit()
        
        return jsonify({
            "message": "Custom learning roadmap generated successfully.",
            "roadmap": roadmap.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to generate roadmap.", "error": str(e)}), 500
