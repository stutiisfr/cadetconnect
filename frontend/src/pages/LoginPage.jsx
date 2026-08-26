import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle, 
  Smartphone, KeyRound, CheckCircle2, Sparkles, User, RefreshCw,
  Linkedin, Facebook, HelpCircle, X
} from 'lucide-react';

export const LoginPage = () => {
  const { 
    login, loginWithGoogle, loginWithLinkedIn, loginWithFacebook, 
    sendMobileOtp, verifyMobileOtp, forgotPassword, loading 
  } = useAuth();
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

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [demoResetLink, setDemoResetLink] = useState('');

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

  // Google Login Execution
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

  // LinkedIn Login Execution
  const handleLinkedInSignIn = async () => {
    setError('');
    setInfoMessage('');
    try {
      await loginWithLinkedIn({
        email: 'cadet.linkedin.user@cadetconnect.org',
        name: 'Cadet LinkedIn Professional',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        linkedinId: 'linkedin-oauth-' + Date.now()
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'LinkedIn authentication failed.');
    }
  };

  // Facebook Login Execution
  const handleFacebookSignIn = async () => {
    setError('');
    setInfoMessage('');
    try {
      await loginWithFacebook({
        email: 'cadet.facebook.user@cadetconnect.org',
        name: 'Cadet Facebook User',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        facebookId: 'facebook-oauth-' + Date.now()
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Facebook authentication failed.');
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
      setError(err.message || 'Invalid verification code.');
    }
  };

  // Forgot Password Request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail || !forgotEmail.trim()) return;

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSubmitted(true);
      setForgotMsg(res.message);
      if (res.demoResetLink) {
        setDemoResetLink(res.demoResetLink);
      }
    } catch (err) {
      setError(err.message || 'Password reset request failed.');
    }
  };

  const setDemoLogin = (emailStr, roleStr) => {
    setEmail(emailStr);
    setPassword('cadet123');
    setAuthMode('EMAIL');
    setInfoMessage(`Demo credentials loaded for ${roleStr}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sand-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 text-center border-b border-navy-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="w-12 h-12 bg-olive-700 rounded-xl flex items-center justify-center mx-auto mb-3 border border-olive-500 shadow-md">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            Sign in to CadetConnect
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            India's Ecosystem for NCC Cadets & Armed Forces Aspirants
          </p>
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

          {/* Multi-Provider Social Login Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-300 shadow-sm transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLinkedInSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm"
              >
                <Linkedin className="w-4 h-4 shrink-0" />
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1464cc] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4 shrink-0" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or sign in with
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-sand-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('EMAIL'); setError(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'EMAIL'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('PHONE'); setError(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'PHONE'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* EMAIL & PASSWORD FORM */}
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
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotSubmitted(false); setError(''); }}
                    className="text-[11px] text-olive-700 font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
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
                className="w-full bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* MOBILE OTP FORM */}
          {authMode === 'PHONE' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">Mobile Number</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-mono text-slate-500 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-12 pr-3 py-2.5 text-xs text-navy-900 font-mono focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send OTP Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-navy-900">6-Digit Verification Code</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-olive-700 font-bold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono tracking-widest text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {demoOtpCode && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Demo OTP Code: <strong className="text-amber-600">{demoOtpCode}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendOtp}
                      className={`font-semibold ${
                        resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-olive-700 hover:underline'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="bg-sand-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">
              ⚡ Quick Demo Profiles (Click to Load):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoLogin('rahul.das@cadetconnect.org', 'Senior Under Officer')}
                className="bg-white hover:bg-sand-100 text-navy-900 border border-slate-200 px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors truncate"
              >
                🪖 Cadet (SUO)
              </button>
              <button
                type="button"
                onClick={() => setDemoLogin('ananya.sharma@cadetconnect.org', 'CDS Aspirant')}
                className="bg-white hover:bg-sand-100 text-navy-900 border border-slate-200 px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors truncate"
              >
                🎯 CDS Aspirant
              </button>
              <button
                type="button"
                onClick={() => setDemoLogin('col.vikram@cadetconnect.org', 'SSB Mentor')}
                className="bg-white hover:bg-sand-100 text-navy-900 border border-slate-200 px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors truncate"
              >
                🎖️ Veteran Mentor
              </button>
              <button
                type="button"
                onClick={() => setDemoLogin('admin@cadetconnect.org', 'Admin Desk')}
                className="bg-white hover:bg-sand-100 text-navy-900 border border-slate-200 px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors truncate"
              >
                🛡️ Admin Desk
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
            Don't have a CadetConnect account?{' '}
            <Link to="/register" className="font-bold text-olive-700 hover:underline">
              Create account
            </Link>
          </div>

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-olive-700" />
                <h3 className="text-base font-bold text-navy-900">Forgot Your Password?</h3>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address below. We will verify your account and generate a secure password reset link.
                </p>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.das@cadetconnect.org"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-sand-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    {loading ? 'Sending...' : 'Generate Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900">Reset Request Generated</p>
                    <p className="mt-1 leading-relaxed">{forgotMsg}</p>
                  </div>
                </div>

                {demoResetLink && (
                  <div className="p-3 bg-sand-100 border border-slate-300 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 font-mono block">
                      ⚡ Demo Reset Link (Development Mode):
                    </span>
                    <a
                      href={demoResetLink}
                      className="text-xs text-olive-800 font-mono underline break-all block"
                    >
                      {demoResetLink}
                    </a>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-5 py-2 bg-navy-900 text-white font-bold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
