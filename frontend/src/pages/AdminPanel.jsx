import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  BarChart4, 
  PlusCircle, 
  Database,
  Activity,
  CheckCircle,
  FileQuestion
} from 'lucide-react';

export const AdminPanel = () => {
  const { user, token } = useAuth();
  
  // Guard clause for non-admins
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
        <ShieldAlert className="h-16 w-16 text-rose-500 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">403 - Forbidden</h2>
        <p className="text-sm text-slate-500">
          You do not have administrative permissions to view this dashboard. Please log in with an admin account.
        </p>
      </div>
    );
  }

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Question Form State
  const [newCat, setNewCat] = useState('Python');
  const [newDiff, setNewDiff] = useState('Beginner');
  const [newQText, setNewQText] = useState('');
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, questionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (questionsRes.ok) setQuestionsList(await questionsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All their interviews and roadmaps will be deleted.")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        fetchAdminData(); // Refresh aggregate stats
      } else {
        alert('Failed to delete user.');
      }
    } catch (e) {
      alert('Error connecting to delete API.');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setFormMsg('');
    if (!newQText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: newCat,
          difficulty: newDiff,
          question: newQText
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuestionsList(prev => [data.question, ...prev]);
        setNewQText('');
        setFormMsg('Question added successfully!');
        fetchAdminData(); // Refresh stats count
      } else {
        setFormMsg(data.message || 'Failed to add question.');
      }
    } catch (err) {
      setFormMsg('Error submitting question.');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question from the general bank?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setQuestionsList(prev => prev.filter(q => q.id !== qId));
        fetchAdminData();
      } else {
        alert('Failed to delete question.');
      }
    } catch (e) {
      alert('Error connecting to delete API.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500">Loading admin operations control...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system users, review aggregate metrics, and administer the mock question bank.
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="flex items-center space-x-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Accounts</span>
              <span className="text-2xl font-black">{stats.total_users}</span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Interviews</span>
              <span className="text-2xl font-black">{stats.total_interviews}</span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Question Pool</span>
              <span className="text-2xl font-black">{stats.total_questions}</span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <BarChart4 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Platform Average</span>
              <span className="text-2xl font-black">{stats.averages.overall_score}%</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Split layout: Add Question & Category Dist */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Add Question Form */}
        <GlassCard className="md:col-span-2">
          <div className="flex items-center space-x-2 text-brand-500 mb-4 font-bold text-sm">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Preset Question</span>
          </div>

          {formMsg && (
            <div className="mb-4 text-xs font-semibold text-brand-500 flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-brand-500" />
              <span>{formMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
                >
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="HR Interview">HR Interview</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Difficulty</label>
                <select
                  value={newDiff}
                  onChange={(e) => setNewDiff(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Question Content</label>
              <textarea
                rows="3"
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="What is the difference between..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-glow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question to Pool</span>
            </button>
          </form>
        </GlassCard>

        {/* Category Dist card */}
        <GlassCard>
          <h3 className="font-bold text-sm mb-4">Interviews by Subject</h3>
          {stats && Object.keys(stats.category_distribution).length > 0 ? (
            <div className="space-y-3 text-xs">
              {Object.entries(stats.category_distribution).map(([cat, count]) => {
                const percentage = Math.round((count / stats.total_interviews) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{cat}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No interview sessions recorded yet.</p>
          )}
        </GlassCard>
      </div>

      {/* User Management Section */}
      <GlassCard>
        <h3 className="text-md font-bold mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5 text-brand-500" />
          <span>User Management</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Signed Up</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-500/5">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id} // Cannot delete yourself
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Question Pool Table Section */}
      <GlassCard>
        <h3 className="text-md font-bold mb-4 flex items-center space-x-2">
          <FileQuestion className="h-5 w-5 text-brand-500" />
          <span>General Question Bank ({questionsList.length})</span>
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-white dark:bg-dark-900 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-3">Category</th>
                <th className="py-3">Difficulty</th>
                <th className="py-3">Question</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {questionsList.map(q => (
                <tr key={q.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-500/5">
                  <td className="py-3 font-semibold text-brand-600 dark:text-brand-400">{q.category}</td>
                  <td className="py-3">{q.difficulty}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300 max-w-md truncate" title={q.question}>
                    {q.question}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
