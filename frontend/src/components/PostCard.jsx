import React, { useState } from 'react';
import { 
  ThumbsUp, MessageSquare, Repeat, Bookmark, Flag, Share2, Award, 
  CheckCircle, Trash2, Edit3, ShieldAlert, Image as ImageIcon, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';

export const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user, token } = useAuth();
  const [appreciated, setAppreciated] = useState(false);
  const [count, setCount] = useState(post.appreciationsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [deleted, setDeleted] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editCategory, setEditCategory] = useState(post.category || 'NCC');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  const isAuthor = user && (user.id === post.authorId || user.id === post.author_id || user.name === post.authorName);

  if (deleted) return null;

  // Resolve image URL cleanly using getApiUrl fallback
  const getMediaUrl = () => {
    if (!post.mediaUrl) return null;
    if (post.mediaUrl.startsWith('http') || post.mediaUrl.startsWith('data:')) {
      return post.mediaUrl;
    }
    return getApiUrl(post.mediaUrl);
  };

  const resolvedMediaUrl = getMediaUrl();

  const handleAppreciate = async () => {
    if (!token) return alert('Please sign in to appreciate posts.');
    if (appreciated) return;

    try {
      const res = await fetch(getApiUrl(`/api/feed/${post.id}/appreciate`), {
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
        const res = await fetch(getApiUrl(`/api/feed/${post.id}/comments`));
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
      const res = await fetch(getApiUrl(`/api/feed/${post.id}/comment`), {
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

  const handleDeletePost = async () => {
    if (!token) return alert('Please sign in.');
    const confirmMsg = isAdmin ? '🛡️ Delete this post permanently as Admin?' : 'Are you sure you want to delete your post?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(getApiUrl(`/api/feed/${post.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeleted(true);
        if (onPostDeleted) onPostDeleted(post.id);
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);

    try {
      const res = await fetch(getApiUrl(`/api/feed/${post.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent.trim(), category: editCategory })
      });
      const data = await res.json();
      if (data.success) {
        post.content = editContent.trim();
        post.category = editCategory;
        setShowEditModal(false);
        if (onPostUpdated) onPostUpdated(post);
      } else {
        alert(data.error || 'Failed to update post.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!token) return alert('Please sign in to save.');
    await fetch(getApiUrl(`/api/feed/${post.id}/save`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Post saved to your personal dashboard.');
  };

  const handleReport = async () => {
    if (!token) return alert('Please sign in to report content.');
    const reason = prompt('Reason for reporting this post to Admin Desk:');
    if (reason && reason.trim()) {
      try {
        const res = await fetch(getApiUrl('/api/admin/report'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            targetType: 'POST',
            targetId: post.id,
            reason: reason.trim() 
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Report submitted to Admin Desk for review. Thank you!');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300 relative space-y-3">
      
      {/* Author Header */}
      <div className="flex items-center justify-between">
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
              <span className="font-medium text-olive-800">{post.authorRole || 'CadetConnect Member'}</span>
              <span>•</span>
              <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Custom Write / Edit Action for Author */}
          {isAuthor && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1 bg-sand-100 hover:bg-sand-200 text-navy-900 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-slate-300 transition-colors"
              title="Edit post content"
            >
              <Edit3 className="w-3.5 h-3.5 text-olive-700" />
              <span>Edit</span>
            </button>
          )}

          {/* Delete Action Button for Author or Admin */}
          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-red-200 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete</span>
            </button>
          )}

          {/* Category Tag */}
          <span className="text-[11px] font-semibold bg-sand-200 text-navy-800 px-2.5 py-1 rounded-lg border border-slate-300">
            {post.category}
          </span>
        </div>
      </div>

      {/* Post Text Content */}
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Media Image Attachment with Fallback */}
      {resolvedMediaUrl && !imgError && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-sand-50 max-h-96">
          <img
            src={resolvedMediaUrl}
            alt="CadetConnect Post Attachment"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Media Image Fallback indicator if URL broken */}
      {resolvedMediaUrl && imgError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-mono">
          <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Attachment Image Preview (Uploaded to Server Disk)</span>
        </div>
      )}

      {/* Hashtags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono text-olive-700 bg-olive-50 px-2 py-0.5 rounded-md border border-olive-200">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <button
          onClick={handleAppreciate}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors ${
            appreciated ? 'bg-amber-100 text-amber-800 font-semibold border border-amber-300' : 'hover:bg-sand-100 text-slate-600'
          }`}
        >
          <Award className={`w-4 h-4 ${appreciated ? 'text-amber-600 fill-amber-600' : ''}`} />
          <span>Appreciate ({count})</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-sand-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Comments ({post.commentsCount || comments.length})</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-sand-100 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={handleReport}
          className="flex items-center space-x-1.5 px-2 py-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Report Post"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Threaded Comments */}
      {showComments && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive response..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-sand-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-olive-600"
            />
            <button
              type="submit"
              className="bg-olive-700 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-olive-600 transition-colors"
            >
              Comment
            </button>
          </form>

          {comments.map((c) => (
            <div key={c.id} className="bg-sand-50 p-2.5 rounded-xl border border-slate-200 text-xs">
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

      {/* CUSTOM WRITE / EDIT POST MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-olive-700" />
                Edit / Customize Post Content
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                >
                  <option value="NCC">NCC Wing & Training</option>
                  <option value="SSB Prep">SSB & Interview Prep</option>
                  <option value="CDS / NDA">CDS / NDA Examinations</option>
                  <option value="General Defence">General Defence Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Post Content *</label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl p-3 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  placeholder="Customize your post write-up..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-sand-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};
