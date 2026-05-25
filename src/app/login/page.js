'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { LogIn, Key, User, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { themeStyles } = useMoodTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl border bg-black/45 shadow-2xl backdrop-blur-md transition-colors duration-500"
           style={{ borderColor: themeStyles.borderColor }}>
        
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access your dashboard, write poetry, and follow creators.
          </p>
        </div>

        {/* Demo Credentials Alert Box */}
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-300">
          <p className="font-bold mb-1 flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Quick Testing Accounts:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Admin: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">admin</code> / <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">admin123</code></li>
            <li>Creator: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">mirza_ghalib</code> / <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">creator123</code></li>
            <li>Normal: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">rahul_kumar</code> / <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">user123</code></li>
          </ul>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-950/50 text-red-400 border border-red-900/50 rounded-xl text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
              <div className="relative flex items-center">
                <Key className="absolute left-3.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-rose-400 hover:underline">
            Register a new account
          </Link>
        </div>

      </div>
    </div>
  );
}
