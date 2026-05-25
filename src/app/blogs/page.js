'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { BookOpen, PenTool, Search, User, Clock, ChevronDown, ChevronUp, Heart, MessageSquare } from 'lucide-react';
import CommentsModal from '@/components/CommentsModal';

export default function BlogsDirectory() {
  const { user } = { user: useAuth().user }; // Safe call
  const { themeStyles } = useMoodTheme();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [commentBlogId, setCommentBlogId] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/api/blogs?search=${searchQuery}` 
        : '/api/blogs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.error('Error fetching blogs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery]);

  const handleLikeToggle = async (blogId) => {
    const auth = useAuth();
    if (!auth.user) {
      alert('Please log in to like blogs.');
      return;
    }

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', blogId })
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(prev => 
          prev.map(blog => {
            if (blog.id === blogId) {
              const updatedLikes = data.liked
                ? [...blog.likes, { userId: auth.user.id }]
                : blog.likes.filter(like => like.userId !== auth.user.id);
              return {
                ...blog,
                likes: updatedLikes,
                _count: {
                  ...blog._count,
                  likes: updatedLikes.length
                }
              };
            }
            return blog;
          })
        );
      }
    } catch (e) {
      console.error('Like toggle error:', e);
    }
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-rose-500" />
            Literary Blogs
          </h2>
          <p className="text-xs text-gray-400">
            Read articles, essays, and stories about literature, art, and emotional psychology.
          </p>
        </div>

        {user && (user.role === 'CREATOR' || user.role === 'ADMIN') && (
          <Link
            href="/blogs/create"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-200 transition-colors"
          >
            <PenTool className="h-4 w-4" />
            Write Blog Post
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center max-w-md">
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blogs by title, keywords or content..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Blogs list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl text-gray-400 text-sm">
          No literary blogs found.
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => {
            const isExpanded = expandedBlogId === blog.id;
            const readTime = calculateReadTime(blog.content);
            const userLiked = blog.likes.some(like => like.userId === user?.id);

            return (
              <div
                key={blog.id}
                className="p-6 rounded-2xl border bg-black/40 border-white/10 shadow-lg space-y-4 hover:border-white/20 transition-all duration-300"
              >
                
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {blog.user.profileImage ? (
                      <img 
                        src={blog.user.profileImage} 
                        alt={blog.user.username} 
                        className="h-6 w-6 rounded-full border border-white/15 object-cover" 
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                        <User className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-200">@{blog.user.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readTime} min read
                    </span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Title & summary */}
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight hover:text-rose-400 transition-colors">
                    {blog.title}
                  </h3>
                  {!isExpanded && (
                    <p className="text-gray-300 text-sm mt-2 leading-relaxed line-clamp-3">
                      {blog.summary || blog.content}
                    </p>
                  )}
                </div>

                {/* Content Area when expanded */}
                {isExpanded && (
                  <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-4 mt-2">
                    {blog.content}
                  </div>
                )}

                {/* Tags */}
                {blog.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {blog.tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 hover:text-white cursor-pointer"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interaction Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeToggle(blog.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Heart className={`h-4.5 w-4.5 ${userLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{blog._count?.likes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => setCommentBlogId(blog.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                      <span>{blog._count?.comments || 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedBlogId(isExpanded ? null : blog.id)}
                    className="flex items-center gap-1 text-gray-300 hover:text-white font-semibold transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Close Article <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read Article <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Blog Comments Modal */}
      {commentBlogId && (
        <CommentsModal
          blogId={commentBlogId}
          onClose={() => setCommentBlogId(null)}
        />
      )}

    </div>
  );
}
