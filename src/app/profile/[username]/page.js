'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme, MOODS } from '@/components/MoodThemeContext';
import PostCard from '@/components/PostCard';
import CommentsModal from '@/components/CommentsModal';
import { 
  User, Calendar, BookOpen, PenTool, Sparkles, Bookmark, 
  MessageSquare, UserPlus, UserMinus, ShieldAlert 
} from 'lucide-react';

export default function UserProfile({ params }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { themeStyles } = useMoodTheme();

  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const username = unwrappedParams.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [commentPostId, setCommentPostId] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setPosts(data.posts);
        setBlogs(data.blogs);
        setSavedPosts(data.savedPosts || []);
        setIsFollowing(data.isFollowing);
      } else {
        router.push('/');
      }
    } catch (e) {
      console.error('Failed to load profile', e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Please log in to follow creators.');
      return;
    }

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'follow', 
          followingId: profile.id 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.followed);
        // Adjust follower count locally
        setProfile(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: data.followed 
              ? prev._count.followers + 1 
              : prev._count.followers - 1
          }
        }));
      }
    } catch (e) {
      console.error('Follow toggle error:', e);
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', postId })
      });

      if (res.ok) {
        const data = await res.json();
        const updateLikes = (list) => 
          list.map(p => {
            if (p.id === postId) {
              const listLikes = data.liked
                ? [...p.likes, { userId: currentUser.id }]
                : p.likes.filter(l => l.userId !== currentUser.id);
              return {
                ...p,
                likes: listLikes,
                _count: { ...p._count, likes: listLikes.length }
              };
            }
            return p;
          });
        
        setPosts(updateLikes(posts));
        setSavedPosts(updateLikes(savedPosts));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading user profile...</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="space-y-8">
      
      {/* 1. Header Card Banner */}
      <div 
        className="rounded-3xl border bg-black/45 shadow-xl relative overflow-hidden transition-colors duration-500"
        style={{ borderColor: themeStyles.borderColor }}
      >
        {/* Cover Photo Backdrop */}
        <div className={`h-40 bg-gradient-to-r ${themeStyles.gradient} opacity-40 border-b border-white/10`} />

        {/* Profile Details Area */}
        <div className="px-6 pb-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between -mt-10 gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.username} 
                className="h-24 w-24 rounded-full border-4 bg-zinc-950 object-cover shadow-2xl" 
                style={{ borderColor: themeStyles.primaryColor }}
              />
            ) : (
              <div 
                className="flex h-24 w-24 items-center justify-center rounded-full border-4 bg-zinc-950 shadow-2xl"
                style={{ borderColor: themeStyles.primaryColor }}
              >
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <h2 className="text-2xl font-black tracking-tight text-white">{profile.name || profile.username}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5 uppercase">
                  {profile.role}
                </span>
              </div>
              <p className="text-sm text-gray-400">@{profile.username}</p>
              <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action buttons (Follow, Message/Chat) */}
          {!isOwnProfile && (
            <div className="flex justify-center gap-3">
              <button
                onClick={handleFollowToggle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Follow Poet
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push(`/chat?recipient=${profile.username}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Chat Message
              </button>
            </div>
          )}
        </div>

        {/* Biography */}
        {profile.bio && (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-300 leading-relaxed max-w-xl italic">
              "{profile.bio}"
            </p>
          </div>
        )}

        {/* Metric counts */}
        <div className="border-t border-white/5 bg-black/20 grid grid-cols-4 divide-x divide-white/5 py-4 text-center">
          <div>
            <p className="text-lg font-black text-white">{profile._count.posts}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Shayari</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{profile._count.blogs}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Blogs</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{profile._count.followers}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Followers</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{profile._count.following}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Following</p>
          </div>
        </div>

      </div>

      {/* 2. Tab Navigation */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'posts'
              ? 'text-white border-rose-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <PenTool className="h-4 w-4" />
          Shayari Posts ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'blogs'
              ? 'text-white border-rose-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Authored Blogs ({blogs.length})
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'text-white border-rose-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            Bookmarked ({savedPosts.length})
          </button>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div>
        
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-500">No Shayari posts published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleFollowToggle}
                  onCommentClick={(id) => setCommentPostId(id)}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'blogs' && (
          blogs.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-500">No blog posts published yet.</p>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="p-6 rounded-2xl border bg-black/40 border-white/10 shadow-md flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{blog.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed max-w-xl">
                      {blog.summary || blog.content}
                    </p>
                    <span className="text-[10px] text-gray-500 block mt-2">
                      Published {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Link
                    href="/blogs"
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/5 shrink-0"
                  >
                    Read
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && isOwnProfile && (
          savedPosts.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-500">No bookmarked Shayari yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleFollowToggle}
                  onCommentClick={(id) => setCommentPostId(id)}
                />
              ))}
            </div>
          )
        )}

      </div>

      {/* Comment Modal */}
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}

    </div>
  );
}
