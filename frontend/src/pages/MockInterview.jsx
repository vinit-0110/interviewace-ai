import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  HelpCircle,
  FileText,
  AlertTriangle,
  Play,
  CheckCircle,
  Award,
  BookOpen,
  MessageCircle,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MockInterview = () => {
  const { token } = useAuth();
  
  // Setup States
  const [inSetup, setInSetup] = useState(true);
  const [category, setCategory] = useState('Python');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active Interview States
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // question_index -> answer text
  const [timer, setTimer] = useState(120); // 2 minutes per question
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // question_index -> evaluation object

  // Finished Results States
  const [inResults, setInResults] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (!inSetup && !inResults && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      // Auto submit/move next when timer runs out
      handleNext();
    }
    return () => clearInterval(interval);
  }, [inSetup, inResults, timer]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, difficulty, questions_count: questionsCount })
      });
      const data = await res.json();
      if (res.ok) {
        setInterview(data.interview);
        setQuestions(data.questions);
        setInSetup(false);
        setTimer(120);
        setCurrentIndex(0);
        setUserAnswers({});
        setSubmittedAnswers({});
      } else {
        alert(data.message || 'Failed to start interview.');
      }
    } catch (e) {
      alert('Network error initializing interview.');
    } finally {
      setLoading(false);
    }
  };

  const submitCurrentAnswer = async () => {
    const currentQ = questions[currentIndex];
    const currentAns = userAnswers[currentIndex] || '';
    
    // Check if already evaluated to avoid double API calls
    if (submittedAnswers[currentIndex]) return;
    
    setIsEvaluating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interview_id: interview.id,
          question_text: currentQ.question,
          answer: currentAns
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedAnswers(prev => ({
          ...prev,
          [currentIndex]: data.answer
        }));
      }
    } catch (e) {
      console.error('Error submitting answer:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = async () => {
    await submitCurrentAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimer(120);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setTimer(120);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    // Submit final question answer first
    await submitCurrentAnswer();
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interview_id: interview.id })
      });
      
      if (res.ok) {
        // Fetch full interview details with all answers and evaluations
        const detailRes = await fetch(`${API_BASE_URL}/api/interviews/${interview.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const detailData = await detailRes.json();
        setFinalReport(detailData);
        setInResults(true);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to finalize interview.');
      }
    } catch (e) {
      alert('Error finalizing interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = (text) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || '') + text
    }));
  };

  const triggerPDFDownload = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/${interview.id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `InterviewAce_Feedback_${category}_${interview.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Failed to generate report PDF.');
      }
    } catch (e) {
      alert('Network error downloading report.');
    }
  };

  // Format Timer Text
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // 1. SETUP STATE RENDER
  if (inSetup) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mock Interview Simulation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set up your custom practice session. Our AI will curate interview questions matching your selections.
          </p>
        </div>

        <GlassCard>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Interview Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm"
              >
                <option value="Python">Python Development</option>
                <option value="Java">Java Enterprise</option>
                <option value="C++">C++ Systems</option>
                <option value="Web Development">Fullstack Web Dev</option>
                <option value="AI/ML">Machine Learning / AI</option>
                <option value="Data Science">Data Science & Analytics</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="HR Interview">HR & Behavioral</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      difficulty === diff
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-850 hover:bg-slate-500/5'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionsCount(count)}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      questionsCount === count
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-850 hover:bg-slate-500/5'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-glow disabled:opacity-50 mt-6"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{loading ? 'Initializing Simulation...' : 'Start Interview Now'}</span>
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // 2. ACTIVE SIMULATION STATE RENDER
  if (!inSetup && !inResults) {
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="flex items-center space-x-1 text-brand-500">
            <Timer className="h-4 w-4 animate-spin-slow" />
            <span>Time Left: {formatTime(timer)}</span>
          </span>
        </div>

        <GlassCard className="space-y-6 relative overflow-hidden">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-brand-500 tracking-widest block">Technical Prompt</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>

          {/* Answer Box */}
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Your Answer Response
            </label>
            <textarea
              rows="6"
              value={userAnswers[currentIndex] || ''}
              onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
              placeholder="Structure your answer clearly. Mention syntax, libraries, and real-world examples where appropriate..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-sans"
            />
          </div>

          {/* Voice input helper */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Answer verbally using browser dictation:</span>
            <VoiceRecorder onTranscript={handleTranscript} token={token} />
          </div>
        </GlassCard>

        {/* Navigation Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isEvaluating}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold flex items-center space-x-2 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={isEvaluating}
              className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center space-x-2 shadow-glow disabled:opacity-50"
            >
              <span>{isEvaluating ? 'Saving...' : 'Next Question'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading || isEvaluating}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center space-x-2 shadow-md shadow-emerald-500/10 disabled:opacity-50 animate-bounce"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{loading ? 'Compiling Report...' : 'Finish & Evaluate'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. RESULTS DISPLAY RENDER
  if (inResults && finalReport) {
    const { interview: finalInterview, answers } = finalReport;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Performance Assessment</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your results are ready! Read AI suggested answers and weaknesses for each question below.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={triggerPDFDownload}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF Report</span>
            </button>
            <Link 
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-glow transition-all"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Scores Panel */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="flex flex-col items-center justify-center text-center">
            <Award className="h-8 w-8 text-brand-500 mb-2 glow-purple" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Overall Score</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white mt-1">{finalInterview.score}%</span>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center text-center">
            <Sparkles className="h-8 w-8 text-emerald-500 mb-2 glow-green" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Technical Grade</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white mt-1">{finalInterview.technical_score}%</span>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Communication</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white mt-1">{finalInterview.communication_score}%</span>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-amber-500 mb-2" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Confidence</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white mt-1">{finalInterview.confidence_score}%</span>
          </GlassCard>
        </div>

        {/* Question Review Accordion */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Question Review & AI Feedback</h2>
          {answers.map((ans, idx) => (
            <GlassCard key={ans.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Question {idx + 1}</span>
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">{ans.question_text}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  ans.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                  ans.score >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                  {ans.score}/100
                </span>
              </div>

              {/* Answers columns */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Answer:</span>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-500/5 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                    {ans.answer || <span className="italic text-slate-400">No answer provided.</span>}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block mb-1">AI Suggested Model Answer:</span>
                  <p className="text-slate-600 dark:text-slate-300 bg-brand-500/5 p-3 rounded-xl border border-brand-500/10">
                    {ans.suggested_answer}
                  </p>
                </div>
              </div>

              {/* Detailed Feedbacks */}
              <div className="pt-2 grid sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1 uppercase tracking-widest">Strengths:</span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-350">{ans.feedback_strengths}</p>
                </div>
                <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 space-y-1">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1 uppercase tracking-widest">Improvement areas:</span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-350">{ans.feedback_weaknesses}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }
};
