import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  HelpCircle, 
  Calendar,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [histRes, assessRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/interviews/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/skills/assessments`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
        }
        if (assessRes.ok) {
          const assessData = await assessRes.json();
          setAssessments(assessData);
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Aggregate values
  const totalCompleted = history.length;
  const averageScore = totalCompleted > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted)
    : 0;

  // Filter strong / weak skills
  // Let's group assessments by skill name and take the latest score
  const latestSkills = {};
  assessments.forEach(a => {
    if (!latestSkills[a.skill] || new Date(a.date) > new Date(latestSkills[a.skill].date)) {
      latestSkills[a.skill] = a;
    }
  });

  const skillsList = Object.values(latestSkills);
  const strongSkills = skillsList.filter(s => s.score >= 75).map(s => s.skill);
  const weakSkills = skillsList.filter(s => s.score < 50).map(s => s.skill);

  // Recommendations logic
  let suggestion = "Take a skill assessment or start a mock interview to get tailored improvement plans!";
  if (weakSkills.length > 0) {
    suggestion = `Based on your results, prioritize studying ${weakSkills.join(', ')}. Head over to the Roadmap Generator to build a custom study guide.`;
  } else if (strongSkills.length > 0 && averageScore >= 80) {
    suggestion = "Excellent work! Try increasing the mock interview difficulty to Advanced to further push your limits.";
  } else if (totalCompleted > 0) {
    suggestion = "Continue taking mock interviews regularly. Try to elaborate more on your answers to improve your technical depth.";
  }

  // Setup Chart Data (Historical interview scores)
  const sortedHistory = [...history].reverse();
  const lineChartData = {
    labels: sortedHistory.map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        fill: true,
        label: 'Overall score',
        data: sortedHistory.map(h => h.score),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#8b5cf6',
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Setup Bar Chart Data (Skill Assessment Levels)
  const barChartData = {
    labels: skillsList.map(s => s.skill),
    datasets: [
      {
        label: 'Score %',
        data: skillsList.map(s => s.score),
        backgroundColor: '#10b981',
        borderRadius: 8,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading your profile dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your progress, view assessment badges, and complete mock challenges.
          </p>
        </div>
        
        <Link 
          to="/interview" 
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-glow transition-all duration-200"
        >
          <span>Start New Interview</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Average Score</span>
            <span className="text-2xl font-black">{averageScore}%</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Mock Sessions</span>
            <span className="text-2xl font-black">{totalCompleted}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Skill Badges</span>
            <span className="text-2xl font-black">{skillsList.length}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Daily Streak</span>
            <span className="text-2xl font-black">{totalCompleted > 0 ? 1 : 0} Day</span>
          </div>
        </GlassCard>
      </div>

      {/* 3. Daily Challenge & Suggestions */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 bg-gradient-to-r from-brand-500/10 via-indigo-500/5 to-transparent border-brand-500/20">
          <div className="flex items-center space-x-2 text-brand-500 mb-2">
            <Sparkles className="h-5 w-5 glow-purple animate-pulse" />
            <span className="font-bold text-sm">Personalized Study Suggestions</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
            {suggestion}
          </p>
          {weakSkills.length > 0 && (
            <Link to="/roadmap" className="mt-4 text-xs font-bold text-brand-500 hover:text-brand-600 inline-flex items-center space-x-1">
              <span>Generate personalized roadmap</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </GlassCard>

        <GlassCard className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2 font-bold text-sm">
            <Trophy className="h-5 w-5 glow-green" />
            <span>Daily Prep Challenge</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Answer a quick 3-question JavaScript test to earn the "Daily Coder" badge.
          </p>
          <Link to="/skills" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/10 inline-block text-center">
            Accept Challenge
          </Link>
        </GlassCard>
      </div>

      {/* 4. Charts Section */}
      {totalCompleted > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-md font-bold mb-4">Interview Score Growth</h3>
            <div className="h-64 relative">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-md font-bold mb-4">Skill Assessment Performance</h3>
            {skillsList.length > 0 ? (
              <div className="h-64 relative">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <HelpCircle className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">No skill assessments recorded yet.</p>
                <Link to="/skills" className="text-xs text-brand-500 font-semibold mt-2">Take skill test now</Link>
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto border-dashed">
          <AlertCircle className="h-12 w-12 text-brand-500 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Practice Records Yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Get started by launching a mock interview. Our AI will generate specialized questions and provide an NLP-based scorecard.
          </p>
          <Link to="/interview" className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl shadow-glow">
            Start Your First Practice
          </Link>
        </GlassCard>
      )}

      {/* 5. Strong & Weak Skills details */}
      {totalCompleted > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
              Strong Skills (Score &gt;= 75%)
            </h3>
            {strongSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strongSkills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {s} - Proficient
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Practice more to unlock proficiency badges.</p>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-4">
              Weak Skills (Score &lt; 50%)
            </h3>
            {weakSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakSkills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {s} - Needs Review
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No critical weak areas identified. Good work!</p>
            )}
          </GlassCard>
        </div>
      )}

      {/* 6. Recent Activity list */}
      {totalCompleted > 0 && (
        <GlassCard>
          <h3 className="text-md font-bold mb-4">Recent Practice Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Completed Date</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Feedback Report</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map(session => (
                  <tr key={session.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-500/5 transition-colors">
                    <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">{session.category}</td>
                    <td className="py-4">{session.difficulty}</td>
                    <td className="py-4 text-slate-500 text-xs">
                      {new Date(session.date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        session.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                        session.score >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {session.score}/100
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <a
                        href={`${API_BASE_URL}/api/interviews/${session.id}/pdf`}
                        headers={{ 'Authorization': `Bearer ${token}` }}
                        download
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center text-slate-600 dark:text-slate-400"
                        title="Download PDF Report"
                        onClick={async (e) => {
                          e.preventDefault();
                          // Fetch and trigger download programmatically to ensure JWT auth header is attached
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/interviews/${session.id}/pdf`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error();
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `InterviewAce_Report_${session.category}_${session.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          } catch (err) {
                            alert('Failed to download report.');
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
