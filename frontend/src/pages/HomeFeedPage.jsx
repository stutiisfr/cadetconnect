import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { StoryTrayViewer } from '../components/StoryTrayViewer';
import { API_BASE_URL, getApiUrl } from '../config';
import { 
  Plus, Image, FileText, Award, HelpCircle, Flame, 
  Send, Sparkles, Filter, ShieldCheck, Clock, Radio, 
  Share2, Camera, Video, Bell, CheckCircle, MessageSquare, BookOpen, ChevronRight, User
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
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setNewMediaUrl(base64Url);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(getApiUrl('/api/feed/upload'), {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.fileUrl) {
          setNewMediaUrl(getApiUrl(data.fileUrl));
        }
      } catch (err) {
        // Retain Data URL Base64 preview fallback
      } finally {
        setUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
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
              if (prevPosts.some(p => p.id === data.post.id)) return prevPosts;
              return [data.post, ...prevPosts];
            });

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
          } else if (data.type === 'POST_DELETED' && data.postId) {
            setPosts((prevPosts) => prevPosts.filter(p => p.id !== data.postId));
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      ws.onclose = () => {
        setRealtimeConnected(false);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  };

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'For You' 
        ? getApiUrl('/api/feed') 
        : getApiUrl(`/api/feed?category=${encodeURIComponent(activeCategory)}`);
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);

      // Fetch active 24h stories
      const storyRes = await fetch(getApiUrl('/api/stories'));
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

      const res = await fetch(getApiUrl('/api/feed/create'), {
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
        setPosts(prev => [data.post, ...prev]);
        setNewContent('');
        setNewMediaUrl('');
        setShowPostModal(false);

        setToastNotification({
          id: Date.now(),
          message: '🚀 Post published in real time across CadetConnect!',
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
    <div className="bg-sand-100 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Real-time Toast Alert Notification */}
        {toastNotification && (
          <div className="fixed top-20 right-4 z-50 bg-navy-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-navy-700 animate-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">{toastNotification.message}</p>
              <span className="text-[10px] text-slate-400 font-mono">{toastNotification.time} • Live Feed Sync</span>
            </div>
          </div>
        )}

        {/* Real-time System Status Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>REAL-TIME ENGINE ACTIVE</span>
            </div>
            <span className="text-xs text-slate-600 font-medium hidden md:inline">
              Instant live feed synchronization for cadets, aspirants, and mentors
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 self-end sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{realtimeConnected ? 'WebSocket Gateway Live' : 'Connecting to Gateway...'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Profile & Navigation Summary */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-navy-900 space-y-4">
              <div className="text-center">
                <img
                  src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mx-auto border-2 border-olive-700 object-cover shadow-sm mb-2"
                />
                <h3 className="text-sm font-bold text-navy-900">{user ? user.name : 'Guest Defence Candidate'}</h3>
                <span className="inline-block mt-1 bg-olive-50 text-olive-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-olive-200">
                  {user ? (user.verificationBadge || user.role) : 'Verified Member'}
                </span>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {user ? user.bio : 'Targeting Defence & Civil Services Officer Entries 🇮🇳'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <a 
                  href={`/profile/${user ? user.username : ''}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-sand-50 hover:bg-sand-100 text-navy-900 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-olive-700" />
                    <span>View Profile</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a 
                  href="/eligibility"
                  className="flex items-center justify-between p-2 rounded-xl bg-sand-50 hover:bg-sand-100 text-navy-900 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Exam Eligibility</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a 
                  href="/knowledge"
                  className="flex items-center justify-between p-2 rounded-xl bg-sand-50 hover:bg-sand-100 text-navy-900 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Study Notes Hub</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Gazette Notice Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-navy-900">
                <ShieldCheck className="w-4 h-4 text-olive-700" />
                <span>Official Gazette Notice Board</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                UPSC CDS II & SSC CGL 2026 notifications active. Verify your eligibility status in real time!
              </p>
              <a
                href="/eligibility"
                className="inline-block text-[11px] font-bold text-olive-700 hover:underline pt-1"
              >
                Open Eligibility Checker →
              </a>
            </div>
          </aside>

          {/* MAIN FEED COLUMN */}
          <main className="lg:col-span-6 space-y-4">
            
            {/* 24-Hour Instagram-Style Stories Tray */}
            <StoryTrayViewer
              stories={stories}
              onStoryCreated={(newStory) => setStories(prev => [newStory, ...prev])}
              onStoryDeleted={(id) => setStories(prev => prev.filter(s => s.id !== id))}
            />

            {/* POST CREATION BAR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-olive-700/40"
                />
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 bg-sand-50 hover:bg-sand-100 text-slate-500 text-xs text-left px-4 py-3 rounded-xl border border-slate-300 transition-all font-medium"
                >
                  Start a post... share an NCC achievement, camp story, or study note
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2 text-xs text-slate-600">
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sand-100 text-slate-700 font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4 text-olive-700" />
                  <span>Media</span>
                </button>

                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sand-100 text-slate-700 font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Notes</span>
                </button>

                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sand-100 text-slate-700 font-semibold transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Achievement</span>
                </button>

                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-olive-700 hover:bg-olive-600 text-white font-bold rounded-xl shadow-xs transition-all"
                >
                  <span>Post</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {feedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-sand-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            {loading ? (
              <div className="space-y-4 py-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse space-y-3 shadow-xs">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 text-navy-900 shadow-xs">
                <Flame className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-navy-900">No posts in '{activeCategory}'</h3>
                <p className="text-xs text-slate-500">Be the first cadet or aspirant to share updates in this category!</p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="mt-3 inline-block px-5 py-2.5 bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </main>

          {/* RIGHT SIDEBAR: Gazette & Events */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-navy-950 border border-navy-800 p-5 rounded-2xl text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-300 text-xs">Real-Time Eligibility Checker</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Check exact age, education, and attempt eligibility for UPSC NDA, CDS, AFCAT, and SSC entries.
              </p>
              <a
                href="/eligibility"
                className="block w-full text-center py-2.5 bg-olive-700 hover:bg-olive-600 text-white font-bold rounded-xl text-xs transition-all shadow"
              >
                Check My Eligibility Now
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-navy-900 space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Upcoming Defence Events
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sand-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-navy-900">CATC 2026 Range Firing</div>
                  <div className="text-[11px] text-olive-800 font-semibold mt-0.5">Sept 15, 2026 • Cuttack</div>
                  <p className="text-[11px] text-slate-600 mt-1">10-Day residential tactical training camp for 4 (O) Bn.</p>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-navy-900">SSB Stage II Masterclass</div>
                  <div className="text-[11px] text-blue-700 font-semibold mt-0.5">Aug 30, 2026 • Live Online</div>
                  <p className="text-[11px] text-slate-600 mt-1">Led by Col. Vikram Rathore (Ex-14 SSB Allahabad).</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* POST CREATION MODAL */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-navy-900 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-olive-700" />
                  <h3 className="text-base font-bold text-navy-900">Create Community Post</h3>
                </div>
                <button 
                  onClick={() => setShowPostModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Select Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  >
                    <option value="NCC">NCC Wing & Training</option>
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
                    placeholder="What do you want to share? Mention achievements, camp stories, or SSB queries..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl p-3 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>

                {/* File Attachment Selector */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Attach Media or Document</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileSelect}
                    className="w-full text-xs text-slate-600 border border-slate-300 rounded-xl bg-sand-50 p-2"
                  />
                  {uploadingFile && (
                    <span className="text-[10px] text-olive-700 font-bold mt-1 block">Processing file attachment...</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-sand-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingFile}
                    className="px-5 py-2.5 bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
