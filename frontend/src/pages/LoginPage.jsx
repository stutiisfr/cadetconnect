import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle, 
  Smartphone, KeyRound, CheckCircle2, Sparkles, User, RefreshCw
} from 'lucide-react';

export const LoginPage = () => {
  const { login, loginWithGoogle, sendMobileOtp, verifyMobileOtp, loading } = useAuth();
  const navigate = useNavigate();

  // Auth Mode: 'EMAIL' | 'PHONE'
  const [authMode, setAuthMode] = useState('EMAIL');
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Email Password Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Google Login Simulation & Execution
  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMessage('');
    try {
      await loginWithGoogle({
        email: 'cadet.google.user@cadetconnect.org',
        name: 'Cadet Google User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        googleId: 'google-oauth-' + Date.now()
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    }
  };

  // Send Mobile OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setInfoMessage('');
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const res = await sendMobileOtp(phone.trim());
      setOtpSent(true);
      setDemoOtpCode(res.demoOtp || '123456');
      setInfoMessage(`Verification code sent to +91 ${phone.slice(-10)}`);
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    try {
      await verifyMobileOtp({ phone: phone.trim(), otp: otp.trim() });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    }
  };

  // Quick 1-Click Demo Profiles
  const handleQuickLogin = async (demoEmail) => {
    setError('');
    setInfoMessage('');
    try {
      await login(demoEmail, 'cadet123');
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sand-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Portal Header */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 text-center border-b border-navy-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-olive-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-12 h-12 bg-olive-700 rounded-xl flex items-center justify-center mx-auto mb-3 border border-olive-500 shadow-md">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            Sign In to CadetConnect
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access India's premier defence & NCC professional network
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-navy-900 p-1 rounded-xl border border-navy-800 mt-5">
            <button
              type="button"
              onClick={() => { setAuthMode('EMAIL'); setError(''); setInfoMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'EMAIL' 
                  ? 'bg-olive-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('PHONE'); setError(''); setInfoMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'PHONE' 
                  ? 'bg-olive-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* 1. Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition-all hover:border-slate-400 hover:shadow"
            id="google-signin-btn"
          >
            {/* Google G SVG Emblem */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or sign in with
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* 2A. Email & Password Form */}
          {authMode === 'EMAIL' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Registered Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.das@cadetconnect.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-navy-900">Password</label>
                  <span className="text-[11px] text-olive-700 font-semibold cursor-pointer hover:underline">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-olive-900/20 flex items-center justify-center gap-2"
                id="email-signin-submit-btn"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2B. Mobile Number OTP Form */}
          {authMode === 'PHONE' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">Mobile Number</label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-sand-50 border border-slate-300 rounded-r-xl pl-3 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors tracking-wider"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      We'll send a 6-digit verification code to this number.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-olive-900/20 flex items-center justify-center gap-2"
                    id="send-otp-btn"
                  >
                    <span>{loading ? 'Sending Code...' : 'Get Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-navy-900">Enter 6-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); }}
                        className="text-[11px] text-olive-700 font-semibold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono font-bold text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors tracking-widest text-center"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    {/* Quick helper for instant demo testing */}
                    {demoOtpCode && (
                      <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                        <span>Demo OTP Code: <strong className="font-mono">{demoOtpCode}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtp(demoOtpCode)}
                          className="font-bold underline text-amber-800 hover:text-amber-950"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn't receive code?</span>
                    {resendTimer > 0 ? (
                      <span className="font-mono text-slate-400">{resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-olive-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-olive-900/20 flex items-center justify-center gap-2"
                    id="verify-otp-btn"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Enter App'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.das@cadetconnect.org')}
                className="bg-sand-50 hover:bg-olive-50 border border-slate-200 hover:border-olive-500 p-2.5 rounded-xl text-left transition-colors group"
              >
                <div className="font-bold text-navy-900 group-hover:text-olive-800">SUO Rahul Das</div>
                <div className="text-[10px] text-olive-800 font-mono">NCC Cadet (SUO)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ananya.sharma@cadetconnect.org')}
                className="bg-sand-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 p-2.5 rounded-xl text-left transition-colors group"
              >
                <div className="font-bold text-navy-900 group-hover:text-blue-800">Ananya Sharma</div>
                <div className="text-[10px] text-blue-800 font-mono">CDS Aspirant</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('col.vikram@cadetconnect.org')}
                className="bg-sand-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-500 p-2.5 rounded-xl text-left transition-colors group"
              >
                <div className="font-bold text-navy-900 group-hover:text-amber-800">Col. Vikram (Retd.)</div>
                <div className="text-[10px] text-amber-800 font-mono">Veteran Mentor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@cadetconnect.org')}
                className="bg-sand-50 hover:bg-red-50 border border-slate-200 hover:border-red-500 p-2.5 rounded-xl text-left transition-colors group"
              >
                <div className="font-bold text-navy-900 group-hover:text-red-800">Admin Desk</div>
                <div className="text-[10px] text-red-800 font-mono">Platform Admin</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600 pt-1">
            New to CadetConnect?{' '}
            <Link to="/register" className="font-bold text-olive-700 hover:underline">
              Create New Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
