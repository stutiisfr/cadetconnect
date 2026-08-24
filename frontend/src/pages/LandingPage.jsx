import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  Shield, Users, BookOpen, UserCheck, Calendar, Award, 
  CheckCircle, ChevronRight, Lock, Flag, Star, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, MessageSquare, Video, Film, Share2, Target,
  FileText, Zap, Compass, HelpCircle, Eye, AlertTriangle, Layers, Heart,
  Building, LogIn, UserPlus, Smartphone, Bot, GraduationCap, Check, Quote
} from 'lucide-react';

export const LandingPage = () => {
  const [activeRoleTab, setActiveRoleTab] = useState('CADET');

  return (
    <div className="min-h-screen bg-sand-100 text-navy-900 flex flex-col font-sans selection:bg-olive-700 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="bg-navy-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-navy-800">
        {/* Background Gradient Mesh & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-olive-900/30 via-navy-950 to-navy-950 pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-olive-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 bg-olive-900/90 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold border border-olive-600/50 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>India's Dedicated NCC & Defence Aspirant Professional Ecosystem</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.1]">
                Where Future Leaders <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-olive-400 to-emerald-400">
                  Connect, Prepare & Serve.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                Join over <strong className="text-white font-semibold">15,000+ NCC Cadets</strong>, defence aspirants, decorated veterans, and SSB mentors on India's verified professional network built specifically for the armed forces community.
              </p>

              {/* Primary Call-to-Action Bar */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="bg-olive-700 hover:bg-olive-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all border border-olive-500 shadow-xl shadow-olive-950/50 flex items-center gap-2.5 group transform hover:-translate-y-0.5"
                  id="hero-join-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Cadet Network</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="bg-navy-900/90 hover:bg-navy-800 text-slate-100 font-bold text-sm px-7 py-3.5 rounded-xl transition-all border border-slate-700 hover:border-amber-400 flex items-center gap-2 shadow-lg transform hover:-translate-y-0.5"
                  id="hero-signin-btn"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Sign In to Account</span>
                </Link>

                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-amber-300 underline underline-offset-4 px-2 py-1 transition-colors"
                >
                  Explore Demo Profiles →
                </Link>
              </div>

              {/* Trust & Verification Badges Ribbon */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-navy-800/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Regimental Privacy Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Verified Mentor Roster</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-400" />
                  <span>Veer AI 24/7 Defence Guide</span>
                </div>
              </div>

            </div>

            {/* Right Hero Badge Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-navy-900 to-navy-950 border-2 border-olive-600/40 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-navy-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Logo size="sm" showText={false} />
                    <div>
                      <h3 className="text-sm font-bold text-white font-heading tracking-wide">DIGITAL CADET ID</h3>
                      <p className="text-[10px] text-amber-400 font-mono">NATIONAL CADET CORPS</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    VERIFIED
                  </span>
                </div>

                <div className="py-5 flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                    alt="Cadet SUO Rahul Das"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">SUO Rahul Das</h4>
                    <p className="text-xs text-amber-400 font-semibold">Senior Under Officer • 4 (O) Bn NCC</p>
                    <p className="text-[11px] text-slate-300 font-mono">Odisha Directorate • Cuttack Group</p>
                  </div>
                </div>

                {/* Secure Badge Breakdown */}
                <div className="bg-navy-950/80 p-3.5 rounded-xl border border-navy-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Certificates:</span>
                    <span className="font-semibold text-emerald-400">B Cert (Grade A), C Cert Prep</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">National Camp:</span>
                    <span className="font-semibold text-amber-300">Republic Day Camp (RDC 2025)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 border-t border-navy-800/80 pt-2">
                    <span className="text-slate-400">Regimental Privacy:</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-navy-900 px-2 py-0.5 rounded">OD/22/••/•••••• (Encrypted)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">CADETCONNECT PLATFORM</span>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>View Public Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Real-time Platform Metric Tickers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-navy-800/80 text-center">
            <div className="bg-navy-900/60 border border-navy-800 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">15,000+</div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">Enrolled Cadets & Aspirants</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-800 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-olive-400 font-heading">17 / 17</div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">NCC State Directorates</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-800 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-heading">1,200+</div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">Verified Mentors & Veterans</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-800 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-heading">98.4%</div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">SSB Guidance Satisfaction</p>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. TAILORED PLATFORM CAPABILITIES BY ROLE */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold font-mono text-olive-800 bg-olive-100 px-3.5 py-1.5 rounded-full border border-olive-200 uppercase tracking-wider">
            Built for the Entire Community
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-950">
            A Specialized Experience for Every Defence Stakeholder
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you are marching at Republic Day Camp, preparing for NDA & CDS entries, or guiding junior aspirants, CadetConnect provides the specialized tools you need.
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-200/80 p-1.5 rounded-xl max-w-lg w-full">
            <button
              onClick={() => setActiveRoleTab('CADET')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeRoleTab === 'CADET' ? 'bg-navy-900 text-white shadow-md' : 'text-slate-700 hover:text-navy-900'
              }`}
            >
              NCC Cadets
            </button>
            <button
              onClick={() => setActiveRoleTab('ASPIRANT')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeRoleTab === 'ASPIRANT' ? 'bg-navy-900 text-white shadow-md' : 'text-slate-700 hover:text-navy-900'
              }`}
            >
              Defence Aspirants
            </button>
            <button
              onClick={() => setActiveRoleTab('MENTOR')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeRoleTab === 'MENTOR' ? 'bg-navy-900 text-white shadow-md' : 'text-slate-700 hover:text-navy-900'
              }`}
            >
              Seniors & Mentors
            </button>
          </div>
        </div>

        {/* Role Content Display */}
        {activeRoleTab === 'CADET' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-olive-500 transition-colors">
              <div className="w-10 h-10 bg-olive-100 text-olive-700 rounded-xl flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Digital NCC Journey & Ranks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log promotions from Cadet to SUO, record CATC, TSC, and RDC camps, and preserve your verified service record in a shareable digital portfolio.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-olive-500 transition-colors">
              <div className="w-10 h-10 bg-olive-100 text-olive-700 rounded-xl flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">B & C Certificate Master Hub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct access to weapon specs (.22 rifle, 7.62mm SLR, INSAS), drill voice commands, map reading formulas, and past year question papers.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-olive-500 transition-colors">
              <div className="w-10 h-10 bg-olive-100 text-olive-700 rounded-xl flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Regimental Number Privacy Vault</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your regimental number is verified through unit verification requests and kept completely encrypted from unauthorized public viewing.
              </p>
            </div>
          </div>
        )}

        {activeRoleTab === 'ASPIRANT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-blue-500 transition-colors">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Exam Focused Preparation Circles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated channels and communities for NDA, CDS, AFCAT, CAPF, and Agniveer written examinations with peer study rooms.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-blue-500 transition-colors">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">1-on-1 SSB Mock Interviews</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schedule personal mentoring sessions with recommended candidates, IOs, GTOs, and psychologists for tailored feedback.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-blue-500 transition-colors">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Veer AI Defence Tutor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant answers to OIR reasoning puzzles, WAT sentence formulation, SRT situational responses, and current affairs.
              </p>
            </div>
          </div>
        )}

        {activeRoleTab === 'MENTOR' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-amber-500 transition-colors">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Automated Session Scheduler</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set your availability, accept mentorship requests, and manage 1-on-1 video consultations with integrated meeting links.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-amber-500 transition-colors">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Official Mentor Verification Badge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build your trusted reputation with verified service credentials, recommended entry stamps, and cadet feedback ratings.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 hover:border-amber-500 transition-colors">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-heading">Publish Articles & Lecture Series</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Share study guides, SSB strategy papers, and motivational webinars with thousands of eager aspirants across the country.
              </p>
            </div>
          </div>
        )}

      </section>


      {/* ========================================================================= */}
      {/* 3. CENTRALIZED DEFENCE KNOWLEDGE HUB PREVIEW */}
      {/* ========================================================================= */}
      <section id="knowledge-hub" className="bg-navy-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-navy-800">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
                Curated Repository
              </span>
              <h2 className="text-3xl font-extrabold font-heading text-white mt-2">
                Centralized Defence Knowledge & Training Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Say goodbye to scattered, unverified notes across unorganized chat groups. Access verified study material curated by toppers and instructors.
              </p>
            </div>

            <Link
              to="/login"
              className="bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs px-5 py-2.5 rounded-xl border border-navy-700 hover:border-amber-400 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <span>Explore Full Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                category: 'NCC Syllabus',
                title: '7.62mm SLR & .22 Rifle Manual',
                desc: 'Stripping, assembling, safety precautions, effective ranges and marksmanship fundamentals.',
                icon: Shield,
                badge: 'Verified PDF'
              },
              {
                category: 'SSB Stage II',
                title: 'GTO Tasks & Snake Race Blueprint',
                desc: 'Progressive Group Tasks, HGT cantilever principles, command tasks and individual obstacles.',
                icon: Target,
                badge: 'Recommended Guide'
              },
              {
                category: 'Written Exams',
                title: 'CDS & NDA General Knowledge Digest',
                desc: 'Indian Polity, Modern History, Physical Geography and Defence Current Affairs compendium.',
                icon: BookOpen,
                badge: 'Updated 2026'
              },
              {
                category: 'Psychology',
                title: 'TAT, WAT & SRT Practice Sets',
                desc: '60 real-time situational reaction prompts with OLQ assessment rubrics and model responses.',
                icon: Sparkles,
                badge: 'Practice Kit'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-navy-900/90 border border-navy-800 p-5 rounded-2xl space-y-3 hover:border-olive-500 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">{item.category}</span>
                    <span className="text-[9px] bg-navy-950 text-slate-400 px-2 py-0.5 rounded-full border border-navy-800">{item.badge}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. WHY CADETCONNECT - COMPARISON MATRIX */}
      {/* ========================================================================= */}
      <section id="advantages" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold font-mono text-olive-800 bg-olive-100 px-3 py-1 rounded-full border border-olive-200 uppercase tracking-wider">
            Clear Advantage
          </span>
          <h2 className="text-3xl font-extrabold font-heading text-navy-900">
            Why Defence Aspirants Choose CadetConnect
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered exclusively for military and defence discipline, authenticity, and verified networking.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-navy-950 text-white uppercase font-heading tracking-wider">
                <tr>
                  <th className="p-4">Capability</th>
                  <th className="p-4 text-slate-400">Generic Platforms</th>
                  <th className="p-4 bg-olive-800 text-amber-300 font-bold">CadetConnect Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  {
                    cap: 'Community Focus',
                    gen: 'Mixed general social media noise & distractions',
                    cadet: '100% Defence, NCC, Armed Forces, and Veteran focused'
                  },
                  {
                    cap: 'Identity Authenticity',
                    gen: 'Unverified random profiles and anonymous handles',
                    cadet: 'Role badges with encrypted Regimental verification'
                  },
                  {
                    cap: 'Resource Verification',
                    gen: 'Unstructured forward messages and outdated PDFs',
                    cadet: 'Curated knowledge hub with verified notes and specs'
                  },
                  {
                    cap: 'Structured Mentorship',
                    gen: 'Informal random DMs with high response delay',
                    cadet: 'Verified veteran session booking with feedback ratings'
                  },
                  {
                    cap: 'AI Assistant',
                    gen: 'Generic non-defence LLMs prone to hallucinations',
                    cadet: 'Veer AI with specialized NCC syllabus & SSB knowledge'
                  }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-sand-50 transition-colors">
                    <td className="p-4 font-bold text-navy-900">{row.cap}</td>
                    <td className="p-4 text-slate-500">{row.gen}</td>
                    <td className="p-4 font-semibold text-emerald-900 bg-olive-50/60 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{row.cadet}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. READY TO JOIN CTA SECTION */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-olive-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-navy-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="w-14 h-14 bg-olive-700 text-amber-300 rounded-2xl flex items-center justify-center mx-auto border border-olive-500 shadow-xl">
            <Flag className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Ready to Begin Your Defence Journey?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create your free profile today, link your regiment or target exam, and step into India's most disciplined and ambitious community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="bg-olive-700 hover:bg-olive-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all border border-olive-500 shadow-lg shadow-olive-950/50 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Profile Now</span>
            </Link>

            <Link
              to="/login"
              className="bg-navy-900 hover:bg-navy-800 text-slate-200 font-bold text-sm px-8 py-3.5 rounded-xl transition-colors border border-navy-700"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. PROFESSIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="mt-auto bg-navy-950 text-slate-400 py-12 border-t border-navy-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3 md:col-span-2">
              <Logo size="md" showText={true} />
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                CadetConnect is a national digital ecosystem designed to connect, mentor, and empower NCC cadets and defence aspirants across India.
              </p>
              <p className="text-[11px] font-mono text-amber-400 font-semibold">
                ONE COMMUNITY • ONE MISSION • COUNTLESS DREAMS
              </p>
            </div>

            <div>
              <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Platform Navigation</h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-amber-400 transition-colors">Sign In Portal</Link></li>
                <li><Link to="/register" className="hover:text-amber-400 transition-colors">Cadet Registration</Link></li>
                <li><a href="#knowledge-hub" className="hover:text-amber-400 transition-colors">Knowledge Repository</a></li>
                <li><a href="#features" className="hover:text-amber-400 transition-colors">Platform Features</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Values & Security</h5>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-300 font-semibold">Trust & Verification</span></li>
                <li><span className="text-slate-300 font-semibold">Regimental Data Privacy</span></li>
                <li><span className="text-slate-300 font-semibold">Leadership & Service</span></li>
                <li><span className="text-amber-400 font-bold">Jai Hind! 🇮🇳</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-navy-800 text-center space-y-2">
            <p className="text-[11px] text-slate-500">
              CadetConnect is an independent professional community platform and is not officially affiliated with the Ministry of Defence or Indian Armed Forces.
            </p>
            <p className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} CadetConnect. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};
