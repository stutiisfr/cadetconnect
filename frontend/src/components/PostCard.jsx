import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Repeat, Bookmark, Flag, Share2, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PostCard = ({ post }) => {
  const { token } = useAuth();
  const [appreciated, setAppreciated] = useState(false);
  const [count, setCount] = useState(post.appreciationsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const handleAppreciate = async () => {
    if (!token) return alert('Please sign in to appreciate posts.');
    if (appreciated) return;

    try {
      const res = await fetch(`/api/feed/${post.id}/appreciate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppreciated(true);
        setCount(data.appreciationsCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      try {
        const res = await fetch(`/api/feed/${post.id}/comments`);
        const data = await res.json();
        if (data.success) setComments(data.comments);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) return alert('Please sign in to comment.');
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/feed/${post.id}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: commentText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!token) return alert('Please sign in to save.');
    await fetch(`/api/feed/${post.id}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Post saved to your personal dashboard.');
  };

  const handleReport = async () => {
    if (!token) return alert('Please sign in.');
    const reason = prompt('Reason for reporting this post:');
    if (reason) {
      await fetch(`/api/feed/${post.id}/report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      alert('Report submitted for admin review.');
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-all hover:border-slate-300">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-navy-900">{post.authorName}</h4>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-medium text-olive-800">{post.authorRole}</span>
              <span>•</span>
              <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Category Tag */}
        <span className="text-[11px] font-semibold bg-sand-200 text-navy-800 px-2.5 py-1 rounded border border-slate-300">
          {post.category}
        </span>
      </div>

      {/* Post Content */}
      <p className="text-sm text-slate-800 leading-relaxed mb-3 whitespace-pre-line">
        {post.content}
      </p>

      {/* Media Attachment if present */}
      {post.mediaUrl && (
        <div className="mb-4 rounded-md overflow-hidden border border-slate-200 max-h-96">
          <img
            src={post.mediaUrl}
            alt="Post Attachment"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono text-olive-700 bg-olive-50 px-2 py-0.5 rounded border border-olive-200">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions Bar with Custom Terminology ("Appreciate") */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <button
          onClick={handleAppreciate}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
            appreciated ? 'bg-amber-100 text-amber-800 font-semibold border border-amber-300' : 'hover:bg-sand-100 text-slate-600'
          }`}
        >
          <Award className={`w-4 h-4 ${appreciated ? 'text-amber-600 fill-amber-600' : ''}`} />
          <span>Appreciate ({count})</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-sand-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Comments ({post.commentsCount || comments.length})</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-sand-100 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={handleReport}
          className="flex items-center space-x-1.5 px-2 py-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Report Post"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable Threaded Comments */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive response..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-sand-50 border border-slate-300 text-xs rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-olive-600"
            />
            <button
              type="submit"
              className="bg-olive-700 text-white text-xs font-semibold px-3 py-2 rounded-md hover:bg-olive-600 transition-colors"
            >
              Comment
            </button>
          </form>

          {comments.map((c) => (
            <div key={c.id} className="bg-sand-50 p-2.5 rounded-md border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-semibold text-navy-900 mb-1">
                <span>{c.authorName}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-700">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
