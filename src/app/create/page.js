'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme, MOODS } from '@/components/MoodThemeContext';
import { PenTool, Wand2, Sparkles, User, RefreshCw, Type, Save } from 'lucide-react';

export default function CreatePost() {
  const { user } = useAuth();
  const { activeMood, setActiveMood, themeStyles } = useMoodTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mood, setMood] = useState(activeMood);
  const [watermark, setWatermark] = useState('');
  const [fontClass, setFontClass] = useState('font-serif italic');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setWatermark(user.name || user.username);
    }
  }, [user]);

  // When form mood changes, sync page active theme to preview particles & color
  useEffect(() => {
    setActiveMood(mood);
    // sync default font for that mood
    if (MOODS[mood]) {
      setFontClass(MOODS[mood].fontClass);
    }
  }, [mood]);

  const handleGenerateAI = async () => {
    try {
      setGenerating(true);
      setMessage('');
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shayari', mood })
      });

      if (res.ok) {
        const data = await res.json();
        setText(data.shayari);
        setMessage(`Poetry generated via: ${data.generatedBy}`);
      }
    } catch (e) {
      console.error('Failed to generate AI shayari', e);
      setMessage('Failed to generate AI poetry. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      alert('You must be logged in to create a post!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          text,
          mood,
          watermark,
        })
      });

      if (res.ok) {
        router.push('/');
      } else {
        const err = await res.json();
        setMessage(err.message || 'Failed to submit post.');
      }
    } catch (e) {
      console.error('Submit error:', e);
      setMessage('Internal Server Error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Please log in to write and publish poetry.</p>
        <button onClick={() => router.push('/login')} className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
          Sign In
        </button>
      </div>
    );
  }

  const selectedMoodTheme = MOODS[mood] || MOODS.love;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* Form Area */}
      <div className="p-8 rounded-3xl border bg-black/40 backdrop-blur-md transition-colors duration-500 space-y-6"
           style={{ borderColor: themeStyles.borderColor }}>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <PenTool className="h-6 w-6 text-rose-500" />
            Write Shayari
          </h2>
          <p className="text-xs text-gray-400">
            Write your poetry, select its emotional mood, and sign with your watermark signature.
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
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Give your verse a title"
            />
          </div>

          {/* Text Area */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">Your Poetry</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generating}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-950/20 border border-amber-900/50 px-2 py-0.5 rounded-full"
              >
                <Wand2 className="h-3 w-3" />
                {generating ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              required
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:italic"
              placeholder="Kuch toh baat hai teri saadgi mein..."
            />
          </div>

          {/* Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mood selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Poetry Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {Object.entries(MOODS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Card Typography</label>
              <select
                value={fontClass}
                onChange={(e) => setFontClass(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="font-serif italic">Elegant Serif Italic</option>
                <option value="font-sans font-black uppercase">Heavy Bold Capital</option>
                <option value="font-sans font-light tracking-widest">Thin Spaced Clean</option>
                <option value="font-mono tracking-tighter">Monospace Technical</option>
                <option value="font-serif font-semibold">Standard Classic Serif</option>
              </select>
            </div>

          </div>

          {/* Watermark Signature */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Signature Watermark</label>
            <input
              type="text"
              required
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Your Pen Name"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Save className="h-4.5 w-4.5" />
              {submitting ? 'Publishing...' : 'Publish Shayari'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Card Preview Area */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Live Card Poster Preview</p>
        
        <div 
          className={`aspect-[4/3] rounded-3xl border-2 p-8 flex flex-col justify-between shadow-2xl relative transition-all duration-700 ${selectedMoodTheme.bgCard} ${selectedMoodTheme.borderColor}`}
          style={{ borderColor: selectedMoodTheme.primaryColor }}
        >
          {/* Aesthetic circles */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-3xl opacity-15">
            <div className="h-72 w-72 rounded-full border border-white" />
          </div>

          <div className="relative z-10">
            {/* Header placeholder */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                @{user.username}
              </span>
              <span className="uppercase tracking-widest">{mood}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
              {title || 'Untitled Verse'}
            </h3>

            {/* Body */}
            <p className={`whitespace-pre-line text-lg min-h-[100px] leading-relaxed transition-all duration-500 ${selectedMoodTheme.textColor} ${fontClass}`}>
              {text || 'Enter your thoughts or click "AI Generate" above to see your preview card come to life...'}
            </p>
          </div>

          {/* Watermark Signature */}
          <div className="text-right border-t border-white/5 pt-4 relative z-10">
            <span className="text-xs italic text-gray-300">
              — {watermark || 'Signature Watermark'}
            </span>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          * Your card will automatically export with this layout when other users click "Download Poster" on your post.
        </div>
      </div>

    </div>
  );
}
