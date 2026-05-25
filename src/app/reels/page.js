'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMoodTheme, MOODS } from '@/components/MoodThemeContext';
import { useAuth } from '@/components/AuthContext';
import { 
  Heart, MessageCircle, ChevronUp, ChevronDown, Sparkles, 
  ArrowLeft, Volume2, VolumeX, RefreshCw 
} from 'lucide-react';
import AudioVisualizer from '@/components/AudioVisualizer';
import CommentsModal from '@/components/CommentsModal';

export default function ReelsFeed() {
  const { user } = useAuth();
  const { 
    activeMood, 
    setActiveMood, 
    isPlayingAmbient, 
    setIsPlayingAmbient, 
    toggleAmbientSound, 
    themeStyles 
  } = useMoodTheme();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentPostId, setCommentPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        
        // Initialize liked states
        const likesMap = {};
        data.posts.forEach((post, index) => {
          likesMap[index] = post.likes.some(like => like.userId === user?.id);
        });
        setLikedPosts(likesMap);
      }
    } catch (e) {
      console.error('Failed to load reels:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Sync active mood when swiping/changing reels!
  useEffect(() => {
    if (posts.length > 0 && posts[currentIndex]) {
      const activePost = posts[currentIndex];
      setActiveMood(activePost.mood);
      setIsPlayingAmbient(true); // Autoplay ambient synth on hover/load!
    }
  }, [currentIndex, posts]);

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please sign in to like posts.');
      return;
    }
    const currentPost = posts[currentIndex];
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', postId: currentPost.id })
      });

      if (res.ok) {
        const data = await res.json();
        setLikedPosts(prev => ({
          ...prev,
          [currentIndex]: data.liked
        }));
        
        // Update local count
        const updatedPosts = [...posts];
        if (data.liked) {
          updatedPosts[currentIndex].likes.push({ userId: user.id });
        } else {
          updatedPosts[currentIndex].likes = updatedPosts[currentIndex].likes.filter(l => l.userId !== user.id);
        }
        setPosts(updatedPosts);
      }
    } catch (e) {
      console.error('Like toggle error:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-400">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-rose-500" />
          <p className="text-xs">Entering Immersive Reels Feed...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-sm mb-4">No poetry cards found to load.</p>
        <Link href="/create" className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
          Create Shayari Card
        </Link>
      </div>
    );
  }

  const activePost = posts[currentIndex];
  const postMoodStyle = MOODS[activePost.mood] || MOODS.love;
  const isPostLiked = likedPosts[currentIndex] || false;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      
      {/* Back button */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <Link href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Cinematic Reel {currentIndex + 1} of {posts.length}
        </span>
      </div>

      {/* Reel Card Container (Mobile-first sizing ratio) */}
      <div className="w-full max-w-[400px] aspect-[9/16] rounded-[36px] border-4 border-white/10 bg-black/60 shadow-2xl relative overflow-hidden flex flex-col justify-between p-8 backdrop-blur-md transition-all duration-700"
           style={{ boxShadow: `0 0 40px ${postMoodStyle.primaryColor}20`, borderColor: `${postMoodStyle.primaryColor}40` }}>
        
        {/* Glow overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/95 pointer-events-none z-0" />

        {/* Top bar */}
        <div className="relative z-10 flex justify-between items-center text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center font-bold border border-white/10">
              {activePost.user.name?.[0] || activePost.user.username[0]}
            </div>
            <div>
              <p className="font-semibold text-white">@{activePost.user.username}</p>
              <p className="text-[9px] text-gray-400">Creator</p>
            </div>
          </div>

          <button
            onClick={toggleAmbientSound}
            className="p-1.5 rounded-full bg-black/45 border border-white/10 hover:text-white text-gray-300"
            title="Toggle Atmosphere Sound"
          >
            {isPlayingAmbient ? (
              <Volume2 className="h-4.5 w-4.5 text-green-400" />
            ) : (
              <VolumeX className="h-4.5 w-4.5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Middle text (Shayari - centered and animated) */}
        <div className="relative z-10 text-center my-auto px-4 py-8">
          {activePost.title && (
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/55 mb-6">
              {activePost.title}
            </h3>
          )}
          
          {/* Animated Shayari Text Body */}
          <p className={`text-xl sm:text-2xl leading-relaxed whitespace-pre-line text-white transition-all duration-700 font-serif italic ${postMoodStyle.textColor} ${postMoodStyle.fontClass} animate-fade-in`}>
            {activePost.text}
          </p>

          <div className="mt-8">
            <span className="text-xs italic text-gray-400">
              — {activePost.watermark || activePost.user.name || activePost.user.username}
            </span>
          </div>
        </div>

        {/* Bottom controls & visualizer */}
        <div className="relative z-10 border-t border-white/5 pt-4 flex flex-col items-center gap-4">
          
          {/* Simulated Audio Visualizer */}
          <AudioVisualizer isPlaying={isPlayingAmbient} />

          {/* Social Interactions bar */}
          <div className="w-full flex items-center justify-around text-gray-300">
            {/* Swiper Up */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Previous Reel"
            >
              <ChevronUp className="h-4.5 w-4.5" />
            </button>

            {/* Like */}
            <button
              onClick={handleLikeToggle}
              className="flex flex-col items-center gap-1 group hover:text-white transition-colors"
            >
              <Heart className={`h-6 w-6 group-hover:scale-110 transition-transform ${isPostLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-[10px]">{activePost.likes.length}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setCommentPostId(activePost.id)}
              className="flex flex-col items-center gap-1 hover:text-white transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-[10px]">{activePost._count?.comments || 0}</span>
            </button>

            {/* Swiper Down */}
            <button
              onClick={handleNext}
              disabled={currentIndex === posts.length - 1}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Next Reel"
            >
              <ChevronDown className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Floating hints */}
      <p className="text-[10px] text-gray-500 mt-4 select-none">
        Use navigation buttons above to swipe vertically.
      </p>

      {/* Comments Drawer overlay */}
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}

    </div>
  );
}
