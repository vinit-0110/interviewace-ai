from flask import Blueprint, request, jsonify
from models import db, User, Interview, Question, Answer
from auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    """
    Returns platform-wide statistics for the admin dashboard.
    """
    try:
        total_users = User.query.count()
        total_interviews = Interview.query.count()
        total_questions = Question.query.count()
        
        # Calculate global averages
        interviews_with_score = Interview.query.filter(Interview.score > 0).all()
        avg_score = 0
        avg_tech = 0
        avg_comm = 0
        avg_conf = 0
        
        if interviews_with_score:
            avg_score = int(sum(i.score for i in interviews_with_score) / len(interviews_with_score))
            avg_tech = int(sum(i.technical_score for i in interviews_with_score) / len(interviews_with_score))
            avg_comm = int(sum(i.communication_score for i in interviews_with_score) / len(interviews_with_score))
            avg_conf = int(sum(i.confidence_score for i in interviews_with_score) / len(interviews_with_score))
            
        # Category distribution
        categories_db = db.session.query(
            Interview.category, db.func.count(Interview.id)
        ).group_by(Interview.category).all()
        
        category_distribution = {cat: count for cat, count in categories_db}
        
        # Recent activities
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_sessions = Interview.query.order_by(Interview.date.desc()).limit(5).all()
        
        # Construct summary
        recent_sessions_data = []
        for s in recent_sessions:
            user = db.session.get(User, s.user_id)
            recent_sessions_data.append({
                "id": s.id,
                "user_name": user.name if user else "Unknown User",
                "category": s.category,
                "score": s.score,
                "date": s.date.isoformat()
            })
            
        return jsonify({
            "total_users": total_users,
            "total_interviews": total_interviews,
            "total_questions": total_questions,
            "averages": {
                "overall_score": avg_score,
                "technical_score": avg_tech,
                "communication_score": avg_comm,
                "confidence_score": avg_conf
            },
            "category_distribution": category_distribution,
            "recent_users": [u.to_dict() for u in recent_users],
            "recent_sessions": recent_sessions_data
        }), 200
    except Exception as e:
        return jsonify({"message": "Failed to compile admin stats.", "error": str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users]), 200
    except Exception as e:
        return jsonify({"message": "Failed to retrieve users.", "error": str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
        
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete user.", "error": str(e)}), 500

@admin_bp.route('/questions', methods=['GET'])
@admin_required()
def get_all_questions():
    try:
        questions = Question.query.order_by(Question.category, Question.difficulty).all()
        return jsonify([q.to_dict() for q in questions]), 200
    except Exception as e:
        return jsonify({"message": "Failed to retrieve questions.", "error": str(e)}), 500

@admin_bp.route('/questions', methods=['POST'])
@admin_required()
def create_question():
    data = request.get_json() or {}
    category = data.get('category', '').strip()
    difficulty = data.get('difficulty', '').strip()
    question_text = data.get('question', '').strip()
    
    if not category or not difficulty or not question_text:
        return jsonify({"message": "Category, difficulty, and question text are required."}), 400
        
    try:
        question = Question(
            category=category,
            difficulty=difficulty,
            question=question_text
        )
        db.session.add(question)
        db.session.commit()
        return jsonify({
            "message": "Question added to bank successfully.",
            "question": question.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to add question.", "error": str(e)}), 500

@admin_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@admin_required()
def delete_question(question_id):
    question = db.session.get(Question, question_id)
    if not question:
        return jsonify({"message": "Question not found."}), 404
        
    try:
        db.session.delete(question)
        db.session.commit()
        return jsonify({"message": "Question deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete question.", "error": str(e)}), 500
