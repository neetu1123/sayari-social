'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { PenTool, Wand2, ArrowLeft, Save, Globe, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function WriteBlog() {
  const { user } = useAuth();
  const { themeStyles } = useMoodTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAIHelp = async () => {
    if (!title.trim() && !content.trim()) {
      setMessage('Please enter a brief title or write some content first for the AI to analyze!');
      return;
    }

    try {
      setAiLoading(true);
      setMessage('');
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'blog',
          title: title || null,
          text: content || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title && !title) setTitle(data.title);
        setSummary(data.summary);
        setMessage(`AI Assistant: Generated summary based on analysis. (${data.generatedBy})`);
      }
    } catch (e) {
      console.error('AI assistant error:', e);
      setMessage('Failed to get AI assistance. Check network.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          summary,
          tags,
          status
        })
      });

      if (res.ok) {
        router.push('/blogs');
      } else {
        const data = await res.json();
        setMessage(data.message || 'Failed to submit article.');
      }
    } catch (err) {
      console.error('Failed to submit blog:', err);
      setMessage('Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'CREATOR' && user.role !== 'ADMIN')) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Unauthorized. Only Creators can write blogs.</p>
        <Link href="/blogs" className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <Link href="/blogs" className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Article Editor</span>
      </div>

      <div 
        className="p-8 rounded-3xl border bg-black/40 backdrop-blur-md transition-colors duration-500 space-y-6"
        style={{ borderColor: themeStyles.borderColor }}
      >
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <PenTool className="h-6 w-6 text-rose-500" />
            Write Article
          </h2>
          <p className="text-xs text-gray-400">
            Share essays, analyze classics, or document your writing journey.
          </p>
        </div>

        {message && (
          <div className="p-3 text-xs bg-white/5 border border-white/10 rounded-xl text-center text-gray-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Blog Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="e.g. Understanding Mirza Ghalib's Metaphors"
            />
          </div>

          {/* AI Helper Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAIHelp}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/20 border border-amber-900/50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
              {aiLoading ? 'Analyzing...' : 'Generate AI Summary'}
            </button>
          </div>

          {/* Summary / Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Short Summary (Optional)</label>
            <textarea
              rows="2"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Provide a 1-2 sentence preview summary of this article..."
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Content Body</label>
            <textarea
              required
              rows="12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors leading-relaxed"
              placeholder="Start typing your rich-text content here..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Keywords / Tags (Comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="poetry, history, ghalib, urdu"
            />
          </div>

          {/* Status Settings */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Publication Visibility</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStatus('PUBLISHED')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'PUBLISHED'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <Globe className="h-4 w-4" />
                Publish Immediately
              </button>
              
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'DRAFT'
                    ? 'bg-zinc-800/40 text-gray-300 border-zinc-700'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <EyeOff className="h-4 w-4" />
                Save as Draft
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Save className="h-4.5 w-4.5" />
              {loading ? 'Submitting...' : 'Save Article'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
