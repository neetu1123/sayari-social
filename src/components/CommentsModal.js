'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { X, Send, User } from 'lucide-react';

export const CommentsModal = ({ postId, blogId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const url = postId 
        ? `/api/social?postId=${postId}` 
        : `/api/social?blogId=${blogId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (e) {
      console.error('Error fetching comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    if (!user) {
      alert('You must be logged in to comment!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId: postId || null,
          blogId: blogId || null,
          text: newComment
        })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-lg font-bold">Comments</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                {comment.user.profileImage ? (
                  <img 
                    src={comment.user.profileImage} 
                    alt={comment.user.username} 
                    className="h-8 w-8 rounded-full object-cover border border-white/10" 
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-200">{comment.user.name || comment.user.username}</span>
                    <span className="text-[10px] text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input form */}
        {user ? (
          <form onSubmit={handleSubmit} className="border-t border-white/5 pt-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-full border border-white/15 px-3 py-1.5 focus-within:border-rose-500/50 transition-colors">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow bg-transparent text-sm text-white focus:outline-none px-2"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-xs text-gray-500 border-t border-white/5 pt-3">
            Please log in to leave a comment.
          </div>
        )}

      </div>
    </div>
  );
};
export default CommentsModal;
