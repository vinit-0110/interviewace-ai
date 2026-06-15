import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Award, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  History,
  FileCode,
  Map
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillAssessment = () => {
  const { token } = useAuth();
  
  // List of available assessment topics
  const topics = [
    { name: 'Python', desc: 'Syntax, memory management, tuples, GIL, decorators.' },
    { name: 'Java', desc: 'OOP concepts, JRE/JVM, collections, threads.' },
    { name: 'JavaScript', desc: 'Closures, event loop, promises, hoisting, data types.' },
    { name: 'React', desc: 'Hooks, lifecycle, Virtual DOM, state lifting.' },
    { name: 'SQL', desc: 'Joins, group by, indexes, transactions, ACID.' },
    { name: 'Data Structures', desc: 'Stack, queue, linked lists, trees, hash map collisions.' },
    { name: 'Algorithms', desc: 'Quicksort, binary search, dynamic programming, complexity.' }
  ];

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active test states
  const [activeSkill, setActiveSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // question_id -> selected_option_index
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, [token]);

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/assessments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (skillName) => {
    setLoading(true);
    setTestResult(null);
    setUserAnswers({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/tests/${skillName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setActiveSkill(skillName);
      } else {
        alert('Failed to load test questions.');
      }
    } catch (e) {
      alert('Error fetching test questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (Object.keys(userAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setTestSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/submit-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill: activeSkill,
          answers: userAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data);
        setActiveSkill(null);
        setQuestions([]);
        fetchAssessments(); // Refresh history
      } else {
        alert(data.message || 'Failed to submit test.');
      }
    } catch (err) {
      alert('Error submitting assessment.');
    } finally {
      setTestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500">Loading skill assessment dashboard...</p>
      </div>
    );
  }

  // 1. ACTIVE MCQ TEST RUNNER
  if (activeSkill && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest block">Assessment</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeSkill} Core Test</h1>
          </div>
          <button
            onClick={() => { setActiveSkill(null); setQuestions([]); }}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel Test
          </button>
        </div>

        <form onSubmit={handleSubmitTest} className="space-y-6">
          {questions.map((q, idx) => (
            <GlassCard key={q.id} className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white leading-relaxed text-sm">
                {idx + 1}. {q.question}
              </h3>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                      userAnswers[q.id] === optIdx
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-850 hover:bg-slate-500/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={userAnswers[q.id] === optIdx}
                      onChange={() => handleOptionChange(q.id, optIdx)}
                      className="accent-brand-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          ))}

          <button
            type="submit"
            disabled={testSubmitting}
            className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-glow"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{testSubmitting ? 'Evaluating Test Answers...' : 'Submit Answers'}</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. DEFAULT GRID VIEW (AND RESULTS IF COMPLETED)
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Skill Assessments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verify your knowledge with our quick conceptual tests to receive skill badges and roadmap advice.
        </p>
      </div>

      {/* Test Result Overlay if just completed */}
      {testResult && (
        <GlassCard className="border-emerald-500/20 bg-emerald-500/5 p-8 text-center max-w-xl mx-auto">
          <Award className="h-12 w-12 text-emerald-500 mx-auto mb-4 glow-green animate-bounce" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Test Assessment Completed</h3>
          <div className="flex items-center justify-center space-x-4 mb-4 text-sm font-semibold">
            <span className="text-slate-500">Skill: <span className="text-slate-850 dark:text-slate-200">{testResult.assessment.skill}</span></span>
            <span className="text-slate-500">Score: <span className="text-emerald-500">{testResult.assessment.score}%</span></span>
            <span className="text-slate-500">Tier: <span className="text-brand-500">{testResult.assessment.level}</span></span>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            You correctly answered {testResult.correct_answers} out of {testResult.total_questions} questions.
            {testResult.assessment.score >= 80 
              ? " Great job! You have demonstrated advanced understanding in this subject."
              : " We recommend generating a personalized roadmap to review your weaker concepts."}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {testResult.assessment.score < 80 && (
              <Link
                to="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center space-x-2"
              >
                <Map className="h-4 w-4" />
                <span>Go to Roadmap Generator</span>
              </Link>
            )}
            <button
              onClick={() => setTestResult(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-600 dark:text-slate-400"
            >
              Close
            </button>
          </div>
        </GlassCard>
      )}

      {/* Grid of assessment categories */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ClipboardList className="h-5 w-5 text-brand-500" />
          <span>Available Assessments</span>
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topics.map(t => {
            // Find past score
            const past = assessments.find(a => a.skill === t.name);
            return (
              <GlassCard key={t.name} className="flex flex-col justify-between h-48">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-md">{t.name}</h3>
                    {past && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {past.score}% ({past.level})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.desc}</p>
                </div>
                
                <button
                  onClick={() => handleStartTest(t.name)}
                  className="w-full py-2.5 rounded-xl border border-brand-500/20 hover:border-brand-500 bg-brand-500/5 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all mt-4"
                >
                  <span>{past ? 'Retake Assessment' : 'Take Assessment'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Past Assessments History */}
      {assessments.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="h-5 w-5 text-brand-500" />
            <span>Assessment History</span>
          </h2>
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Skill Level</th>
                    <th className="pb-3">Completed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-850">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{item.skill}</td>
                      <td className="py-3 font-bold text-emerald-500">{item.score}%</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          item.level === 'Advanced' ? 'bg-indigo-500/10 text-indigo-600' :
                          item.level === 'Intermediate' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
