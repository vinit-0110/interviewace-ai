import unittest
import json
import os
from app import create_app
from models import db, User, Interview, Answer, SkillAssessment, Roadmap

class TestInterviewAceAPI(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        self.app = create_app()
        self.app.config['TESTING'] = True
        # Use a temporary SQLite database for testing
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_interviewace.db'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            
    def tearDown(self):
        with self.app.app_context():
            db.drop_all()
        # Clean up database file
        if os.path.exists('instance/test_interviewace.db'):
            try:
                os.remove('instance/test_interviewace.db')
            except Exception:
                pass
            
    def test_auth_and_interview_workflow(self):
        # 1. Register User
        reg_payload = {
            "name": "Verify Candidate",
            "email": "verify@example.com",
            "password": "verifypassword"
        }
        res = self.client.post('/api/auth/register', 
                               data=json.dumps(reg_payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'verify@example.com')
        token = data['token']
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # 2. Start Interview Session
        start_payload = {
            "category": "Python",
            "difficulty": "Beginner",
            "questions_count": 2
        }
        res = self.client.post('/api/interviews/start',
                               data=json.dumps(start_payload),
                               headers=headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('interview', data)
        self.assertIn('questions', data)
        self.assertEqual(len(data['questions']), 2)
        interview_id = data['interview']['id']
        question_text = data['questions'][0]['question']
        
        # 3. Submit Answer
        submit_payload = {
            "interview_id": interview_id,
            "question_text": question_text,
            "answer": "A list in Python is mutable and can be modified after creation, while a tuple is immutable and constant."
        }
        res = self.client.post('/api/interviews/submit-answer',
                               data=json.dumps(submit_payload),
                               headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('answer', data)
        self.assertTrue(data['answer']['score'] > 0)
        
        # Submit second answer
        submit_payload2 = {
            "interview_id": interview_id,
            "question_text": "Second question dummy text?",
            "answer": "Dummy answer response."
        }
        self.client.post('/api/interviews/submit-answer',
                         data=json.dumps(submit_payload2),
                         headers=headers)
        
        # 4. Finish Interview
        finish_payload = {
            "interview_id": interview_id
        }
        res = self.client.post('/api/interviews/finish',
                               data=json.dumps(finish_payload),
                               headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('interview', data)
        self.assertTrue(data['interview']['score'] > 0)
        
        # 5. Generate Roadmap
        roadmap_payload = {
            "skill": "Python",
            "weak_areas": "Decorators, Generative Models"
        }
        res = self.client.post('/api/roadmaps/generate',
                               data=json.dumps(roadmap_payload),
                               headers=headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('roadmap', data)
        self.assertIn('weekly_study_plan', data['roadmap']['content'])

if __name__ == '__main__':
    unittest.main()
