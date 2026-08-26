import React from 'react';
import { Scale, ShieldAlert, CheckCircle } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-900">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900 font-heading">Terms of Service & Code of Conduct</h1>
            <p className="text-xs text-slate-500 font-mono">Effective August 2026 • CadetConnect Community Standards</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-olive-700" />
              1. Community Guidelines & Cadet Conduct
            </h2>
            <p>
              Users must conduct themselves with honor, discipline, and respect. Harassment, unauthorized posting of classified material, hate speech, or impersonation of military officers will result in immediate permanent suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              2. Content Moderation & Reporting
            </h2>
            <p>
              CadetConnect platform administrators actively moderate feed posts, study notes, and public forums. Content violating national security guidelines or community rules will be deleted without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
