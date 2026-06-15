import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Award, 
  Compass, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mock Interview', href: '/interview', icon: MessageSquareCode },
    { name: 'Skill Assessment', href: '/skills', icon: Award },
    { name: 'Learning Roadmap', href: '/roadmap', icon: Compass },
  ];

  // Add Admin Panel link if user is an admin
  if (user && user.role === 'admin') {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: ShieldCheck });
  }

  const activeClass = (path) => {
    return location.pathname === path
      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      {/* 1. Ambient Background Blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* 2. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-dark-900/60 backdrop-blur-md z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-brand-500 glow-purple" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Interview<span className="text-brand-500">Ace</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${activeClass(
                  item.href
                )}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {location.pathname === item.href && (
                  <ChevronRight className="h-4 w-4 text-brand-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile section in Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg border border-brand-500/20">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">
                {user?.name || 'Candidate'}
              </p>
              <p className="text-xs truncate text-slate-500 dark:text-slate-400">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 py-2"
            >
              <User className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-rose-500 hover:text-rose-600 py-2 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={toggleMobile}></div>
          <div className="relative flex flex-col w-64 max-w-xs bg-white dark:bg-dark-900 h-full p-6 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={toggleMobile}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2 mb-8">
              <Sparkles className="h-6 w-6 text-brand-500 glow-purple" />
              <span className="text-xl font-bold tracking-tight dark:text-white">
                Interview<span className="text-brand-500">Ace</span>
              </span>
            </div>

            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={toggleMobile}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeClass(
                      item.href
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-700 dark:text-slate-200">
                    {user?.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/profile"
                  onClick={toggleMobile}
                  className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 py-1.5"
                >
                  <User className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-rose-500 py-1.5 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-dark-900/60 backdrop-blur-md z-20">
          <button
            onClick={toggleMobile}
            className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <span>Prepare</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-500 font-semibold">{location.pathname.substring(1)}</span>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Welcome, <span className="text-slate-950 dark:text-slate-100 font-semibold">{user?.name || 'User'}</span>
            </span>
          </div>
        </header>

        {/* Main page route wrapper */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};
