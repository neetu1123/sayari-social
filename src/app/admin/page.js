'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { 
  ShieldAlert, Users, PenTool, BookOpen, MessageSquare, 
  Trash2, ToggleLeft, ToggleRight, Settings, Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { themeStyles } = useMoodTheme();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
        setPosts(data.posts);
        setBlogs(data.blogs);
      } else {
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchAdminData();
    }
  }, [user]);

  const handleAdminAction = async (action, targetId, extraParams = {}) => {
    if (!confirm(`Are you sure you want to perform: ${action}?`)) return;
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId, ...extraParams })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
        // Refresh
        fetchAdminData();
      } else {
        const data = await res.json();
        setMessage(data.message || 'Action failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error executing admin action.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500 mr-2" />
        <span>Loading Admin Panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header banner */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <ShieldAlert className="h-8 w-8 text-rose-500" />
          Admin Dashboard
        </h2>
        <p className="text-xs text-gray-400">
          Monitor community activity, moderate uploaded content, and manage member credentials.
        </p>
      </div>

      {message && (
        <div className="p-3 text-xs bg-white/5 border border-white/10 rounded-xl text-center text-rose-300">
          {message}
        </div>
      )}

      {/* 2. Counter widgets */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-white/5 bg-black/40 text-left">
            <Users className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Accounts</p>
          </div>
          
          <div className="p-6 rounded-2xl border border-white/5 bg-black/40 text-left">
            <PenTool className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.totalPosts}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Shayari Cards</p>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-black/40 text-left">
            <BookOpen className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.totalBlogs}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Published Blogs</p>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-black/40 text-left">
            <MessageSquare className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.totalComments}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Activity Comments</p>
          </div>
        </div>
      )}

      {/* 3. Tab Toggles */}
      <div className="flex border-b border-white/10">
        {['users', 'posts', 'blogs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 border-b-2 text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'text-white border-rose-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Manage {tab}
          </button>
        ))}
      </div>

      {/* 4. Lists Table */}
      <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Posts/Blogs</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">@{u.username}</td>
                    <td className="p-4 text-gray-300">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleAdminAction('update_role', u.id, { role: e.target.value })}
                        className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="USER">USER</option>
                        <option value="CREATOR">CREATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 text-center text-gray-400">
                      {u._count.posts} posts / {u._count.blogs} blogs
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleAdminAction('delete_user', u.id)}
                        disabled={u.id === user.id}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 disabled:opacity-30 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Shayari Content</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Mood</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-serif italic text-white max-w-sm truncate">{p.text}</td>
                    <td className="p-4 text-gray-300">@{p.user.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-rose-400">
                        {p.mood}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleAdminAction('delete_post', p.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                        title="Delete Shayari"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Blog Article Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogs.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white max-w-sm truncate">{b.title}</td>
                    <td className="p-4 text-gray-300">@{b.user.username}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.status === 'PUBLISHED' ? 'bg-green-950/40 text-green-400' : 'bg-zinc-800 text-gray-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleAdminAction('delete_blog', b.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                        title="Delete blog"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
