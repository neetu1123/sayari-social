'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMoodTheme, MOODS } from '@/components/MoodThemeContext';
import { useAuth } from '@/components/AuthContext';
import PostCard from '@/components/PostCard';
import CommentsModal from '@/components/CommentsModal';
import { 
  Sparkles, BookOpen, PenTool, Flame, ArrowRight, UserPlus, 
  MessageCircle, Heart, HeartOff 
} from 'lucide-react';

export default function Home() {
  const { activeMood, setActiveMood, themeStyles } = useMoodTheme();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [commentPostId, setCommentPostId] = useState(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Fetch Shayari
      const postsUrl = activeFilter === 'all' 
        ? '/api/posts' 
        : `/api/posts?mood=${activeFilter}`;
      
      const postsRes = await fetch(postsUrl);
      const blogsRes = await fetch('/api/blogs');
      
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts);
      }
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.blogs.slice(0, 3)); // show top 3
      }
    } catch (e) {
      console.error('Failed to load content:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeFilter]);

  const handleLikeToggle = async (postId) => {
    if (!user) {
      alert('Please log in to like posts.');
      return;
    }

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', postId })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local count
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const updatedLikes = data.liked 
                ? [...post.likes, { userId: user.id }]
                : post.likes.filter(like => like.userId !== user.id);
              return {
                ...post,
                likes: updatedLikes,
                _count: {
                  ...post._count,
                  likes: updatedLikes.length
                }
              };
            }
            return post;
          })
        );
      }
    } catch (e) {
      console.error('Like toggle error:', e);
    }
  };

  const handleSaveToggle = async (postId) => {
    if (!user) {
      alert('Please log in to save posts.');
      return;
    }

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', postId })
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      }
    } catch (e) {
      console.error('Save toggle error:', e);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Hero Dynamic Banner */}
      <section className={`relative rounded-3xl overflow-hidden p-8 sm:p-12 border ${themeStyles.borderColor} ${themeStyles.bgCard} transition-all duration-700`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Sparkles className="h-44 w-44 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white mb-4 border border-white/5">
            <Flame className="h-3.5 w-3.5" style={{ color: themeStyles.primaryColor }} />
            Mood Theme Active: {MOODS[activeMood]?.name}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Express Your Soul <br />
            Through <span style={{ color: themeStyles.primaryColor }}>Rhythmic Verse</span>
          </h1>
          <p className="text-base text-gray-300 mb-6 leading-relaxed">
            {themeStyles.tagline} Write beautiful Shayari, share ambient mood sounds, and publish literary blogs in an immersive emotional space.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/create"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors"
            >
              <PenTool className="h-4.5 w-4.5" />
              Write New Shayari
            </Link>
            <Link 
              href="/reels"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-colors"
            >
              <Sparkles className="h-4.5 w-4.5" />
              Immersive Reels Feed
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Mood Filter Switcher Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Trending Feeds</h2>
          <span className="text-xs text-gray-400">Filter shayari by emotional aura</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => {
              setActiveFilter('all');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'all' 
                ? 'bg-white text-black font-semibold' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Moods
          </button>
          {Object.entries(MOODS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setActiveFilter(key);
                setActiveMood(key); // Change global theme matching the filter click!
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === key 
                  ? 'text-white font-semibold shadow-lg' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              style={activeFilter === key ? { backgroundColor: config.primaryColor, boxShadow: `0 0 12px ${config.primaryColor}` } : {}}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {config.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shayari Feed Column (Left & Middle) */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl text-gray-400">
              <p className="text-sm mb-2">No Shayari found matching mood "{activeFilter}".</p>
              <Link href="/create" className="text-xs hover:underline text-rose-400">Be the first to write one!</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleSaveToggle}
                  onCommentClick={(id) => setCommentPostId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column (Right) */}
        <div className="space-y-8">
          
          {/* A. Featured Writers */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-white/5 pb-2">
              Featured Poets
            </h3>
            <div className="space-y-4">
              {[
                { 
                  name: 'Mirza Ghalib', 
                  username: 'mirza_ghalib', 
                  bio: 'Classical Urdu & Persian Poet',
                  image: '/avatars/ghalib.png'
                },
                { 
                  name: 'Kavita Sharma', 
                  username: 'kavita_sharma', 
                  bio: 'Modern Hindi Writer & Motivator',
                  image: '/avatars/kavita.png'
                }
              ].map((poet) => (
                <div key={poet.username} className="flex items-center justify-between">
                  <Link href={`/profile/${poet.username}`} className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/10">
                      {poet.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white hover:underline">{poet.name}</p>
                      <p className="text-[10px] text-gray-500">@{poet.username}</p>
                    </div>
                  </Link>
                  <Link 
                    href={`/profile/${poet.username}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* B. Literary Blogs */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Literary Blogs
              </h3>
              <Link href="/blogs" className="text-xs text-rose-400 hover:underline flex items-center gap-0.5">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {blogs.length === 0 ? (
                <p className="text-xs text-gray-500">No blog posts published yet.</p>
              ) : (
                blogs.map((blog) => (
                  <div key={blog.id} className="group">
                    <Link href={`/blogs`} className="block">
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                        {blog.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal">
                        {blog.summary || blog.content}
                      </p>
                      <span className="text-[9px] text-gray-500 block mt-1.5">
                        By @{blog.user.username} &bull; {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Comments Modal */}
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}

    </div>
  );
}
