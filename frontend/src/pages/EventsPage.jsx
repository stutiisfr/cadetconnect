import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Clock, CheckCircle, Flag } from 'lucide-react';

export const EventsPage = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (evtId, title) => {
    if (!token) return alert('Please sign in.');
    try {
      const res = await fetch(`/api/events/${evtId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          NCC Camps & Defence Events Discovery
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Discover CATC, RDC, TSC leadership camps, SSB interactive workshops, and webinars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:border-olive-500 transition-all flex flex-col justify-between">
            <div>
              <div className="h-40 bg-slate-200 relative overflow-hidden">
                <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-navy-900 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded border border-navy-700">
                  {evt.category}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-navy-900">{evt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                <div className="bg-sand-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-olive-700" />
                    <span>{evt.date} ({evt.time})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-olive-700" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-amber-700" />
                    <span>By: {evt.organizer}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <span>{evt.participantsCount} Registered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => handleRegister(evt.id, evt.title)}
                className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold py-2.5 rounded-md flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Register for Event</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
