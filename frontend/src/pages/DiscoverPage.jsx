import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Shield, UserCheck, BookOpen, Calendar, Users, CheckCircle, Filter } from 'lucide-react';

export const DiscoverPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Cadets', 'Mentors', 'Notes', 'Events'
  const [results, setResults] = useState({ cadets: [], mentors: [], notes: [], events: [] });
  const [loading, setLoading] = useState(false);

  const executeSearch = async () => {
    setLoading(true);
    try {
      // Fetch matching cadets & mentors
      const mentorRes = await fetch(`/api/mentorship?search=${encodeURIComponent(query)}`);
      const mentorData = await mentorRes.json();

      const noteRes = await fetch(`/api/knowledge?search=${encodeURIComponent(query)}`);
      const noteData = await noteRes.json();

      const evtRes = await fetch(`/api/events?search=${encodeURIComponent(query)}`);
      const evtData = await evtRes.json();

      setResults({
        mentors: mentorData.mentors || [],
        notes: noteData.notes || [],
        events: evtData.events || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Search Bar */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <h2 className="text-xl font-bold font-heading mb-2">Smart Search & Defence Discovery</h2>
        <p className="text-xs text-slate-300 mb-4">Discover verified cadets, ex-SSB mentors, preparation notes, and state camp events.</p>

        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Search cadets, aspirants, mentors, notes, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-navy-950 text-slate-100 text-xs rounded-lg pl-10 pr-4 py-3 border border-navy-700 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-6">
        
        {/* Mentors & Seniors */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-olive-700" />
            Verified Defence Mentors & Seniors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-olive-500 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/40" />
                  <div>
                    <div className="flex items-center space-x-1">
                      <h4 className="text-sm font-bold text-navy-900">{mentor.name}</h4>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-olive-800 bg-olive-100 px-2 py-0.5 rounded">
                      {mentor.verificationBadge || mentor.role}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{mentor.bio}</p>
                <Link
                  to={`/mentor/${mentor.id}`}
                  className="block text-center bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold py-2 rounded-md transition-colors"
                >
                  Request Mentorship
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Study Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            Defence Knowledge Hub Study Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.notes.map((note) => (
              <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                    {note.category} • {note.subject}
                  </span>
                  <h4 className="text-sm font-bold text-navy-900 mt-1">{note.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{note.description}</p>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    Author: {note.authorName} • Downloads: {note.downloadsCount}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Downloading ${note.title}...`)}
                  className="bg-navy-800 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-navy-700"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
