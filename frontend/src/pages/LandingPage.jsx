import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Award,
  Compass,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  
  const faqs = [
    {
      q: "How does the AI evaluate my interview answers?",
      a: "InterviewAce AI analyzes your answers across six core dimensions: accuracy, technical depth, communication skills, grammar, clarity, and relevance. It compares your response against senior engineering benchmarks to offer instant, constructive feedback."
    },
    {
      q: "Can I use voice input to simulate a real interview?",
      a: "Absolutely! We support real-time Speech-to-Text directly inside your browser, as well as backend processing. You can answer questions naturally using your microphone, mimicking a live video call experience."
    },
    {
      q: "Are the learning roadmaps customized to my weak points?",
      a: "Yes. When you complete mock interviews or skill assessments, the system identifies your weak sub-topics and generates a structured weekly study plan complete with resource links and practice tasks."
    },
    {
      q: "Is there a free trial or free tier available?",
      a: "Yes! Our Free tier allows you to take up to 3 practice interviews, perform skill assessments, and view basic dashboards. Upgrade to Pro for unlimited questions, PDF downloads, and detailed AI roadmaps."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleStartPrep = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-dark-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-brand-500 glow-purple" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Interview<span className="text-brand-500">Ace</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-glow text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-brand-500">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-glow text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>Prepare with advanced AI Feedback</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto text-slate-900 dark:text-white">
          Ace Your Next Technical & HR Interview with <span className="bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">AI Power</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Prepare for Python, Java, Web Dev, System Design, and HR questions. Get instant score cards, custom roadmaps, and voice simulation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleStartPrep}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-glow transition-all duration-200 transform hover:scale-105"
          >
            <span>Start Preparing Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
          >
            Explore Features
          </a>
        </div>

        {/* Hero Interactive UI Mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative aspect-[16/9] bg-slate-900 dark:bg-dark-900">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          {/* Mock Dashboard Screen */}
          <div className="p-6 text-left h-full flex flex-col justify-between text-slate-300">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-xs text-slate-500 font-mono">interviewace-ai.app/dashboard</span>
            </div>
            {/* Mock Contents */}
            <div className="grid grid-cols-3 gap-4 my-auto">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-xs text-slate-500 block">Overall Interview Score</span>
                <span className="text-3xl font-extrabold text-brand-400 block my-1">84%</span>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
                  <div className="bg-brand-500 h-2 rounded-full w-[84%]"></div>
                </div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-xs text-slate-500 block">Completed Sessions</span>
                <span className="text-3xl font-extrabold text-emerald-400 block my-1">12</span>
                <span className="text-[10px] text-emerald-500">↑ 3 this week</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-xs text-slate-500 block">Strong Skills</span>
                <span className="text-md font-bold block mt-2">Python, React, SQL</span>
              </div>
            </div>
            
            {/* AI Answer Evaluation Mock */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-2">
              <p className="text-xs text-brand-400 font-semibold mb-1">AI EVALUATION REPORT</p>
              <p className="text-xs text-slate-400 font-mono mb-2">Q: What is a tuple in Python?</p>
              <div className="text-xs space-y-1">
                <p className="text-emerald-400">✔ Strengths: Correctly identified immutability and memory efficiency.</p>
                <p className="text-rose-400">⚠ Weakness: Failed to explain syntax or parenthesis definition.</p>
                <p className="text-slate-300">💡 Suggested answer: Tuples are immutable ordered sequences, created with parenthesess ()...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
          Powerful Prep Features Built for Success
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 border dark:border-slate-800 hover:shadow-glass-hover hover:-translate-y-1 transform transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">AI Question Generator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate interview questions dynamically in over 8 different technical domains tailored to your skill tier.
            </p>
          </div>
          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 border dark:border-slate-800 hover:shadow-glass-hover hover:-translate-y-1 transform transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">NLP-Based Answer Review</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Submit your answers and get assessed on accuracy, clarity, relevance, grammar, and technical depth.
            </p>
          </div>
          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 border dark:border-slate-800 hover:shadow-glass-hover hover:-translate-y-1 transform transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">Learning Roadmap Generator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get customized, weekly study plans matching your weaker topics, featuring free resources and guides.
            </p>
          </div>
          {/* Card 4 */}
          <div className="glass-card rounded-2xl p-6 border dark:border-slate-800 hover:shadow-glass-hover hover:-translate-y-1 transform transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">Detailed Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Visualize weekly performance, communication growth, technical confidence, and scores over time.
            </p>
          </div>
        </div>
      </section>

     
      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl border dark:border-slate-800 p-4 transition-all duration-300">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between text-left font-semibold text-slate-950 dark:text-white"
              >
                <span>{faq.q}</span>
                {activeFaq === index ? (
                  <Minus className="h-5 w-5 text-brand-500" />
                ) : (
                  <Plus className="h-5 w-5 text-brand-500" />
                )}
              </button>
              {activeFaq === index && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

     

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-dark-900/40 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} InterviewAce AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-medium">Created with ❤️ by <span className="text-brand-600 dark:text-brand-400 font-semibold">Vinit Gajjar</span> & <span className="text-brand-600 dark:text-brand-400 font-semibold">Ayush Chauhan</span></p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-brand-500">Privacy Policy</a>
            <a href="#" className="hover:text-brand-500">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
