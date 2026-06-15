# InterviewAce AI - AI-Powered Interview Preparation Assistant

**InterviewAce AI** is a modern, responsive SaaS web application designed to help students and freshers prepare for technical and HR interviews. It uses AI to dynamically generate specialized questions, perform detailed NLP answer evaluations, build customized weekly study plans, track candidate assessments, and visualize progress dashboards.

---

## Technical Architecture

* **Frontend**: React.js, Tailwind CSS (v3), Framer Motion, Chart.js, Lucide Icons, and Vite.
* **Backend**: Python Flask (REST API), Flask-SQLAlchemy, Flask-CORS, Flask-JWT-Extended (Authentication).
* **Database**: SQLite (local development), ready for immediate PostgreSQL deployment.
* **AI Engines**: OpenAI API integration (GPT-3.5 and Whisper) with high-fidelity local heuristic fallbacks when credentials are not configured.

---

## Directory Structure

```
interviewace-ai/
├── README.md               # Setup & deployment guides
├── backend/                # Python Flask REST API
│   ├── app.py              # Application entry & database initialization
│   ├── config.py           # Configuration configurations
│   ├── models.py           # Database tables
│   ├── auth.py             # JWT & Google OAuth verification
│   ├── requirements.txt    # Pip packages
│   ├── verify_api.py       # Unit test suite
│   ├── routes/             # Endpoints
│   │   ├── auth_routes.py
│   │   ├── interview_routes.py
│   │   ├── skill_routes.py
│   │   ├── roadmap_routes.py
│   │   └── admin_routes.py
│   └── services/           # Helper scripts
│       ├── ai_service.py   # OpenAI GPT-3.5 evaluator
│       ├── voice_service.py# Whisper transcription
│       └── pdf_service.py  # ReportLab PDF generator
└── frontend/               # React Vite Application
    ├── package.json        # NPM dependencies
    ├── tailwind.config.js  # Styling setups
    ├── index.html          # Web page wrapper
    └── src/
        ├── App.jsx         # Client-side router
        ├── index.css       # Tailwind directives & glassmorphic utilities
        ├── context/        # Auth & theme contexts
        ├── components/     # Layout, voice capture buttons
        └── pages/          # Student and admin screens
```

---

## Local Setup Instructions

### 1. Backend Installation

Prerequisites: Python 3.10+

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the API verification test suite
python verify_api.py

# Launch the Flask server (runs on http://127.0.0.1:5000)
python app.py
```

### 2. Frontend Installation

Prerequisites: Node.js v18+

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Build/verify production bundling
npm run build

# Start the local development server (runs on http://localhost:5173)
npm run dev
```

---

## Environment Variables (.env)

Create a `.env` file in the `backend/` directory (see `backend/.env.example`):

```env
PORT=5000
DEBUG=True
SECRET_KEY=your-flask-session-key
JWT_SECRET_KEY=your-jwt-auth-key

# Optional: Set connection string to switch SQLite to PostgreSQL
# DATABASE_URL=postgresql://username:password@localhost:5432/interviewace

# Optional: Add OpenAI API key for real AI evaluations (falls back to local evaluation if empty)
OPENAI_API_KEY=your-openai-api-key

# Optional: Add Google Client ID to enable secure Google logins
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

---

## Database Tables

The SQLite/PostgreSQL schema consists of:

1. **Users** (`users`): `id`, `name`, `email`, `password` (hashed), `role` (user/admin), `created_at`.
2. **Interviews** (`interviews`): `id`, `user_id`, `category`, `difficulty`, `score`, `confidence_score`, `communication_score`, `technical_score`, `date`.
3. **Questions** (`questions`): `id`, `category`, `difficulty`, `question`.
4. **Answers** (`answers`): `id`, `interview_id`, `question_text`, `answer`, `score`, `accuracy`, `technical_depth`, `communication`, `clarity`, `grammar`, `relevance`, `feedback_strengths`, `feedback_weaknesses`, `suggested_answer`, `improvement_tips`.
5. **SkillAssessments** (`skill_assessments`): `id`, `user_id`, `skill`, `score`, `level`, `date`.
6. **Roadmaps** (`roadmaps`): `id`, `user_id`, `content` (JSON), `created_at`.

---

## API Endpoints List

### Authentication
* `POST /api/auth/register`: Signup with name, email, and password.
* `POST /api/auth/login`: Signin with credentials.
* `POST /api/auth/google-login`: Google token login verification.
* `GET /api/auth/profile`: Retrieves logged-in profile details.
* `PUT /api/auth/profile`: Updates name or changes password.
* `POST /api/auth/forgot-password`: Password recovery link.

### Mock Interviews
* `POST /api/interviews/start`: Initiates a simulation; returns AI-generated questions.
* `POST /api/interviews/submit-answer`: Evaluates an answer and logs feedback.
* `POST /api/interviews/finish`: Finalizes scores (tech, communication, confidence) and compiles averages.
* `GET /api/interviews/history`: List all user past interviews.
* `GET /api/interviews/<id>`: Returns single interview results and answer transcripts.
* `GET /api/interviews/<id>/pdf`: Downloads ReportLab feedback PDF.
* `POST /api/interviews/transcribe`: Converts uploaded audio file to text.

### Skill Assessments & Roadmaps
* `GET /api/skills/tests`: Fetches available assessment categories.
* `GET /api/skills/tests/<subject>`: Retrieves MCQ questions for a specific subject.
* `POST /api/skills/submit-assessment`: Submits assessment, calculates percentage, sets level.
* `GET /api/skills/assessments`: Retrieves user assessment records.
* `POST /api/roadmaps/generate`: Generates customized learning roadmap.
* `GET /api/roadmaps`: Returns latest user study roadmap.

### Admin Dashboard (Requires Admin privileges)
* `GET /api/admin/stats`: Returns platform usage metrics (accounts, tests, averages).
* `GET /api/admin/users`: Lists registered users.
* `DELETE /api/admin/users/<id>`: Deletes user.
* `GET /api/admin/questions`: Lists question bank questions.
* `POST /api/admin/questions`: Adds a preset question.
* `DELETE /api/admin/questions/<id>`: Deletes question.

---

## Production Deployment Guide

### Frontend Deployment (Vercel)

Vercel detects Vite React applications automatically:

1. Connect your GitHub repository to Vercel.
2. Configure **Build command** to `npm run build` and **Output Directory** to `dist`.
3. Set Frontend environmental variables:
   * **VITE_API_URL**: Point to your deployed Render URL (e.g. `https://interviewace-api.onrender.com`).
4. Hit **Deploy**.

### Backend Deployment (Render)

1. Create a Web Service on Render and link your GitHub repository.
2. Choose **Python** runtime.
3. Configure the commands:
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:create_app()` or `python app.py` (ensure gunicorn is added or port is set).
4. Under Environment variables, configure:
   * **PORT**: `10000` (or Render's default)
   * **SECRET_KEY** & **JWT_SECRET_KEY**
   * **DATABASE_URL**: Link to a Render PostgreSQL Database (e.g., `postgresql://user:pass@host/db`).
   * **OPENAI_API_KEY** & **GOOGLE_CLIENT_ID**
5. Hit **Create Web Service**.

---

## Authors & Credits

* **Author 1**: Vinit Gajjar
* **Author 2**: Ayush Chauhan

Created with ❤️ to help candidates prepare for their next professional interviews.
