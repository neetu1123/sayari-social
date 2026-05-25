'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMoodTheme, MOODS } from './MoodThemeContext';
import { useAuth } from './AuthContext';
import { 
  Heart, MessageCircle, Bookmark, Download, Play, Pause, 
  User, Share2, Check 
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export const PostCard = ({ post, onLikeToggle, onSaveToggle, onCommentClick }) => {
  const { user } = useAuth();
  const { activeMood, setActiveMood, isPlayingAmbient, setIsPlayingAmbient } = useMoodTheme();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const hasLiked = post.likes.some(like => like.userId === user?.id);
  const moodStyle = MOODS[post.mood] || MOODS.love;

  const handlePlayToggle = () => {
    // If setting to play, sync page mood with post mood!
    if (!isPlaying) {
      setActiveMood(post.mood);
      setIsPlayingAmbient(true);
    } else {
      setIsPlayingAmbient(false);
    }
    setIsPlaying(!isPlaying);
  };

  // Sync play state with global ambient sound
  React.useEffect(() => {
    if (activeMood !== post.mood || !isPlayingAmbient) {
      setIsPlaying(false);
    } else if (activeMood === post.mood && isPlayingAmbient) {
      setIsPlaying(true);
    }
  }, [activeMood, isPlayingAmbient, post.mood]);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/profile/${post.user.username}`;
      await navigator.clipboard.writeText(`"${post.text}"\n\nRead more at: ${shareUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background gradient based on mood
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    if (post.mood === 'love') {
      grad.addColorStop(0, '#4c0519'); // rose-950
      grad.addColorStop(1, '#1e0008');
    } else if (post.mood === 'sad') {
      grad.addColorStop(0, '#0f172a'); // slate-900
      grad.addColorStop(1, '#020617');
    } else if (post.mood === 'angry') {
      grad.addColorStop(0, '#450a0a'); // red-950
      grad.addColorStop(1, '#0a0505');
    } else if (post.mood === 'happy') {
      grad.addColorStop(0, '#78350f'); // amber-900
      grad.addColorStop(1, '#2d1500');
    } else if (post.mood === 'alone') {
      grad.addColorStop(0, '#1e1b4b'); // indigo-950
      grad.addColorStop(1, '#020617');
    } else if (post.mood === 'motivation') {
      grad.addColorStop(0, '#2e1065'); // violet-950
      grad.addColorStop(1, '#0c0a0f');
    } else {
      grad.addColorStop(0, '#134e4a'); // teal-950
      grad.addColorStop(1, '#042f2e');
    }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);
    
    // Outer border matching primary color
    ctx.strokeStyle = moodStyle.primaryColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 560);
    
    // Aesthetic geometric circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(400, 300, 220, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(post.title || 'Shayari', 400, 140);
    
    // Draw Shayari Text (split into lines and center)
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'italic 28px Georgia, serif';
    const lines = post.text.split('\n');
    let startY = 300 - ((lines.length - 1) * 25);
    lines.forEach((line, index) => {
      ctx.fillText(line, 400, startY + (index * 50));
    });

    // Draw Signature Watermark
    ctx.fillStyle = moodStyle.primaryColor;
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText(`— ${post.watermark || post.user.name || post.user.username}`, 400, 480);
    
    // Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '12px Courier New, monospace';
    ctx.fillText('Created on Sayari.Social', 400, 550);

    // Download file
    const link = document.createElement('a');
    link.download = `${post.title || 'shayari'}_card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-xl ${moodStyle.bgCard} ${moodStyle.borderColor} hover:border-white/20 flex flex-col justify-between h-full`}>
      <div>
        {/* Header: User Profile Info */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <Link href={`/profile/${post.user.username}`} className="flex items-center gap-2">
            {post.user.profileImage ? (
              <img 
                src={post.user.profileImage} 
                alt={post.user.username} 
                className="h-8 w-8 rounded-full border border-white/10 object-cover" 
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <User className="h-4.5 w-4.5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white hover:underline">{post.user.name || post.user.username}</p>
              <p className="text-[10px] text-gray-400">@{post.user.username}</p>
            </div>
          </Link>
          
          <button 
            onClick={() => setActiveMood(post.mood)}
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-black/40 text-gray-300 transition-all hover:bg-white/5"
            style={{ borderColor: moodStyle.primaryColor, color: moodStyle.primaryColor }}
          >
            {post.mood}
          </button>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
            {post.title}
          </h3>
        )}

        {/* Text Content */}
        <p className={`whitespace-pre-line text-lg mb-6 leading-relaxed ${moodStyle.textColor} ${moodStyle.fontClass}`}>
          {post.text}
        </p>

        {/* Watermark Signature */}
        <div className="text-right mb-6">
          <span className="text-xs italic text-gray-400 select-none">
            — {post.watermark || post.user.name || post.user.username}
          </span>
        </div>
      </div>

      {/* Footer controls: Like, Comment, Audio Play, Download */}
      <div className="border-t border-white/5 pt-4 mt-auto">
        
        {/* Audio visualizer display if playing */}
        {isPlaying && (
          <div className="flex justify-center mb-4">
            <AudioVisualizer isPlaying={isPlaying} />
          </div>
        )}

        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center space-x-4">
            {/* Like */}
            <button
              onClick={() => onLikeToggle(post.id)}
              className="flex items-center gap-1.5 hover:text-white transition-colors group"
            >
              <Heart 
                className={`h-4.5 w-4.5 group-hover:scale-110 transition-transform ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span className="text-xs">{post._count?.likes || post.likes?.length || 0}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => onCommentClick(post.id)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              <span className="text-xs">{post._count?.comments || 0}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Ambient Sound Sync Player */}
            <button
              onClick={handlePlayToggle}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title={isPlaying ? "Mute Ambient Track" : "Play Ambient Mood Sound"}
              style={isPlaying ? { color: moodStyle.primaryColor } : {}}
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
            </button>

            {/* Share Card */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title="Copy share link to clipboard"
            >
              {isCopied ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Share2 className="h-4.5 w-4.5" />}
            </button>

            {/* Poster Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title="Download beautiful Shayari Poster"
            >
              <Download className="h-4.5 w-4.5" />
            </button>

            {/* Save Bookmark */}
            <button
              onClick={() => onSaveToggle(post.id)}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title="Save to bookmarks"
            >
              <Bookmark className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostCard;
