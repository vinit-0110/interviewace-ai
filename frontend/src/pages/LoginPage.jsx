import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Auto initialize Google sign in client if client ID is set
  useEffect(() => {
    /* global google */
    const initGoogle = () => {
      if (typeof google !== 'undefined') {
        const client_id = ''; // In production read from import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (client_id) {
          google.accounts.id.initialize({
            client_id: client_id,
            callback: handleGoogleCallback
          });
          google.accounts.id.renderButton(
            document.getElementById('google-btn-container'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      }
    };

    // Load google script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    const res = await googleLogin(response.credential);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Google Login failed');
    }
  };

  const handleMockGoogleLogin = async () => {
    setLoading(true);
    // Send a dev-token indicating mock email
    const devToken = `mock-google-token-developer@example.com`;
    const res = await googleLogin(devToken);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Mock Google Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setForgotMsg('Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 px-6 py-12 transition-colors duration-300 relative overflow-hidden">
      {/* Ambience */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-brand-500/10 rounded-full filter blur-[80px] pointer-events-none"></div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-dark-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl relative z-10">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-7 w-7 text-brand-500 glow-purple" />
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Interview<span className="text-brand-500">Ace</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log in to continue your preparation
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-glow transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Google Login container */}
        <div className="my-6 flex items-center justify-between">
          <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-xs text-slate-400 uppercase tracking-widest px-3">or</span>
          <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div id="google-btn-container" className="w-full mb-3"></div>
        
        {/* Mock Google Button for easy test environment */}
        <button
          onClick={handleMockGoogleLogin}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Globe className="h-4 w-4 text-brand-500" />
          <span>Demo Google Log In</span>
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600">
            Sign up
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
            <h3 className="text-lg font-bold mb-2 text-slate-950 dark:text-white">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your email to receive recovery instructions.
            </p>
            {forgotMsg && (
              <p className="mb-4 text-xs font-semibold text-brand-500">{forgotMsg}</p>
            )}
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setForgotOpen(false); setForgotMsg(''); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-500 text-white rounded-lg shadow-glow hover:bg-brand-600"
                >
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
