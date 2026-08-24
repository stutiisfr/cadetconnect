import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Award, BookOpen, AlertCircle, CheckCircle, Lock, 
  Smartphone, Mail, KeyRound, Sparkles, UserPlus, CheckCircle2, ArrowRight
} from 'lucide-react';

export const RegisterPage = () => {
  const { registerCadet, registerAspirant, loginWithGoogle, sendMobileOtp, verifyMobileOtp, loading } = useAuth();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('CADET'); // 'CADET' or 'ASPIRANT'
  const [methodTab, setMethodTab] = useState('STANDARD'); // 'STANDARD' or 'PHONE_OTP'
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Mobile OTP registration fields
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // Cadet Specific Fields
  const [directorate, setDirectorate] = useState('Odisha Directorate');
  const [group, setGroup] = useState('Cuttack Group');
  const [unit, setUnit] = useState('4 (O) Bn NCC');
  const [wing, setWing] = useState('Army Wing (SD)');
  const [regimentalNumber, setRegimentalNumber] = useState('');
  const [rank, setRank] = useState('Cadet');
  const [certificateStatus, setCertificateStatus] = useState('B Certificate');

  // Aspirant Specific Fields
  const [degree, setDegree] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [targetExams, setTargetExams] = useState(['CDS', 'AFCAT']);
  const [preferredService, setPreferredService] = useState('Indian Army');
  const [prepLevel, setPrepLevel] = useState('Intermediate');

  const handleTargetExamToggle = (exam) => {
    if (targetExams.includes(exam)) {
      setTargetExams(targetExams.filter(e => e !== exam));
    } else {
      setTargetExams([...targetExams, exam]);
    }
  };

  // Google Quick Registration
  const handleGoogleSignUp = async () => {
    setError('');
    setInfoMessage('');
    try {
      await loginWithGoogle({
        email: 'cadet.google.user@cadetconnect.org',
        name: name || 'Cadet User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        googleId: 'google-oauth-' + Date.now()
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Google registration failed.');
    }
  };

  // Mobile OTP Send
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (roleTab === 'CADET' && !regimentalNumber.trim()) {
      setError('Regimental Number is strictly required for NCC Cadet profiles.');
      return;
    }

    try {
      const res = await sendMobileOtp(phone.trim());
      setOtpSent(true);
      setDemoOtpCode(res.demoOtp || '123456');
      setInfoMessage(`Verification code sent to +91 ${phone.slice(-10)}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  // Mobile OTP Verify & Complete Register
  const handleVerifyOtpRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    try {
      await verifyMobileOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        name: name.trim(),
        role: roleTab
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    }
  };

  // Standard Email/Password Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (roleTab === 'CADET') {
        if (!regimentalNumber.trim()) {
          setError('Regimental Number is strictly required for NCC Cadet profile creation.');
          return;
        }
        await registerCadet({
          name, email, password, phone, college, location, bio,
          directorate, group, unit, wing, regimentalNumber: regimentalNumber.trim(),
          rank, certificateStatus
        });
      } else {
        await registerAspirant({
          name, email, password, phone, college, degree, graduationYear, location, bio,
          targetExams, preferredService, prepLevel
        });
      }
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sand-100 py-10 px-4 sm:px-6 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 text-center border-b border-navy-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-olive-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-12 h-12 bg-olive-700 rounded-xl flex items-center justify-center mx-auto mb-3 border border-olive-500 shadow-md">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            Join the CadetConnect Community
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Choose your account role to tailor your official defence dashboard
          </p>

          {/* Role Tab Selector */}
          <div className="grid grid-cols-2 bg-navy-900 p-1 rounded-xl border border-navy-800 mt-5 gap-1">
            <button
              type="button"
              onClick={() => { setRoleTab('CADET'); setError(''); setInfoMessage(''); }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                roleTab === 'CADET' 
                  ? 'bg-olive-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>NCC Cadet</span>
            </button>

            <button
              type="button"
              onClick={() => { setRoleTab('ASPIRANT'); setError(''); setInfoMessage(''); }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                roleTab === 'ASPIRANT' 
                  ? 'bg-blue-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>Defence Aspirant</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Google Quick Sign Up Option */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition-all hover:border-slate-400 hover:shadow"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign up instantly with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or complete custom registration
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Das"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Mobile Number (with +91)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy-900 mb-1">College / University / School *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravenshaw University / DAV Public School"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* ROLE TAB 1: NCC CADET REGISTRATION */}
            {roleTab === 'CADET' && (
              <div className="bg-olive-50/70 p-4 rounded-xl border border-olive-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-olive-200 pb-2">
                  <h3 className="text-xs font-bold text-olive-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-olive-700" />
                    NCC Regimental Verification Details
                  </h3>
                  <span className="text-[10px] bg-olive-700 text-white px-2 py-0.5 rounded-full font-mono font-semibold">
                    Cadet Profile
                  </span>
                </div>

                {/* MANDATORY REGIMENTAL NUMBER NOTICE */}
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Regimental Number is Mandatory for NCC Verification</span>
                  </div>
                  <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                    <strong>Privacy Vault:</strong> Your regimental number is encrypted and kept 100% private from public display.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">
                      Regimental Number * (Mandatory)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OD/22/SD/A/104921"
                      value={regimentalNumber}
                      onChange={(e) => setRegimentalNumber(e.target.value)}
                      className="w-full bg-white border border-olive-400 rounded-xl px-3 py-2 text-xs font-mono font-bold text-navy-900 focus:outline-none focus:border-olive-700 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">NCC Rank / Appointment</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                    >
                      <option value="Senior Under Officer (SUO)">Senior Under Officer (SUO)</option>
                      <option value="Under Officer (UO)">Under Officer (UO)</option>
                      <option value="Company Quarter Master Sergeant (CQMS)">CQMS</option>
                      <option value="Sergeant (SGT)">Sergeant (SGT)</option>
                      <option value="Corporal (CPL)">Corporal (CPL)</option>
                      <option value="Lance Corporal (L/CPL)">Lance Corporal (L/CPL)</option>
                      <option value="Cadet">Cadet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">NCC Directorate</label>
                    <input
                      type="text"
                      placeholder="e.g. Odisha Directorate"
                      value={directorate}
                      onChange={(e) => setDirectorate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">NCC Unit / Battalion</label>
                    <input
                      type="text"
                      placeholder="e.g. 4 (O) Bn NCC"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ROLE TAB 2: DEFENCE ASPIRANT REGISTRATION */}
            {roleTab === 'ASPIRANT' && (
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    Defence Examination Targets
                  </h3>
                  <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-mono font-semibold">
                    Aspirant Profile
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Target Exams</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['CDS', 'NDA', 'AFCAT', 'CAPF', 'SSB Interview', 'Agniveer', 'Territorial Army'].map((exam) => {
                      const isSelected = targetExams.includes(exam);
                      return (
                        <button
                          type="button"
                          key={exam}
                          onClick={() => handleTargetExamToggle(exam)}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold border transition-all ${
                            isSelected 
                              ? 'bg-blue-700 text-white border-blue-700 shadow-sm' 
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{exam}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Preferred Armed Force</label>
                    <select
                      value={preferredService}
                      onChange={(e) => setPreferredService(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                    >
                      <option value="Indian Army">Indian Army</option>
                      <option value="Indian Navy">Indian Navy</option>
                      <option value="Indian Air Force">Indian Air Force</option>
                      <option value="Coast Guard">Indian Coast Guard</option>
                      <option value="CAPF">CAPF / Paramilitary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Preparation Stage</label>
                    <select
                      value={prepLevel}
                      onChange={(e) => setPrepLevel(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                    >
                      <option value="Beginner (Foundations)">Beginner (Foundations)</option>
                      <option value="Intermediate (Written Prep)">Intermediate (Written Prep)</option>
                      <option value="Advanced (SSB Stage II / AFSB)">Advanced (SSB Stage II / AFSB)</option>
                      <option value="Repeater / Experienced">Repeater / Experienced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Short Profile Bio</label>
              <textarea
                rows={2}
                placeholder="Share your goals, camp experiences, or entry targets..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-olive-950/20 flex items-center justify-center gap-2"
              id="register-submit-btn"
            >
              <Shield className="w-4 h-4" />
              <span>
                {loading ? 'Creating Profile...' : `Complete Registration as ${roleTab === 'CADET' ? 'NCC Cadet' : 'Defence Aspirant'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-slate-600 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-olive-700 hover:underline">
                Sign In to Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
