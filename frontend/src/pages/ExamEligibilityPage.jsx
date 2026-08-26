import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Search, Filter, Sparkles, User, CheckCircle, 
  XCircle, AlertTriangle, BookOpen, ExternalLink, Calendar, 
  Bell, Bookmark, Zap, RefreshCw, Award, ChevronRight, Info,
  Radio, Clock, Activity, ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { ExamCard } from '../components/ExamCard';
import { CandidateProfileSection } from '../components/CandidateProfileSection';
import { EligibilityResultModal } from '../components/EligibilityResultModal';

export const ExamEligibilityPage = () => {
  const [activeTab, setActiveTab] = useState('auto-match'); // 'auto-match', 'explore', 'checker', 'profile', 'notifications', 'saved'
  const [exams, setExams] = useState([]);
  const [savedExamIds, setSavedExamIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQualification, setSelectedQualification] = useState('All');

  // Real-time WebSocket state
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [liveGazetteBulletin, setLiveGazetteBulletin] = useState({
    title: 'UPSC CDS II 2026: Official Gazette Portal Active — Apply Before 04 June 2026',
    authority: 'UPSC',
    urgency: 'HIGH',
    timestamp: new Date().toLocaleTimeString()
  });
  const [onlineCadetCount, setOnlineCadetCount] = useState(1);
  const wsRef = useRef(null);

  // Auto-Match Results State
  const [autoMatchData, setAutoMatchData] = useState(null);
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);

  // Selected Exam Evaluation Modal State
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);

  // Single Exam Checker Form State
  const [selectedExamId, setSelectedExamId] = useState('nda');
  const [checkerProfile, setCheckerProfile] = useState({
    dob: '2004-05-14',
    gender: 'Male',
    category: 'General',
    stateDomicile: 'Odisha',
    maritalStatus: 'Unmarried',
    highestLevel: 'Graduation',
    status: 'Completed',
    stream12th: 'Science (PCM)',
    overallPercentage12th: 84.0,
    degreeName: 'B.Sc Physics (Hons)',
    graduationPercentage: 78.5,
    heightCm: 172,
    nccCertificate: 'B',
    nccGrade: 'A'
  });

  // Countdown timer calculation for active deadline (UPSC CDS II)
  const [countdown, setCountdown] = useState({ days: 18, hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    fetchExams();
    fetchSavedExams();
    fetchNotifications();
    runAutoMatch();
    connectWebSocket();

    // Countdown interval
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setRealtimeConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'GAZETTE_LIVE_TICKER' && data.bulletin) {
            setLiveGazetteBulletin({
              ...data.bulletin,
              timestamp: new Date().toLocaleTimeString()
            });
            if (data.activeCadetsOnline) setOnlineCadetCount(data.activeCadetsOnline);
          } else if (data.type === 'ELIGIBILITY_PROFILE_UPDATE') {
            runAutoMatch();
          }
        } catch (e) {
          console.error('WS Parse Error:', e);
        }
      };

      ws.onclose = () => {
        setRealtimeConnected(false);
        // Attempt reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => {
        setRealtimeConnected(false);
      };
    } catch (err) {
      console.error('WebSocket Connection Error:', err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/eligibility/exams`);
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (err) {
      console.error('Error loading exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedExams = async () => {
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/saved-exams`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      const data = await res.json();
      if (data.success && data.savedExams) {
        setSavedExamIds(data.savedExams.map(e => e.id));
      }
    } catch (err) {
      console.error('Error loading saved exams:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/eligibility/notifications`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const runAutoMatch = async (customCandidateProfile = null) => {
    setAutoMatchLoading(true);
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/find-matched-exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          candidateProfile: customCandidateProfile || checkerProfile
        })
      });
      const data = await res.json();
      if (data.success) {
        setAutoMatchData(data);
      }
    } catch (err) {
      console.error('Error running auto-match:', err);
    } finally {
      setAutoMatchLoading(false);
    }
  };

  const handleEvaluateExam = async (examObj) => {
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          examId: examObj.id,
          candidateProfile: checkerProfile
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.evaluation);
        setEvalModalOpen(true);
      }
    } catch (err) {
      console.error('Error evaluating exam:', err);
    }
  };

  const handleToggleSave = async (examId) => {
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/save-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ examId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedExamIds([...savedExamIds, examId]);
        } else {
          setSavedExamIds(savedExamIds.filter(id => id !== examId));
        }
      }
    } catch (err) {
      console.error('Error saving exam:', err);
    }
  };

  // Filtered Exams calculation for Explore tab
  const filteredExams = exams.filter(e => {
    const matchCategory = selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchQual = selectedQualification === 'All' || e.eligibilityCriteria.education.minLevel.toLowerCase().includes(selectedQualification.toLowerCase());
    const matchSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.conductingBody.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQual && matchSearch;
  });

  const categories = ['All', 'Defence Exams', 'Civil Services', 'SSC Exams', 'Banking & Financial', 'Railway Exams', 'Police & Paramilitary', 'Teaching & Education'];

  return (
    <div className="min-h-screen bg-navy-950 text-white pb-24 pt-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* REAL-TIME LIVE GAZETTE TICKER BAR */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-amber-500/40 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 animate-pulse">
            <Radio className="w-3 h-3" />
            <span>REAL-TIME GAZETTE LIVE</span>
          </div>

          <p className="text-xs text-slate-200 font-medium truncate">
            <strong className="text-amber-400">[{liveGazetteBulletin.authority || 'UPSC'} Official Alert]:</strong> {liveGazetteBulletin.title}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{realtimeConnected ? 'GATEWAY ONLINE' : 'CONNECTING...'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            {liveGazetteBulletin.timestamp}
          </span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>CadetConnect Official Govt Exam Eligibility Hub</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>INSTANT REACTIVE CALCULATION ENGINE ACTIVE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Check Your Eligibility for All Major <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">Indian Government & Defence Exams</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Enter your academic & personal qualifications once. Automatically discover exact eligibility, age windows, category relaxations, document checklists, and verified official website links across Defence, IAS, SSC, Banking, Railways & Paramilitary entries.
          </p>

          {/* LIVE APPLICATION DEADLINE COUNTDOWN BOX */}
          <div className="mt-5 p-3.5 bg-navy-950/80 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-white block">Next Target Application Deadline: UPSC CDS II 2026</span>
                <span className="text-[10px] text-slate-400">Official Portal: upsc.gov.in (Gazette Ref: 04/2026-CDS-II)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-bold shrink-0 bg-navy-900 px-3 py-1.5 rounded-xl border border-navy-700">
              <span>{countdown.days}d</span>:
              <span>{String(countdown.hours).padStart(2, '0')}h</span>:
              <span>{String(countdown.mins).padStart(2, '0')}m</span>:
              <span className="text-amber-400 animate-pulse">{String(countdown.secs).padStart(2, '0')}s</span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <button
              onClick={() => setActiveTab('auto-match')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'auto-match'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Eligible Exams for Me</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Explore All Exams</span>
            </button>

            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'checker'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Check Exam Eligibility</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <User className="w-4 h-4 text-amber-400 shrink-0" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 scale-105 shadow-amber-500/20'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Saved Exams ({savedExamIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AUTO-MATCH ENGINE ("Find Exams I'm Eligible For") */}
      {activeTab === 'auto-match' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/90 border border-navy-700/80 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Find Exams I'm Eligible For</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Engine compares your saved profile credentials against all active government, civil service & defence exams.
              </p>
            </div>

            <button
              onClick={() => runAutoMatch()}
              disabled={autoMatchLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoMatchLoading ? 'animate-spin' : ''}`} />
              <span>Re-run Auto Match</span>
            </button>
          </div>

          {autoMatchLoading ? (
            <div className="p-12 text-center text-slate-400 bg-navy-900/50 rounded-2xl border border-navy-800">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold">Comparing candidate profile against latest official gazette criteria...</p>
            </div>
          ) : autoMatchData ? (
            <div className="space-y-8">
              
              {/* SECTION: ELIGIBLE EXAMS (GREEN) */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-500/30">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-300">
                    Eligible Exams You Can Apply For ({autoMatchData.eligibleExams.length})
                  </h3>
                </div>

                {autoMatchData.eligibleExams.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-navy-900/40 p-4 rounded-xl">No 100% clean matched exams for current parameters. Check conditionally eligible exams below.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {autoMatchData.eligibleExams.map((evalRes) => (
                      <div key={evalRes.examId} className="bg-navy-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                              ✓ 100% Eligible
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{evalRes.category}</span>
                          </div>

                          <h4 className="text-base font-bold text-white">{evalRes.examTitle}</h4>
                          <p className="text-xs text-slate-400 mt-1">Authority: <strong className="text-slate-200">{evalRes.conductingBody}</strong></p>

                          <div className="mt-3 p-2.5 bg-navy-950/70 rounded-xl border border-navy-800 space-y-1 text-[11px]">
                            {evalRes.reasons.slice(0, 2).map((r, i) => (
                              <p key={i} className="text-emerald-300 truncate">{r}</p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-navy-800 flex items-center gap-2">
                          <button
                            onClick={() => { setEvaluationResult(evalRes); setEvalModalOpen(true); }}
                            className="flex-1 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all text-center"
                          >
                            View Full Reasons
                          </button>
                          <a
                            href={evalRes.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold rounded-xl transition-all shrink-0"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: CONDITIONALLY ELIGIBLE EXAMS (AMBER) */}
              {autoMatchData.conditionallyEligibleExams.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-500/30">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-amber-300">
                      Conditionally Eligible Exams ({autoMatchData.conditionallyEligibleExams.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {autoMatchData.conditionallyEligibleExams.map((evalRes) => (
                      <div key={evalRes.examId} className="bg-navy-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                              ⚠️ Conditional Match
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{evalRes.category}</span>
                          </div>

                          <h4 className="text-base font-bold text-white">{evalRes.examTitle}</h4>
                          <p className="text-xs text-slate-400 mt-1">Authority: <strong className="text-slate-200">{evalRes.conductingBody}</strong></p>

                          <div className="mt-3 p-2.5 bg-navy-950/70 rounded-xl border border-navy-800 space-y-1 text-[11px]">
                            {evalRes.reasons.slice(0, 2).map((r, i) => (
                              <p key={i} className="text-amber-300 truncate">{r}</p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-navy-800 flex items-center gap-2">
                          <button
                            onClick={() => { setEvaluationResult(evalRes); setEvalModalOpen(true); }}
                            className="flex-1 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all text-center"
                          >
                            View Conditions
                          </button>
                          <a
                            href={evalRes.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold rounded-xl transition-all shrink-0"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: INELIGIBLE EXAMS (RED) */}
              {autoMatchData.ineligibleExams.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-500/30">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-base font-bold text-red-300">
                      Currently Ineligible Exams ({autoMatchData.ineligibleExams.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {autoMatchData.ineligibleExams.map((evalRes) => (
                      <div key={evalRes.examId} className="bg-navy-900/50 border border-red-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30">
                              ✕ Ineligible
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{evalRes.category}</span>
                          </div>

                          <h4 className="text-base font-bold text-white">{evalRes.examTitle}</h4>
                          <p className="text-xs text-slate-400 mt-1">Authority: <strong className="text-slate-200">{evalRes.conductingBody}</strong></p>

                          <div className="mt-3 p-2.5 bg-navy-950/70 rounded-xl border border-navy-800 space-y-1 text-[11px]">
                            {evalRes.reasons.filter(r => r.startsWith('❌')).slice(0, 2).map((r, i) => (
                              <p key={i} className="text-red-400 truncate">{r.replace('❌ ', '')}</p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-navy-800">
                          <button
                            onClick={() => { setEvaluationResult(evalRes); setEvalModalOpen(true); }}
                            className="w-full px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                          >
                            Why Not Eligible?
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>
      )}

      {/* TAB 2: EXPLORE ALL EXAMS DIRECTORY */}
      {activeTab === 'explore' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Search & Category Filter Bar */}
          <div className="bg-navy-900/90 border border-navy-700/80 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search exam by title, short code (NDA, CDS, CGL, IAS, PO), or authority (UPSC, SSC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-navy-950 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 border border-navy-700 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                  className="bg-navy-950 text-xs text-white border border-navy-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Qualifications</option>
                  <option value="10th">10th Pass</option>
                  <option value="12th">12th Pass (10+2)</option>
                  <option value="Graduation">Graduation / Degree</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-navy-950 shadow-md'
                      : 'bg-navy-950 text-slate-300 hover:bg-navy-800 border border-navy-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading examinations directory...</div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-navy-900/40 rounded-2xl border border-navy-800">
              No exams found matching your search query. Try broadening your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onCheckEligibility={handleEvaluateExam}
                  isSaved={savedExamIds.includes(exam.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: SINGLE EXAM ELIGIBILITY CHECKER TOOL */}
      {activeTab === 'checker' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-navy-900/90 border border-navy-700/80 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Instant Examination Eligibility Checker</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Select any competitive examination below and adjust parameters to instantly evaluate whether you pass all age, qualification, physical & category criteria.
            </p>

            <div className="space-y-6">
              
              {/* Select Exam Dropdown */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Select Target Examination *</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full bg-navy-950 border border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-amber-400 shadow-inner"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.shortName} — {e.title} ({e.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Parameter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-navy-800">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={checkerProfile.dob}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, dob: e.target.value };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Category (Age Relaxation)</label>
                  <select
                    value={checkerProfile.category}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, category: e.target.value };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="General">General / UR</option>
                    <option value="OBC">OBC (Non-Creamy Layer)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Highest Qualification</label>
                  <select
                    value={checkerProfile.highestLevel}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, highestLevel: e.target.value };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass (10+2)</option>
                    <option value="Graduation">Graduation / Bachelor Degree</option>
                    <option value="Post-Graduation">Post-Graduation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">12th Stream</label>
                  <select
                    value={checkerProfile.stream12th}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, stream12th: e.target.value };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Science (PCM)">Science (Physics, Chemistry, Maths)</option>
                    <option value="Science (PCB)">Science (Physics, Chemistry, Biology)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts / Humanities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Degree Name</label>
                  <select
                    value={checkerProfile.degreeName}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, degreeName: e.target.value };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="B.Tech/B.E.">B.Tech / B.E.</option>
                    <option value="B.Sc Physics (Hons)">B.Sc Physics / Maths</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="B.Com">B.Com</option>
                    <option value="B.A.">B.A.</option>
                    <option value="Other Bachelor Degree">Other Bachelor Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={checkerProfile.heightCm}
                    onChange={(e) => {
                      const newP = { ...checkerProfile, heightCm: parseFloat(e.target.value) || 0 };
                      setCheckerProfile(newP);
                      runAutoMatch(newP);
                    }}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    const targetExam = exams.find(e => e.id === selectedExamId);
                    if (targetExam) handleEvaluateExam(targetExam);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-xl transition-all text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Check Instant Eligibility Now</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 4: CANDIDATE PROFILE SECTION */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-200">
          <CandidateProfileSection onProfileUpdated={(up) => runAutoMatch(up)} />
        </div>
      )}

      {/* TAB 5: OFFICIAL NOTIFICATIONS FEED */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-navy-900/90 border border-navy-700/80 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Official Recruitment Notifications Stream</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct live feed sourced from official Gazette Notifications (UPSC, SSC, Indian Army, IBPS, Railways, OPSC).
            </p>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-5 bg-navy-900/80 border border-navy-700 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {notif.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{notif.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{notif.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{notif.summary}</p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Source: <strong className="text-slate-200">{notif.source}</strong></span>
                  </div>
                </div>

                <a
                  href={notif.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold rounded-xl transition-all text-xs shrink-0 self-end sm:self-center"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SAVED EXAMS */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 bg-navy-900/90 border border-navy-700/80 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Your Bookmarked Target Exams ({savedExamIds.length})</span>
            </h2>
          </div>

          {savedExamIds.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-navy-900/40 rounded-2xl border border-navy-800">
              No saved exams yet. Click the bookmark icon on any exam card to save it here for tracking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {exams.filter(e => savedExamIds.includes(e.id)).map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onCheckEligibility={handleEvaluateExam}
                  isSaved={true}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVALUATION RESULT MODAL */}
      {evalModalOpen && evaluationResult && (
        <EligibilityResultModal
          result={evaluationResult}
          onClose={() => setEvalModalOpen(false)}
        />
      )}

    </div>
  );
};
