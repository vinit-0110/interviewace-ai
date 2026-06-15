from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    interviews = db.relationship('Interview', backref='user', lazy=True, cascade="all, delete-orphan")
    skill_assessments = db.relationship('SkillAssessment', backref='user', lazy=True, cascade="all, delete-orphan")
    roadmaps = db.relationship('Roadmap', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Interview(db.Model):
    __tablename__ = 'interviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g. 'Python', 'HR Interview'
    difficulty = db.Column(db.String(50), nullable=False)  # 'Beginner', 'Intermediate', 'Advanced'
    score = db.Column(db.Integer, default=0)  # Overall interview score (0-100)
    confidence_score = db.Column(db.Integer, default=0)
    communication_score = db.Column(db.Integer, default=0)
    technical_score = db.Column(db.Integer, default=0)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    answers = db.relationship('Answer', backref='interview', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'difficulty': self.difficulty,
            'score': self.score,
            'confidence_score': self.confidence_score,
            'communication_score': self.communication_score,
            'technical_score': self.technical_score,
            'date': self.date.isoformat(),
            'answers_count': len(self.answers)
        }

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    question = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'difficulty': self.difficulty,
            'question': self.question
        }

class Answer(db.Model):
    __tablename__ = 'answers'
    
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)  # Store actual question text
    answer = db.Column(db.Text, nullable=False)         # User's answer
    score = db.Column(db.Integer, default=0)             # AI evaluated score (0-100)
    
    # Detailed NLP metrics
    accuracy = db.Column(db.Integer, default=0)
    technical_depth = db.Column(db.Integer, default=0)
    communication = db.Column(db.Integer, default=0)
    clarity = db.Column(db.Integer, default=0)
    grammar = db.Column(db.Integer, default=0)
    relevance = db.Column(db.Integer, default=0)
    
    feedback_strengths = db.Column(db.Text)             # Comma-separated or markdown list
    feedback_weaknesses = db.Column(db.Text)            # Comma-separated or markdown list
    suggested_answer = db.Column(db.Text)               # AI generated sample good answer
    improvement_tips = db.Column(db.Text)               # Bulleted list

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'question_text': self.question_text,
            'answer': self.answer,
            'score': self.score,
            'metrics': {
                'accuracy': self.accuracy,
                'technical_depth': self.technical_depth,
                'communication': self.communication,
                'clarity': self.clarity,
                'grammar': self.grammar,
                'relevance': self.relevance
            },
            'feedback_strengths': self.feedback_strengths,
            'feedback_weaknesses': self.feedback_weaknesses,
            'suggested_answer': self.suggested_answer,
            'improvement_tips': self.improvement_tips
        }

class SkillAssessment(db.Model):
    __tablename__ = 'skill_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill = db.Column(db.String(100), nullable=False)  # e.g. 'Python', 'React', 'SQL'
    score = db.Column(db.Integer, nullable=False)      # Percentage score (0-100)
    level = db.Column(db.String(50), default='Beginner') # 'Beginner', 'Intermediate', 'Advanced'
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill': self.skill,
            'score': self.score,
            'level': self.level,
            'date': self.date.isoformat()
        }

class Roadmap(db.Model):
    __tablename__ = 'roadmaps'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)       # JSON string containing the generated roadmap
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        try:
            content_json = json.loads(self.content)
        except Exception:
            content_json = self.content
            
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': content_json,
            'created_at': self.created_at.isoformat()
        }
