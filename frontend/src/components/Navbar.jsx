import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { 
  Home, Users, Compass, BookOpen, Calendar, 
  UserCheck, MessageSquare, Bell, Search, ShieldAlert,
  LogOut, User, Lock, Film, Briefcase, Bot, Sparkles,
  LogIn, UserPlus, Menu, X, ChevronDown, MoreHorizontal
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Core nav links visible on desktop & laptop headers
  const primaryNavLinks = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Network', path: '/network', icon: Users },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Knowledge', path: '/knowledge', icon: BookOpen },
    { label: 'Mentorship', path: '/mentorship', icon: UserCheck },
    { label: 'AI Guide', path: '/ai-assistant', icon: Bot },
  ];

  // Secondary nav links accessible via clean "More ▾" dropdown on laptop screens
  const secondaryNavLinks = [
    { label: 'Communities & Groups', path: '/communities', icon: Users },
    { label: 'Events & Camps', path: '/events', icon: Calendar },
    { label: 'Career Opportunities', path: '/opportunities', icon: Briefcase },
  ];

  if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    secondaryNavLinks.push({ label: 'Admin Control Desk', path: '/admin', icon: ShieldAlert });
  }

  // Public visitor navigation links when logged out
  const publicLinks = [
    { label: 'Ecosystem', path: '/#features' },
    { label: 'Cadet Registry', path: '/#cadet-network' },
    { label: 'Knowledge Hub', path: '/#knowledge-hub' },
    { label: 'SSB Guidance', path: '/#mentorship' },
    { label: 'Why Us', path: '/#advantages' }
  ];

  return (
    <header className="bg-navy-950/95 backdrop-blur-md border-b border-navy-800 text-white sticky top-0 z-50 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <Link to={user ? "/home" : "/"} className="flex items-center shrink-0">
            <Logo size="md" showText={true} />
          </Link>

          {/* Logged-In User Header Controls */}
          {user ? (
            <>
              {/* Desktop Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs shrink-0">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search cadets, notes, camps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-navy-900 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-navy-700 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </form>

              {/* Logged-in Responsive Nav Bar */}
              <nav className="hidden lg:flex items-center space-x-1 shrink">
                {primaryNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  const isAi = link.path === '/ai-assistant';
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-olive-700 text-white border border-olive-500/60 shadow-sm' 
                          : isAi 
                            ? 'text-amber-400 hover:bg-navy-900 hover:text-amber-300'
                            : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* Secondary "More ▾" Dropdown for laptop responsiveness */}
                <div className="relative">
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-navy-900 hover:text-white transition-colors"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      {secondaryNavLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3.5 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                          >
                            <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </nav>

              {/* Right User Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
                <Link
                  to="/messages"
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-navy-900 rounded-lg transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                </Link>

                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-navy-900 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-olive-500 rounded-full"></span>
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-navy-900 border border-transparent hover:border-navy-700 focus:outline-none transition-all"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-500/60 object-cover shadow-sm"
                    />
                    <span className="hidden xl:inline-block text-xs font-bold text-slate-200">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-navy-800">
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email || user.phone}</p>
                        <span className="inline-block mt-1.5 bg-olive-800 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-olive-600 font-semibold">
                          {user.role} {user.isVerified ? '✓ Verified' : ''}
                        </span>
                      </div>

                      <Link
                        to={`/profile/${user.username}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Defence Profile</span>
                      </Link>

                      <Link
                        to="/ai-assistant"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-amber-300 hover:bg-navy-800 hover:text-amber-200"
                      >
                        <Bot className="w-4 h-4 text-amber-400" />
                        <span>Veer AI Assistant</span>
                      </Link>

                      <Link
                        to="/knowledge"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                      >
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>Knowledge Hub</span>
                      </Link>

                      <Link
                        to="/privacy"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Privacy & Security</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left border-t border-navy-800 mt-1 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Logged-Out Visitor Header */
            <>
              <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-300">
                {publicLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.path}
                    className="hover:text-amber-400 transition-colors py-1"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-100 hover:text-white bg-navy-900 hover:bg-navy-800 border border-slate-700 hover:border-amber-400 rounded-xl shadow-sm transition-all"
                  id="navbar-sign-in-btn"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-olive-700 hover:bg-olive-600 text-white rounded-xl border border-olive-500 shadow-md transition-all"
                  id="navbar-join-btn"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>Join Free</span>
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );
};
