'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { UserPlus, User, Mail, Key, Shield } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { themeStyles } = useMoodTheme();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(username, email, password, role);
      if (!res.success) {
        setError(res.error || 'Registration failed');
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
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join Sayari.Social and express your artistic soul.
          </p>
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
                  placeholder="Choose username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="Enter email address"
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
                  placeholder="Choose password"
                />
              </div>
            </div>

            {/* Account Role Switcher (For easy local evaluation!) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Account Role</label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3.5 h-4.5 w-4.5 text-gray-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="USER">Reader / User (Normal Profile)</option>
                  <option value="CREATOR">Poetry Creator (Write Blogs + Posts)</option>
                  <option value="ADMIN">Super Administrator (Manage & Moderate Site)</option>
                </select>
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-rose-400 hover:underline">
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}
