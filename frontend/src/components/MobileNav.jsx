import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Users, MessageSquare, UserCheck, BookOpen, Bot, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Eligibility', path: '/eligibility', icon: ShieldCheck },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Groups', path: '/communities', icon: Users },
    { label: 'Mentors', path: '/mentorship', icon: UserCheck },
    { label: 'Notes', path: '/knowledge', icon: BookOpen },
    { label: 'AI Guide', path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-950/95 backdrop-blur-lg border-t border-navy-800 text-white z-40 px-1 py-1 shadow-2xl">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          const isAi = link.path === '/ai-assistant';
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-amber-400 font-bold scale-105 bg-navy-900/80 border border-amber-500/30' 
                  : isAi 
                    ? 'text-amber-400 hover:text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
