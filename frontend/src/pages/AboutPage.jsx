import React from 'react';
import { Shield, Award, Users, Target, CheckCircle2, HeartHandshake } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-navy-800 relative overflow-hidden shadow-xl">
        <div className="w-16 h-16 bg-olive-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-olive-500 shadow-lg">
          <Shield className="w-8 h-8 text-amber-300" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
          India's Premier Ecosystem for NCC Cadets & Armed Forces Aspirants
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto mt-3 leading-relaxed">
          CadetConnect is built to empower millions of National Cadet Corps (NCC) cadets, CDS/NDA/AFCAT aspirants, and veteran military mentors through real-time professional networking, exam eligibility tools, and structured mentorship.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center text-olive-700 mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-900">NCC Wing Excellence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify A/B/C certification statuses, record camp participation, and showcase drill leadership on digital regimental profiles.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-900">SSB & Defence Prep</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instant eligibility calculators for CDS, NDA, AFCAT, and NCC Special Entry Scheme with real-time age & attempt validation.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-900">Veteran Mentorship</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct 1-on-1 guidance from retired Armed Forces officers, SSB interviewing officers, and Senior Under Officers (SUOs).
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-sand-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-navy-900 font-heading">Our Core Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-olive-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy-900 block font-bold">Unity & Discipline</strong>
              <span className="text-slate-600">Upholding the motto of the National Cadet Corps in all community interactions.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-olive-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy-900 block font-bold">Data Privacy & Security</strong>
              <span className="text-slate-600">Regimental numbers and personal identity records are encrypted and protected.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
