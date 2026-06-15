import os
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Interview, Answer
from services.ai_service import AIService
from services.pdf_service import PDFService
from services.voice_service import VoiceService

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/start', methods=['POST'])
@jwt_required()
def start_interview():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    category = data.get('category', 'Python').strip()
    difficulty = data.get('difficulty', 'Beginner').strip()
    questions_count = int(data.get('questions_count', 5))
    
    try:
        # Generate interview questions dynamically
        questions = AIService.generate_questions(category, difficulty, questions_count)
        
        # Create Interview session
        interview = Interview(
            user_id=int(user_id),
            category=category,
            difficulty=difficulty,
            score=0
        )
        db.session.add(interview)
        db.session.commit()
        
        return jsonify({
            "interview": interview.to_dict(),
            "questions": questions
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to start interview.", "error": str(e)}), 500

@interview_bp.route('/submit-answer', methods=['POST'])
@jwt_required()
def submit_answer():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    interview_id = data.get('interview_id')
    question_text = data.get('question_text', '').strip()
    user_answer = data.get('answer', '').strip()
    
    if not interview_id or not question_text:
        return jsonify({"message": "interview_id and question_text are required."}), 400
        
    interview = db.session.get(Interview, int(interview_id))
    if not interview or interview.user_id != int(user_id):
        return jsonify({"message": "Interview not found or unauthorized."}), 404
        
    try:
        # Perform NLP evaluation
        eval_result = AIService.evaluate_answer(question_text, user_answer)
        
        # Save Answer record
        ans_record = Answer(
            interview_id=interview.id,
            question_text=question_text,
            answer=user_answer,
            score=eval_result.get('score', 0),
            accuracy=eval_result.get('accuracy', 0),
            technical_depth=eval_result.get('technical_depth', 0),
            communication=eval_result.get('communication', 0),
            clarity=eval_result.get('clarity', 0),
            grammar=eval_result.get('grammar', 0),
            relevance=eval_result.get('relevance', 0),
            feedback_strengths=eval_result.get('feedback_strengths', ''),
            feedback_weaknesses=eval_result.get('feedback_weaknesses', ''),
            suggested_answer=eval_result.get('suggested_answer', ''),
            improvement_tips=eval_result.get('improvement_tips', '')
        )
        db.session.add(ans_record)
        db.session.commit()
        
        return jsonify({
            "message": "Answer submitted and evaluated.",
            "answer": ans_record.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to evaluate answer.", "error": str(e)}), 500

@interview_bp.route('/finish', methods=['POST'])
@jwt_required()
def finish_interview():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    interview_id = data.get('interview_id')
    
    if not interview_id:
        return jsonify({"message": "interview_id is required."}), 400
        
    interview = db.session.get(Interview, int(interview_id))
    if not interview or interview.user_id != int(user_id):
        return jsonify({"message": "Interview not found or unauthorized."}), 404
        
    answers = Answer.query.filter_by(interview_id=interview.id).all()
    if not answers:
        return jsonify({"message": "No answers found for this session."}), 400
        
    try:
        # Calculate aggregate scores
        total_score = sum(a.score for a in answers)
        total_tech = sum(a.technical_depth for a in answers)
        total_comm = sum(a.communication for a in answers)
        # Average clarity and relevance makes a good confidence score
        total_conf = sum((a.clarity + a.relevance) // 2 for a in answers)
        
        count = len(answers)
        
        interview.score = int(total_score / count)
        interview.technical_score = int(total_tech / count)
        interview.communication_score = int(total_comm / count)
        interview.confidence_score = int(total_conf / count)
        
        db.session.commit()
        
        return jsonify({
            "message": "Interview completed successfully.",
            "interview": interview.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to complete interview.", "error": str(e)}), 500

@interview_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    interviews = Interview.query.filter_by(user_id=int(user_id)).order_by(Interview.date.desc()).all()
    return jsonify([i.to_dict() for i in interviews]), 200

@interview_bp.route('/<int:interview_id>', methods=['GET'])
@jwt_required()
def get_interview(interview_id):
    user_id = get_jwt_identity()
    interview = db.session.get(Interview, interview_id)
    
    if not interview or (interview.user_id != int(user_id) and db.session.get(User, int(user_id)).role != 'admin'):
        return jsonify({"message": "Interview not found or unauthorized."}), 404
        
    answers = Answer.query.filter_by(interview_id=interview.id).all()
    
    return jsonify({
        "interview": interview.to_dict(),
        "answers": [a.to_dict() for a in answers]
    }), 200

@interview_bp.route('/<int:interview_id>/pdf', methods=['GET'])
@jwt_required()
def get_interview_pdf(interview_id):
    user_id = get_jwt_identity()
    interview = db.session.get(Interview, interview_id)
    
    if not interview or (interview.user_id != int(user_id) and db.session.get(User, int(user_id)).role != 'admin'):
        return jsonify({"message": "Interview not found or unauthorized."}), 404
        
    user = db.session.get(User, interview.user_id)
    answers = Answer.query.filter_by(interview_id=interview.id).all()
    
    # Define report file path
    filename = f"report_interview_{interview.id}.pdf"
    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'reports')
    report_path = os.path.join(reports_dir, filename)
    
    try:
        PDFService.generate_interview_report(interview, user, answers, report_path)
        return send_file(
            report_path,
            as_attachment=True,
            download_name=f"InterviewAce_Report_{interview.category}_{interview.id}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({"message": "Failed to generate report PDF.", "error": str(e)}), 500

@interview_bp.route('/transcribe', methods=['POST'])
@jwt_required()
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"message": "No audio file provided."}), 400
        
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"message": "Empty file name."}), 400
        
    # Temporary file storage for transcription
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, audio_file.filename)
    
    try:
        audio_file.save(temp_path)
        result = VoiceService.transcribe_audio(temp_path)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        if result.get('success'):
            return jsonify({"success": True, "text": result.get('text')}), 200
        else:
            return jsonify({"success": False, "message": result.get('message')}), 400
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"message": "Audio transcription failed.", "error": str(e)}), 500
