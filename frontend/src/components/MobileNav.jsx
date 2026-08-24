import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Users, MessageSquare, UserCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Groups', path: '/communities', icon: Users },
    { label: 'Mentors', path: '/mentorship', icon: UserCheck },
    { label: 'Notes', path: '/knowledge', icon: BookOpen },
    { label: 'Chat', path: '/messages', icon: MessageSquare },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-navy-800 text-white z-40 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1.5 px-2 rounded-md transition-colors ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
