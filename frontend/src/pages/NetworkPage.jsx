import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, CheckCircle, Shield, Building, Compass } from 'lucide-react';

export const NetworkPage = () => {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/network/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [token]);

  const handleConnect = async (targetId, name) => {
    try {
      const res = await fetch(`/api/network/connect/${targetId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Connected with ${name}!`);
        fetchSuggestions();
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
          <Users className="w-5 h-5 text-amber-400" />
          Defence Network & Recommendations
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Connect with cadets from your NCC Directorate, Unit, College alumni, and Defence Aspirants with shared entry goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((person) => (
          <div key={person.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-olive-500 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={person.name}
                  className="w-12 h-12 rounded-full object-cover border border-amber-500/40"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="text-sm font-bold text-navy-900">{person.name}</h3>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-olive-800 bg-olive-100 px-2 py-0.5 rounded">
                    {person.verificationBadge || person.role}
                  </span>
                </div>
              </div>

              <div className="bg-sand-50 p-2.5 rounded border border-slate-200 text-xs mb-3">
                <span className="text-[10px] text-slate-500 block">Recommendation Context:</span>
                <span className="font-semibold text-navy-900">{person.recommendationReason}</span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{person.bio}</p>
            </div>

            <button
              onClick={() => handleConnect(person.id, person.name)}
              className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold py-2 rounded-md flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Connect</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
