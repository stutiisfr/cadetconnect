import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, Shield, Eye, MessageSquare, AlertTriangle, CheckCircle, 
  Smartphone, CheckCircle2, Link as LinkIcon, RefreshCw, KeyRound
} from 'lucide-react';

export const PrivacySettingsPage = () => {
  const { user, connectGoogle, connectPhone, sendMobileOtp } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [messagePerm, setMessagePerm] = useState('ALL');
  const [profileVis, setProfileVis] = useState('PUBLIC');
  const [storyVis, setStoryVis] = useState('CONNECTIONS');

  // Phone Linking modal/state
  const [phoneToLink, setPhoneToLink] = useState(user?.phone || '');
  const [linkingPhone, setLinkingPhone] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLinkGoogle = async () => {
    setError('');
    setStatusMsg('');
    try {
      await connectGoogle({
        googleId: 'google-acc-' + Date.now(),
        email: user?.email || 'google.cadet@cadetconnect.org'
      });
      setStatusMsg('Google Account successfully linked to your CadetConnect profile!');
    } catch (err) {
      setError(err.message || 'Failed to connect Google account.');
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneToLink || phoneToLink.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const res = await sendMobileOtp(phoneToLink);
      setPhoneOtpSent(true);
      setDemoOtp(res.demoOtp || '123456');
      setStatusMsg(`OTP code sent to +91 ${phoneToLink.slice(-10)}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await connectPhone(phoneToLink, phoneOtp);
      setLinkingPhone(false);
      setPhoneOtpSent(false);
      setStatusMsg('Mobile number verified and connected successfully!');
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-navy-950 text-white p-6 sm:p-7 rounded-2xl border border-navy-800 shadow-lg">
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading flex items-center gap-2.5">
          <Lock className="w-6 h-6 text-amber-400" />
          Security, Privacy & Account Connections
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Manage your connected Google and mobile authenticators, message permissions, and regimental data vault.
        </p>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Connected Accounts Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-navy-950 font-heading uppercase tracking-wider flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-olive-700" />
          Connected Login Accounts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Google Account Card */}
          <div className="bg-sand-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-xs text-navy-900">Google Account</span>
              </div>
              {user?.googleConnected ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Connected
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Not Linked
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {user?.googleConnected 
                ? 'Your Google account is linked for instant 1-click authentication.'
                : 'Link your Google account to sign in seamlessly across all devices.'}
            </p>

            {!user?.googleConnected && (
              <button
                type="button"
                onClick={handleLinkGoogle}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 rounded-lg border border-slate-300 shadow-sm transition-colors"
              >
                Connect Google Account
              </button>
            )}
          </div>

          {/* Mobile Phone Card */}
          <div className="bg-sand-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-olive-700" />
                <span className="font-bold text-xs text-navy-900">Mobile Number (OTP)</span>
              </div>
              {user?.phone ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Verified
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Unverified
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {user?.phone ? `Linked to ${user.phone}. Used for instant SMS OTP logins.` : 'Verify mobile number to enable instant OTP login and camp alerts.'}
            </p>

            {!linkingPhone ? (
              <button
                type="button"
                onClick={() => setLinkingPhone(true)}
                className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-colors"
              >
                {user?.phone ? 'Change Mobile Number' : 'Connect Mobile Number'}
              </button>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                {!phoneOtpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-2">
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneToLink}
                      onChange={(e) => setPhoneToLink(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy-900"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-olive-700 text-white text-xs font-bold py-1.5 rounded-lg"
                      >
                        Send OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkingPhone(false)}
                        className="px-3 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold text-navy-900"
                    />
                    {demoOtp && (
                      <span className="text-[10px] text-amber-700 block font-mono">Demo OTP: {demoOtp}</span>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-olive-700 text-white text-xs font-bold py-1.5 rounded-lg"
                    >
                      Verify & Link
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Regimental Privacy Vault Notice */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <Shield className="w-4 h-4 text-amber-700" />
          <span>Strict Regimental Number Privacy Policy</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          Your full NCC Regimental Number is encrypted and accessible strictly by authorized platform verification admins. It will never be rendered on public search, profile cards, or exported QR profiles.
        </p>
      </div>

      {/* Privacy Preferences Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
        {saved && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Privacy preferences updated successfully.</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-navy-900 mb-1">Who Can Send You Direct Messages?</label>
          <select
            value={messagePerm}
            onChange={(e) => setMessagePerm(e.target.value)}
            className="w-full sm:w-80 bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
          >
            <option value="ALL">All Cadets, Aspirants & Mentors</option>
            <option value="CONNECTIONS">Only My Connected Network</option>
            <option value="MENTORS">Only Verified Mentors & Officers</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-navy-900 mb-1">Public Profile Visibility</label>
          <select
            value={profileVis}
            onChange={(e) => setProfileVis(e.target.value)}
            className="w-full sm:w-80 bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
          >
            <option value="PUBLIC">Public to All Defence Community Members</option>
            <option value="CONNECTIONS">Only Connected Network</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-navy-900 mb-1">24-Hour Stories Visibility</label>
          <select
            value={storyVis}
            onChange={(e) => setStoryVis(e.target.value)}
            className="w-full sm:w-80 bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
          >
            <option value="CONNECTIONS">Connected Network Only</option>
            <option value="PUBLIC">Public Feed</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-olive-700 hover:bg-olive-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          Save Privacy Settings
        </button>
      </form>
    </div>
  );
};
