import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Star, Calendar, Clock, CheckCircle, Shield, Award, MessageSquare } from 'lucide-react';

export const MentorshipPage = () => {
  const { user, token } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Mentorship Modal State
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('SSB Personal Interview & OLQ Strategy');
  const [date, setDate] = useState('2026-09-02');
  const [time, setTime] = useState('17:00 IST');
  const [notes, setNotes] = useState('');

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentorship');
      const data = await res.json();
      if (data.success) setMentors(data.mentors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleRequestSession = async (e) => {
    e.preventDefault();
    if (!token) return alert('Please sign in to request a session.');
    if (!selectedMentor) return;

    try {
      const res = await fetch(`/api/mentorship/${selectedMentor.id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          preferredDate: date,
          preferredTime: time,
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedMentor(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 mb-2 font-mono">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Guidance from Experience</span>
          </div>
          <h2 className="text-2xl font-bold font-heading">Verified Defence Mentors</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Schedule 1-on-1 mentoring sessions with verified ex-SSB assessors, serving officers, veterans, and senior under officers.
          </p>
        </div>
      </div>

      {/* Mentors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-olive-500 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={mentor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                  alt={mentor.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="text-sm font-bold text-navy-900">{mentor.name}</h3>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-olive-800 bg-olive-100 px-2 py-0.5 rounded border border-olive-200">
                    {mentor.verificationBadge || '✓ Verified Mentor'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-4">{mentor.bio}</p>

              {mentor.profile && (
                <div className="bg-sand-50 p-3 rounded border border-slate-200 space-y-1 text-[11px] mb-4">
                  <div className="font-semibold text-navy-900">Areas of Guidance:</div>
                  <div className="flex flex-wrap gap-1">
                    {(mentor.profile.expertise || []).map((exp, i) => (
                      <span key={i} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-amber-600 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{mentor.profile ? mentor.profile.rating : 4.9}</span>
              </div>

              <button
                onClick={() => setSelectedMentor(mentor)}
                className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Session</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Mentorship Session Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
              <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">Book Session with {selectedMentor.name}</h3>
                <p className="text-[11px] text-slate-500">45-Minute 1-on-1 Guidance Session</p>
              </div>
            </div>

            <form onSubmit={handleRequestSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">Session Topic / Objective</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                >
                  <option value="SSB Personal Interview & OLQ Strategy">SSB Personal Interview & OLQ Strategy</option>
                  <option value="Psychology Test Review (TAT/WAT/SRT)">Psychology Test Review (TAT/WAT/SRT)</option>
                  <option value="CDS / AFCAT Written Prep Guidance">CDS / AFCAT Written Prep Guidance</option>
                  <option value="NCC Leadership & Camp Advice">NCC Leadership & Camp Advice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Preferred Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 17:00 IST"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Specific Questions or Background</label>
                <textarea
                  rows={3}
                  placeholder="Mention your target exam, SSB date, or specific challenges..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded p-2 text-navy-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-olive-700 text-white font-semibold rounded hover:bg-olive-600 shadow-sm"
                >
                  Send Mentorship Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
