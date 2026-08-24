import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, Award, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

export const NotificationsPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setNotifications(data.notifications);
        });
    }
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Notification Center
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Stay informed on connection acceptances, post appreciations, mentorship requests, and camp reminders.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No new notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-4 flex items-start space-x-3 hover:bg-sand-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-olive-700" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-navy-900 font-medium leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {new Date(n.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
