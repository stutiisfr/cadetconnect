import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const MeetingsPage = () => {
  const { user, token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings);
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [token]);

  const handleAcceptRequest = async (reqId) => {
    try {
      const res = await fetch(`/api/meetings/requests/${reqId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Request accepted and mentorship session scheduled!');
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          Mentorship Meeting Scheduler
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Manage your upcoming 1-on-1 guidance sessions, calendar slots, and active video rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Confirmed Scheduled Meetings */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            Confirmed Sessions Calendar
          </h3>

          {meetings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
              No upcoming scheduled meetings found. Request a session in the Mentorship tab!
            </div>
          ) : (
            meetings.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-olive-800 bg-olive-100 px-2.5 py-0.5 rounded border border-olive-200">
                    {m.scheduledDate} • {m.scheduledTime}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ {m.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-navy-900">{m.topic}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mentor: <strong>{m.mentorName}</strong> | Cadet: <strong>{m.cadetName}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {m.durationMinutes} Minutes</span>
                  </span>

                  <button
                    onClick={() => alert(`Launching CadetConnect Live Room for session: ${m.topic}`)}
                    className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Live Meeting</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pending Session Requests (For Mentors) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            Incoming Mentorship Requests
          </h3>

          {requests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
              No pending mentorship requests.
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">{r.cadetName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800">{r.topic}</p>
                <p className="text-[11px] text-slate-500">{r.preferredDate} at {r.preferredTime}</p>

                {r.status === 'PENDING' && user && user.role === 'MENTOR' && (
                  <button
                    onClick={() => handleAcceptRequest(r.id)}
                    className="w-full mt-2 bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Accept & Schedule Meeting
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
