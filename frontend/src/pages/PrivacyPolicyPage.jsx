import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center text-olive-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900 font-heading">Privacy Policy & Security Standards</h1>
            <p className="text-xs text-slate-500 font-mono">Last Updated: August 2026 • CadetConnect Data Governance</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-700" />
              1. Protection of Regimental & Defence Information
            </h2>
            <p>
              CadetConnect strictly enforces data privacy regarding military and NCC regimental identifiers. Regimental numbers, battalion codes, and internal unit documents are stored in encrypted vaults and are never publicly displayed or sold to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-olive-700" />
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account credentials (Email, Phone Number, OAuth IDs from Google/LinkedIn/Facebook).</li>
              <li>Profile data (Name, Education records, Leadership experience, NCC Wing & Camps).</li>
              <li>Usage data (Feed posts, Direct messages, Exam eligibility calculations).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-olive-700" />
              3. Data Encryption & Security Controls
            </h2>
            <p>
              All traffic between your browser and our servers is encrypted over TLS/HTTPS and WSS. Password hashes use 12-round bcrypt salts, and session tokens are validated server-side.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
