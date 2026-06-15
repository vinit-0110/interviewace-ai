import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  ListTodo, 
  ExternalLink,
  BookOpen,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const LearningRoadmap = () => {
  const { token } = useAuth();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Roadmap creation form states
  const [skill, setSkill] = useState('Python');
  const [weakAreas, setWeakAreas] = useState('');
  const [generating, setGenerating] = useState(false);

  // Local checkbox state for weekly tasks (persisted in localStorage)
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    fetchLatestRoadmap();
  }, [token]);

  const fetchLatestRoadmap = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/roadmaps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.content);
        
        // Hydrate checklist checkboxes from localStorage if exist
        const savedChecklist = localStorage.getItem(`roadmap_check_${data.id}`);
        if (savedChecklist) {
          setCompletedTasks(JSON.parse(savedChecklist));
        } else {
          setCompletedTasks({});
        }
      } else {
        setRoadmap(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!weakAreas.trim()) {
      alert('Please list some weak topics or concepts to focus on.');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roadmaps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill, weak_areas: weakAreas })
      });
      const data = await res.json();
      if (res.ok) {
        setRoadmap(data.roadmap.content);
        localStorage.removeItem(`roadmap_check_${data.roadmap.id}`); // Clear old ticks
        setCompletedTasks({});
        setWeakAreas('');
      } else {
        alert(data.message || 'Failed to generate roadmap.');
      }
    } catch (err) {
      alert('Error generating roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskToggle = (weekIndex, taskIndex) => {
    const key = `${weekIndex}-${taskIndex}`;
    setCompletedTasks(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      
      // Save ticks locally associated with current roadmap
      if (roadmap) {
        localStorage.setItem(`roadmap_check_${roadmap.id || 'current'}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500">Retrieving latest learning roadmap...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Learning Roadmap
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Obtain structured weekly schedules, curated reading materials, and target checklist tasks tailored to your skill gaps.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column: Generator Form */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-24 space-y-4">
            <div className="flex items-center space-x-2 text-brand-500 mb-2 font-bold text-sm">
              <Sparkles className="h-5 w-5 glow-purple animate-pulse" />
              <span>Generate Custom Roadmap</span>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Subject Domain
                </label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm"
                >
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="React">React</option>
                  <option value="SQL">SQL</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Your Weak Areas
                </label>
                <textarea
                  rows="4"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  placeholder="e.g. List comprehensions, memory leaks, closures, react hooks rules..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center space-x-1.5 shadow-glow"
              >
                <Compass className="h-4 w-4" />
                <span>{generating ? 'Mapping Topics...' : 'Generate Roadmap'}</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right column: Roadmap Display */}
        <div className="lg:col-span-2">
          {roadmap ? (
            <div className="space-y-6 animate-fade-in">
              {/* 1. Recommended Topics */}
              <GlassCard className="space-y-4">
                <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-brand-500" />
                  <span>Target Study Topics</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {roadmap.recommended_topics.map((topic, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-850">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{topic}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* 2. Weekly Study Plan Checklist */}
              <GlassCard className="space-y-4">
                <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-brand-500 animate-pulse-slow" />
                  <span>Weekly Checklist Schedule</span>
                </h2>
                
                <div className="space-y-6">
                  {roadmap.weekly_study_plan.map((weekData, weekIdx) => (
                    <div key={weekIdx} className="space-y-3 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">{weekData.week}</span>
                        <span className="text-sm font-semibold text-slate-850 dark:text-slate-200 mt-1">{weekData.focus}</span>
                      </div>
                      
                      <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
                        {weekData.tasks.map((task, taskIdx) => {
                          const isDone = completedTasks[`${weekIdx}-${taskIdx}`];
                          return (
                            <label
                              key={taskIdx}
                              className={`flex items-start space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                isDone 
                                  ? 'text-slate-400 line-through' 
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-500/5'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!isDone}
                                onChange={() => handleTaskToggle(weekIdx, taskIdx)}
                                className="mt-0.5 accent-brand-500"
                              />
                              <span>{task}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* 3. Resources & Practice Questions */}
              <div className="grid sm:grid-cols-2 gap-6">
                <GlassCard className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 uppercase tracking-wider">
                    <BookOpen className="h-4 w-4 text-brand-500" />
                    <span>Free Resource Guides</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {roadmap.free_resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold block text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                            {res.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{res.type}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
                      </a>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 uppercase tracking-wider">
                    <ListTodo className="h-4 w-4 text-brand-500" />
                    <span>Practice Questions</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {roadmap.practice_questions.map((q, i) => (
                      <p key={i} className="p-3 bg-slate-500/5 rounded-xl border border-slate-200 dark:border-slate-850">
                        <b>Q{i+1}:</b> {q}
                      </p>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border-dashed text-center flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-10 w-10 text-brand-500 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Study Roadmap</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Identify your weak skills by completing an assessment, or compile a customized guide using the selector panel on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
