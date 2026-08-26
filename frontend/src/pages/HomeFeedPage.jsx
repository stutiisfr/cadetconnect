import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { API_BASE_URL } from '../config';
import { 
  Plus, Image, FileText, Award, HelpCircle, Flame, 
  Send, Sparkles, Filter, ShieldCheck, Clock, Radio, 
  Share2, Camera, Video, Bell, CheckCircle, MessageSquare
} from 'lucide-react';

export const HomeFeedPage = () => {
  const { user, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [loading, setLoading] = useState(true);

  // Real-Time WebSocket state
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const wsRef = useRef(null);

  // New Post Modal & Form State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('NCC');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [customAuthorName, setCustomAuthorName] = useState(user ? user.name : 'Defence Aspirant');
  const [customAuthorRole, setCustomAuthorRole] = useState(user ? (user.verificationBadge || user.role) : 'Verified Cadet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/feed/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setNewMediaUrl(data.fileUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewMediaUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMediaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const feedCategories = [
    'For You', 'NCC', 'Defence Preparation', 'Success Stories', 
    'Camps', 'Study', 'Mentorship', 'Events'
  ];

  useEffect(() => {
    fetchFeed();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeCategory]);

  const connectWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setRealtimeConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NEW_FEED_POST' && data.post) {
            setPosts((prevPosts) => {
              // Avoid duplicate insertion
              if (prevPosts.some(p => p.id === data.post.id)) return prevPosts;
              return [data.post, ...prevPosts];
            });

            // Trigger Real-Time Toast Notification
            setToastNotification({
              id: Date.now(),
              message: `✨ New post in ${data.post.category} by ${data.post.authorName}`,
              time: new Date().toLocaleTimeString()
            });

            setTimeout(() => setToastNotification(null), 5000);
          } else if (data.type === 'POST_APPRECIATED' && data.postId) {
            setPosts((prevPosts) => 
              prevPosts.map(p => p.id === data.postId ? { ...p, appreciationsCount: data.appreciationsCount } : p)
            );
          } else if (data.type === 'NEW_POST_COMMENT' && data.postId) {
            setPosts((prevPosts) => 
              prevPosts.map(p => p.id === data.postId ? { ...p, commentsCount: data.commentsCount } : p)
            );
          }
        } catch (err) {
          console.error('WebSocket Error:', err);
        }
      };

      ws.onclose = () => {
        setRealtimeConnected(false);
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => {
        setRealtimeConnected(false);
      };
    } catch (err) {
      console.error('WS Connection error:', err);
    }
  };

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'For You' 
        ? `${API_BASE_URL}/api/feed` 
        : `${API_BASE_URL}/api/feed?category=${encodeURIComponent(activeCategory)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);

      // Fetch active 24h stories
      const storyRes = await fetch(`${API_BASE_URL}/api/stories`);
      const storyData = await storyRes.json();
      if (storyData.success) setStories(storyData.stories);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/feed/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newContent,
          category: newCategory,
          mediaUrl: newMediaUrl || null,
          authorName: user ? user.name : customAuthorName,
          authorRole: user ? (user.verificationBadge || user.role) : customAuthorRole,
          tags: ['CadetConnect', newCategory.replace(/\s+/g, '')]
        })
      });
      const data = await res.json();
      if (data.success) {
        // Prepend post locally
        setPosts(prev => [data.post, ...prev]);
        setNewContent('');
        setNewMediaUrl('');
        setShowPostModal(false);

        setToastNotification({
          id: Date.now(),
          message: '🚀 Post published & broadcast in real time!',
          time: new Date().toLocaleTimeString()
        });
        setTimeout(() => setToastNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error publishing post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      
      {/* REAL-TIME TOAST ALERT NOTIFICATION */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-navy-900 to-navy-850 border border-amber-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <div>
            <p className="text-xs font-bold text-amber-300">{toastNotification.message}</p>
            <span className="text-[10px] text-slate-400 font-mono">{toastNotification.time} • Live Feed Sync</span>
          </div>
        </div>
      )}

      {/* REAL-TIME GATEWAY HEADER STATUS BAR */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>PRODUCTION REAL-TIME ENGINE ONLINE</span>
          </div>
          <span className="text-xs text-slate-300 font-medium hidden md:inline">
            Connects candidates, cadets, mentors & recruiters with instant push broadcasts
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 self-end sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{realtimeConnected ? 'WebSocket Gateway Active' : 'Connecting to Cloud...'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Profile & Navigation Summary */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-5 shadow-xl text-white">
            <div className="text-center">
              <img
                src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="Profile"
                className="w-16 h-16 rounded-full mx-auto border-2 border-amber-500 object-cover shadow-md mb-2"
              />
              <h3 className="text-sm font-bold text-white">{user ? user.name : 'Guest Defence Candidate'}</h3>
              <span className="inline-block mt-1 bg-amber-500/10 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {user ? (user.verificationBadge || user.role) : 'Verified Community Member'}
              </span>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {user ? user.bio : 'Targeting Defence & Civil Services Officer Entries 🇮🇳'}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-navy-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Exam Eligibility:</span>
                <a href="/eligibility" className="font-bold text-amber-400 hover:underline">Check Status</a>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Unit / Institution:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[120px]">{user?.college || 'Defence Network'}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Widget */}
          <div className="bg-navy-900/80 text-white p-4 rounded-2xl border border-navy-800 text-xs space-y-2 shadow-xl">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Gazette Notice Board</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              UPSC CDS II & SSC CGL 2026 notifications active. Check your exact eligibility criteria in real time!
            </p>
            <a
              href="/eligibility"
              className="inline-block text-[11px] font-bold text-amber-300 hover:text-amber-200 pt-1"
            >
              Open Eligibility Checker →
            </a>
          </div>
        </aside>

        {/* Main Feed Content Column */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* 24-Hour Stories Tray */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-3 shadow-xl text-white">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                24-Hour Cadet Stories
              </span>
              <span className="text-[10px] text-slate-400">Expiring updates</span>
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none">
              {/* Add Story Button */}
              <button
                onClick={() => setShowPostModal(true)}
                className="flex-shrink-0 w-16 h-24 rounded-xl bg-navy-950 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center gap-1 hover:border-amber-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-navy-950 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-300">Add Story</span>
              </button>

              {/* Story Avatars */}
              {stories.map((story) => (
                <div key={story.id} className="flex-shrink-0 w-16 h-24 rounded-xl relative overflow-hidden group cursor-pointer border-2 border-amber-500 shadow-md">
                  <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate">
                    {story.authorName.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LINKEDIN-STYLE POST CREATION BAR (EVERYONE CAN POST!) */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl text-white">
            <div className="flex items-center space-x-3">
              <img
                src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border border-amber-500/50"
              />
              <button
                onClick={() => setShowPostModal(true)}
                className="flex-1 bg-navy-950 hover:bg-navy-850 text-slate-400 text-xs text-left px-4 py-3 rounded-xl border border-navy-700 hover:border-amber-500/60 transition-all shadow-inner font-medium"
              >
                Start a post... share an NCC achievement, camp story, or study note
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-navy-800 mt-3 pt-2 text-xs text-slate-300">
              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-800 text-amber-400 font-semibold transition-colors"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Media</span>
              </button>

              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-800 text-blue-400 font-semibold transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Notes</span>
              </button>

              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-800 text-emerald-400 font-semibold transition-colors"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Achievement</span>
              </button>

              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-800 text-purple-400 font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* Feed Category Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {feedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-navy-950 shadow-md scale-105'
                    : 'bg-navy-900 text-slate-300 border border-navy-700 hover:bg-navy-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Real-time Feed Items */}
          {loading ? (
            <div className="space-y-4 py-6">
              <div className="bg-navy-900/90 border border-navy-700 rounded-2xl p-6 animate-pulse space-y-3">
                <div className="h-4 bg-navy-800 rounded w-1/3"></div>
                <div className="h-3 bg-navy-800 rounded w-full"></div>
                <div className="h-3 bg-navy-800 rounded w-2/3"></div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-8 text-center space-y-2 text-white">
              <Flame className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No posts found in category '{activeCategory}'</h3>
              <p className="text-xs text-slate-400">Be the first cadet or aspirant to share updates in this category!</p>
              <button
                onClick={() => setShowPostModal(true)}
                className="mt-3 inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </main>

        {/* Right Sidebar Events & Exam Eligibility Banner */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          
          <div className="bg-gradient-to-br from-amber-500/10 via-navy-900 to-navy-900 border border-amber-500/40 p-5 rounded-2xl text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300 text-xs">Real-Time Eligibility Platform</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Check your exact eligibility for UPSC NDA, CDS, AFCAT, SSC CGL/GD, Bank PO, Railways & Paramilitary entries with official gazette rules.
            </p>
            <a
              href="/eligibility"
              className="block w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl text-xs transition-all shadow-lg"
            >
              Check My Eligibility Now
            </a>
          </div>

          <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl text-white">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              Upcoming Defence Events
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-800">
                <div className="font-bold text-white">CATC 2026 Range Firing</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-0.5">Sept 15, 2026 • Cuttack</div>
                <p className="text-[11px] text-slate-400 mt-1">10-Day residential tactical training camp for 4 (O) Bn.</p>
              </div>

              <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-800">
                <div className="font-bold text-white">SSB Stage II Masterclass</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-0.5">Aug 30, 2026 • Live Online</div>
                <p className="text-[11px] text-slate-400 mt-1">Led by Col. Vikram Rathore (Ex-14 SSB Allahabad).</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* LINKEDIN-STYLE POST CREATION MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-950 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create Defence Community Post</h3>
              </div>
              <button 
                onClick={() => setShowPostModal(false)} 
                className="text-slate-400 hover:text-white bg-navy-800 p-1.5 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              
              {/* Author name override if guest */}
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cadet Rahul Sharma"
                      value={customAuthorName}
                      onChange={(e) => setCustomAuthorName(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Your Role / Rank</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified Cadet / Aspirant"
                      value={customAuthorRole}
                      onChange={(e) => setCustomAuthorRole(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Select Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="NCC">NCC</option>
                  <option value="Defence Preparation">Defence Preparation</option>
                  <option value="Success Stories">Success Stories</option>
                  <option value="Camps">Camps</option>
                  <option value="Study">Study Notes</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={4}
                  required
                  placeholder="What do you want to talk about? Share an achievement, camp story, or study note..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Media File Attachment Chooser */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Add Image, Document, or Photo Attachment
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-850 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md group"
                  >
                    <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{uploadingFile ? 'Uploading file...' : '📁 Choose File from Device'}</span>
                  </button>

                  <span className="text-[10px] text-slate-400 uppercase font-mono">or</span>
                </div>

                <input
                  type="url"
                  placeholder="Paste image / attachment URL (e.g. https://images.unsplash.com/...)"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />

                {/* Live Preview Thumbnail */}
                {newMediaUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-navy-700 max-h-48 bg-black/40 flex items-center justify-center group">
                    <img 
                      src={newMediaUrl} 
                      alt="Attachment Preview" 
                      className="max-h-48 w-full object-cover rounded-xl"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewMediaUrl('')}
                      className="absolute top-2 right-2 bg-navy-950/90 text-white text-xs px-2 py-1 rounded-lg border border-red-500/50 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-navy-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish & Broadcast Live'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
