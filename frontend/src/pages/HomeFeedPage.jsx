import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { 
  Plus, Image, FileText, Award, HelpCircle, Flame, 
  Send, Sparkles, Filter, ShieldCheck, Clock
} from 'lucide-react';

export const HomeFeedPage = () => {
  const { user, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [loading, setLoading] = useState(true);

  // New Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('NCC');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const feedCategories = [
    'For You', 'NCC', 'Defence Preparation', 'Success Stories', 
    'Camps', 'Study', 'Mentorship', 'Events'
  ];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'For You' ? '/api/feed' : `/api/feed?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);

      // Fetch active 24h stories
      const storyRes = await fetch('/api/stories');
      const storyData = await storyRes.json();
      if (storyData.success) setStories(storyData.stories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch('/api/feed/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newContent,
          category: newCategory,
          mediaUrl: newMediaUrl || null,
          tags: ['CadetConnect', newCategory.replace(/\s+/g, '')]
        })
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewContent('');
        setNewMediaUrl('');
        setShowPostModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Profile Summary */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          {user && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="text-center">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-amber-500 object-cover shadow-sm mb-2"
                />
                <h3 className="text-sm font-bold text-navy-900">{user.name}</h3>
                <span className="inline-block mt-1 bg-olive-100 text-olive-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-olive-200">
                  {user.verificationBadge || user.role}
                </span>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{user.bio}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Unit / College:</span>
                  <span className="font-semibold text-navy-900 truncate max-w-[120px]">{user.college || 'NCC Unit'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Role:</span>
                  <span className="font-mono text-olive-800">{user.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Notice Widget */}
          <div className="bg-navy-900 text-white p-4 rounded-lg border border-navy-800 text-xs space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Notice Board</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              State CATC 2026 registration is now open in Camp Discovery. Submit applications before Sept 1st.
            </p>
          </div>
        </aside>

        {/* Main Feed Content Column */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* 24-Hour Stories Tray */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                24-Hour Cadet Stories
              </span>
              <span className="text-[10px] text-slate-400">Expiring updates</span>
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none">
              {/* Add Story Button */}
              <button
                onClick={() => alert('Story creation opened!')}
                className="flex-shrink-0 w-16 h-24 rounded-lg bg-sand-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 hover:border-olive-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-olive-700 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Add Story</span>
              </button>

              {/* Story Avatars */}
              {stories.map((story) => (
                <div key={story.id} className="flex-shrink-0 w-16 h-24 rounded-lg relative overflow-hidden group cursor-pointer border-2 border-amber-500 shadow-sm">
                  <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white truncate">
                    {story.authorName.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Post Prompt Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <img
                src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
              />
              <button
                onClick={() => setShowPostModal(true)}
                className="flex-1 bg-sand-100 hover:bg-sand-200 text-slate-500 text-xs text-left px-4 py-2.5 rounded-full border border-slate-300 transition-colors"
              >
                Share an NCC achievement, camp memory, or study notes...
              </button>
            </div>
          </div>

          {/* Feed Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {feedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-olive-700 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Items */}
          {loading ? (
            <div className="space-y-4 py-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-2">
              <Flame className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-navy-900">No posts found in category '{activeCategory}'</h3>
              <p className="text-xs text-slate-500">Be the first cadet or aspirant to share updates in this category.</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </main>

        {/* Right Sidebar Suggestions & Events */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
              Upcoming Defence Events
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-sand-50 rounded border border-slate-200">
                <div className="font-bold text-navy-900">CATC 2026 Range Firing</div>
                <div className="text-[11px] text-olive-800 font-semibold mt-0.5">Sept 15, 2026 • Cuttack</div>
                <p className="text-[11px] text-slate-500 mt-1">10-Day residential tactical training camp for 4 (O) Bn.</p>
              </div>

              <div className="p-2.5 bg-sand-50 rounded border border-slate-200">
                <div className="font-bold text-navy-900">SSB Stage II Masterclass</div>
                <div className="text-[11px] text-blue-800 font-semibold mt-0.5">Aug 30, 2026 • Live Online</div>
                <p className="text-[11px] text-slate-500 mt-1">Led by Col. Vikram Rathore (Ex-14 SSB Allahabad).</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* New Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-navy-900">Create Defence Community Post</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Post Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-navy-900"
                >
                  <option value="NCC">NCC</option>
                  <option value="Defence Preparation">Defence Preparation</option>
                  <option value="Success Stories">Success Stories</option>
                  <option value="Camps">Camps</option>
                  <option value="Study">Study</option>
                  <option value="Mentorship">Mentorship</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience, camp updates, or preparation strategy..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-md p-3 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Media URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-navy-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-olive-700 text-white font-semibold text-xs rounded-md hover:bg-olive-600 transition-colors"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
