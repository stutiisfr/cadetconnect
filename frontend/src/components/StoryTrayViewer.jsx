import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Camera, Sparkles, Clock, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';

export const StoryTrayViewer = ({ stories = [], onStoryCreated, onStoryDeleted }) => {
  const { user, token } = useAuth();
  
  // Active Viewer state
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);
  const [progress, setProgress] = useState(0);

  // Add Story Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Auto-advance story timer (5 seconds)
  useEffect(() => {
    if (activeStoryIdx === null) return;
    
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx(activeStoryIdx + 1);
          } else {
            setActiveStoryIdx(null); // Close viewer at end
          }
          return 0;
        }
        return prev + 2; // 50 steps * 100ms = 5000ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIdx, stories.length]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setMediaUrl(base64Url);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(getApiUrl('/api/feed/upload'), {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.fileUrl) {
          setMediaUrl(getApiUrl(data.fileUrl));
        }
      } catch (err) {
        // Keep Base64 fallback
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!mediaUrl) return alert('Please attach a photo or video for your story.');
    if (!token) return alert('Please sign in to share a story.');

    try {
      const res = await fetch(getApiUrl('/api/stories/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mediaUrl, caption })
      });
      const data = await res.json();
      if (data.success) {
        if (onStoryCreated) onStoryCreated(data.story);
        setShowAddModal(false);
        setMediaUrl('');
        setCaption('');
      } else {
        alert(data.error || 'Failed to create story.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActiveStory = async (storyId) => {
    if (!token) return;
    if (!window.confirm('Delete your story?')) return;

    try {
      const res = await fetch(getApiUrl(`/api/stories/${storyId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (onStoryDeleted) onStoryDeleted(storyId);
        setActiveStoryIdx(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;

  return (
    <div className="space-y-2">
      
      {/* Instagram-Style Story Tray Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-3 sm:gap-4">
        
        {/* Add Story Circle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:scale-105 transition-transform flex items-center justify-center group"
          >
            <div className="w-full h-full bg-white rounded-full p-[2px] relative flex items-center justify-center overflow-hidden">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="Your Story"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 right-0 bg-olive-700 text-white rounded-full p-1 border-2 border-white shadow">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          </button>
          <span className="text-[10px] font-bold text-navy-900 truncate max-w-[64px]">Your Story</span>
        </div>

        {/* User Story Circles */}
        {stories.map((story, idx) => (
          <div key={story.id || idx} className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveStoryIdx(idx)}
              className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-olive-600 to-emerald-500 hover:scale-105 transition-transform flex items-center justify-center"
            >
              <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                <img
                  src={story.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={story.authorName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </button>
            <span className="text-[10px] font-bold text-navy-900 truncate max-w-[64px]">
              {story.authorName ? story.authorName.split(' ')[0] : 'Cadet'}
            </span>
          </div>
        ))}
      </div>

      {/* FULLSCREEN INSTAGRAM-STYLE STORY VIEWER MODAL */}
      {currentStory && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-sm w-full h-[85vh] max-h-[680px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
            
            {/* Top Progress Bar & Author Info Overlay */}
            <div className="p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 space-y-2">
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={currentStory.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={currentStory.authorName}
                    className="w-8 h-8 rounded-full border border-white/50 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{currentStory.authorName}</h4>
                    <span className="text-[9px] text-slate-300 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      24h Cadet Story
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user && (user.id === currentStory.authorId || user.name === currentStory.authorName) && (
                    <button
                      onClick={() => handleDeleteActiveStory(currentStory.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveStoryIdx(null)}
                    className="text-white hover:text-slate-300 p-1 rounded-full bg-black/40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Content Viewport */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <img
                src={currentStory.mediaUrl}
                alt="Story Content"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Left & Right Tap Controls */}
            <button
              onClick={() => activeStoryIdx > 0 && setActiveStoryIdx(activeStoryIdx - 1)}
              disabled={activeStoryIdx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white disabled:opacity-0 p-2"
            >
              <ChevronLeft className="w-8 h-8 drop-shadow-md" />
            </button>

            <button
              onClick={() => activeStoryIdx < stories.length - 1 && setActiveStoryIdx(activeStoryIdx + 1)}
              disabled={activeStoryIdx === stories.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white disabled:opacity-0 p-2"
            >
              <ChevronRight className="w-8 h-8 drop-shadow-md" />
            </button>

            {/* Bottom Caption Overlay */}
            {currentStory.caption && (
              <div className="p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 text-center">
                <p className="text-xs text-white font-medium drop-shadow-md leading-relaxed">
                  {currentStory.caption}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CREATE STORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-navy-900">Share Cadet 24h Story</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              
              {/* Media Preview Box */}
              {mediaUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-64 bg-slate-900 flex items-center justify-center">
                  <img src={mediaUrl} alt="Story Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 bg-black/75 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-sand-50 hover:bg-sand-100 transition-colors">
                  <Camera className="w-8 h-8 text-olive-700 mb-2" />
                  <span className="text-xs font-bold text-navy-900">Choose Photo or Video</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Supports JPG, PNG, MP4 up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Caption / Update</label>
                <input
                  type="text"
                  placeholder="Add a caption to your 24h Cadet story..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-sand-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !mediaUrl}
                  className="px-5 py-2.5 bg-gradient-to-r from-olive-700 to-olive-600 text-white font-bold text-xs rounded-xl shadow hover:opacity-95 transition-opacity"
                >
                  {uploading ? 'Uploading...' : 'Share to Story'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
