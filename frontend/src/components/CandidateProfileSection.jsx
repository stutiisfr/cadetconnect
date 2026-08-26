import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Award, CheckCircle, Save, Shield, 
  Sparkles, Calendar, Layers, MapPin, Activity, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export const CandidateProfileSection = ({ onProfileUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [profile, setProfile] = useState({
    dob: '2004-05-14',
    gender: 'Male',
    nationality: 'Citizen of India',
    category: 'General',
    stateDomicile: 'Odisha',
    maritalStatus: 'Unmarried',
    isExServiceman: false,
    isPwd: false,
    heightCm: 172,
    chestCm: 82,
    eyesight: '6/6',
    nccCertificate: 'B',
    nccGrade: 'A',
    drivingLicense: false,
    pilotLicense: false,
    education: {
      highestLevel: 'Graduation',
      status: 'Completed',
      matriculation10th: {
        board: 'CBSE',
        passingYear: 2020,
        percentage: 88.4,
        subjects: 'Science, Mathematics, Social Studies, English, Odia'
      },
      higherSecondary12th: {
        board: 'CHSE Odisha',
        passingYear: 2022,
        percentage: 84.0,
        stream12th: 'Science (PCM)',
        pcmPercentage: 86.0,
        subjects: 'Physics, Chemistry, Mathematics, Biology, English'
      },
      diploma: {
        applicable: false,
        course: '',
        institution: '',
        passingYear: '',
        percentage: ''
      },
      graduation: {
        degreeName: 'B.Sc Physics (Hons)',
        specialization: 'Physics & Applied Mathematics',
        university: 'Ravenshaw University',
        passingYear: 2025,
        percentage: 78.5,
        status: 'Completed'
      },
      postGraduation: {
        applicable: false,
        degreeName: '',
        specialization: '',
        university: '',
        passingYear: '',
        percentage: ''
      }
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/my-profile`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(prev => ({
          ...prev,
          ...data.profile
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('cadetconnect_token');
      const res = await fetch(`${API_BASE_URL}/api/eligibility/my-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Academic & Personal Candidate Profile saved successfully! Instant Eligibility will now use these credentials.');
        if (onProfileUpdated) onProfileUpdated(profile);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Candidate Academic & Personal Profile</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Save your details once. The system will automatically compare your profile against all major Indian government, civil services, and defence examinations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-lg transition-all text-xs shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Profile Details'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 mt-6">
        
        {/* SECTION 1: PERSONAL DETAILS */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <User className="w-4 h-4" />
            <span>1. Personal & Category Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Date of Birth */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={profile.dob || ''}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Gender *</label>
              <select
                value={profile.gender || 'Male'}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Category (for Relaxation) *</label>
              <select
                value={profile.category || 'General'}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="General">General / UR</option>
                <option value="OBC">OBC (Non-Creamy Layer)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>

            {/* State Domicile */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">State of Domicile *</label>
              <input
                type="text"
                placeholder="e.g. Odisha, Rajasthan, Delhi, etc."
                value={profile.stateDomicile || ''}
                onChange={(e) => setProfile({ ...profile, stateDomicile: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Marital Status *</label>
              <select
                value={profile.maritalStatus || 'Unmarried'}
                onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Unmarried">Unmarried / Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widow">Widow / Widower</option>
              </select>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Nationality *</label>
              <select
                value={profile.nationality || 'Citizen of India'}
                onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Citizen of India">Citizen of India</option>
                <option value="Subject of Nepal">Subject of Nepal</option>
                <option value="Subject of Bhutan">Subject of Bhutan</option>
                <option value="Tibetan Refugee">Tibetan Refugee (Pre-1962)</option>
              </select>
            </div>

            {/* Checkboxes for ExServicemen & PwD */}
            <div className="flex items-center gap-4 pt-2 col-span-full">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isExServiceman || false}
                  onChange={(e) => setProfile({ ...profile, isExServiceman: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>Ex-Serviceman (Armed Forces)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isPwd || false}
                  onChange={(e) => setProfile({ ...profile, isPwd: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>Person with Benchmark Disability (PwD)</span>
              </label>
            </div>

          </div>
        </div>

        {/* SECTION 2: PHYSICAL STANDARDS & SPECIAL CERTIFICATES */}
        <div className="pt-4 border-t border-navy-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" />
            <span>2. Physical Standards & Special Qualifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Height (in cm) *</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 172"
                value={profile.heightCm || ''}
                onChange={(e) => setProfile({ ...profile, heightCm: parseFloat(e.target.value) || '' })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Chest (in cm)</label>
              <input
                type="number"
                placeholder="e.g. 82"
                value={profile.chestCm || ''}
                onChange={(e) => setProfile({ ...profile, chestCm: parseFloat(e.target.value) || '' })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Eyesight Standard</label>
              <select
                value={profile.eyesight || '6/6'}
                onChange={(e) => setProfile({ ...profile, eyesight: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="6/6">6/6 (Normal Distance Vision)</option>
                <option value="6/9">6/9</option>
                <option value="6/12">6/12</option>
                <option value="Color Blind">Color Blind / Defective</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">NCC Certificate</label>
              <select
                value={profile.nccCertificate || 'None'}
                onChange={(e) => setProfile({ ...profile, nccCertificate: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="None">None</option>
                <option value="A">NCC 'A' Certificate</option>
                <option value="B">NCC 'B' Certificate</option>
                <option value="C">NCC 'C' Certificate (Direct SSB Entry!)</option>
              </select>
            </div>

            {profile.nccCertificate === 'C' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">NCC 'C' Grade</label>
                <select
                  value={profile.nccGrade || 'A'}
                  onChange={(e) => setProfile({ ...profile, nccGrade: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="A">Grade A (Alpha)</option>
                  <option value="B">Grade B (Bravo)</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-4 col-span-full pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.drivingLicense || false}
                  onChange={(e) => setProfile({ ...profile, drivingLicense: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>Valid LMV Driving License (Motorcycle/Car - Required for SSC CPO Delhi Police)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.pilotLicense || false}
                  onChange={(e) => setProfile({ ...profile, pilotLicense: e.target.checked })}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>Commercial Pilot License (DGCA CPL - for AFCAT Flying relaxation)</span>
              </label>
            </div>

          </div>
        </div>

        {/* SECTION 3: ACADEMIC QUALIFICATIONS */}
        <div className="pt-4 border-t border-navy-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" />
            <span>3. Academic Qualifications (10th, 12th, Diploma, Graduation)</span>
          </h3>

          <div className="space-y-6">
            
            {/* 10TH MATRICULATION */}
            <div className="p-4 bg-navy-950/70 border border-navy-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-200 block">10th Class / Matriculation *</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Board / Council</label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE, ICSE, BSE Odisha"
                    value={profile.education?.matriculation10th?.board || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        matriculation10th: { ...profile.education?.matriculation10th, board: e.target.value }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Passing Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2020"
                    value={profile.education?.matriculation10th?.passingYear || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        matriculation10th: { ...profile.education?.matriculation10th, passingYear: parseInt(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Percentage / CGPA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 88.4"
                    value={profile.education?.matriculation10th?.percentage || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        matriculation10th: { ...profile.education?.matriculation10th, percentage: parseFloat(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Key Subjects</label>
                  <input
                    type="text"
                    placeholder="e.g. Science, Maths, English"
                    value={profile.education?.matriculation10th?.subjects || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        matriculation10th: { ...profile.education?.matriculation10th, subjects: e.target.value }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 12TH HIGHER SECONDARY */}
            <div className="p-4 bg-navy-950/70 border border-navy-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-200 block">12th Class / Higher Secondary (10+2) *</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Stream</label>
                  <select
                    value={profile.education?.higherSecondary12th?.stream12th || 'Science (PCM)'}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        higherSecondary12th: { ...profile.education?.higherSecondary12th, stream12th: e.target.value }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Science (PCM)">Science (Physics, Chemistry, Maths - PCM)</option>
                    <option value="Science (PCB)">Science (Physics, Chemistry, Biology - PCB)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts / Humanities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Overall Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 84.0"
                    value={profile.education?.higherSecondary12th?.percentage || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        higherSecondary12th: { ...profile.education?.higherSecondary12th, percentage: parseFloat(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">PCM Percentage (%) if applicable</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 86.0"
                    value={profile.education?.higherSecondary12th?.pcmPercentage || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        higherSecondary12th: { ...profile.education?.higherSecondary12th, pcmPercentage: parseFloat(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Passing Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2022"
                    value={profile.education?.higherSecondary12th?.passingYear || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        higherSecondary12th: { ...profile.education?.higherSecondary12th, passingYear: parseInt(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* GRADUATION */}
            <div className="p-4 bg-navy-950/70 border border-navy-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Graduation Degree / Under-Graduate Course</span>
                <select
                  value={profile.education?.graduation?.status || 'Completed'}
                  onChange={(e) => setProfile({
                    ...profile,
                    education: {
                      ...profile.education,
                      highestLevel: 'Graduation',
                      status: e.target.value,
                      graduation: { ...profile.education?.graduation, status: e.target.value }
                    }
                  })}
                  className="bg-navy-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-[11px] text-amber-300 font-bold"
                >
                  <option value="Completed">Degree Completed / Passed</option>
                  <option value="Pursuing Final Year">Pursuing Final Year (Appearing)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Degree Name</label>
                  <select
                    value={profile.education?.graduation?.degreeName || 'B.Sc'}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        graduation: { ...profile.education?.graduation, degreeName: e.target.value }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="B.Tech/B.E.">B.Tech / B.E. (Engineering)</option>
                    <option value="B.Sc Physics (Hons)">B.Sc Physics / Mathematics</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science / IT</option>
                    <option value="B.Sc (General)">B.Sc (General / Other)</option>
                    <option value="B.Com">B.Com (Commerce)</option>
                    <option value="B.A.">B.A. (Arts / Humanities)</option>
                    <option value="BBA / BCA">BBA / BCA</option>
                    <option value="MBBS / BDS">MBBS / Medical</option>
                    <option value="LLB">LLB (Law)</option>
                    <option value="B.Ed">B.Ed (Education)</option>
                    <option value="Other Bachelor Degree">Other Bachelor Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">University / Institute</label>
                  <input
                    type="text"
                    placeholder="e.g. Ravenshaw University"
                    value={profile.education?.graduation?.university || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        graduation: { ...profile.education?.graduation, university: e.target.value }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Aggregate Marks (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 78.5"
                    value={profile.education?.graduation?.percentage || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        graduation: { ...profile.education?.graduation, percentage: parseFloat(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Passing / Completion Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2025"
                    value={profile.education?.graduation?.passingYear || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        graduation: { ...profile.education?.graduation, passingYear: parseInt(e.target.value) || '' }
                      }
                    })}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-xl transition-all text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Profile...' : 'Save & Sync Candidate Profile'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
