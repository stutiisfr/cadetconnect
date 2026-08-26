import React from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, ExternalLink, ShieldCheck, 
  FileText, Calendar, User, Award, Layers, ChevronRight, X, Info
} from 'lucide-react';

export const EligibilityResultModal = ({ result, onClose, onApplyClick }) => {
  if (!result) return null;

  const isEligible = result.status === 'ELIGIBLE';
  const isConditional = result.status === 'CONDITIONALLY_ELIGIBLE';

  const badgeBg = isEligible 
    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
    : isConditional 
      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
      : 'bg-red-500/10 border-red-500/40 text-red-400';

  const statusTitle = isEligible 
    ? 'ELIGIBLE TO APPLY' 
    : isConditional 
      ? 'CONDITIONALLY ELIGIBLE' 
      : 'NOT ELIGIBLE';

  const StatusIcon = isEligible ? CheckCircle : (isConditional ? AlertTriangle : XCircle);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-navy-950 border border-navy-700 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-navy-800 flex items-start justify-between bg-navy-900/80 gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {result.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Verified: {result.lastVerifiedDate || 'Official Govt Gazette'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-tight">
              {result.examTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conducting Authority: <strong className="text-slate-200">{result.conductingBody}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${badgeBg}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className="w-8 h-8 shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold tracking-wider uppercase block">{statusTitle}</span>
                <p className="text-xs font-semibold mt-0.5">
                  {isEligible 
                    ? 'Congratulations! Your qualifications cleanly match the latest official eligibility criteria.' 
                    : isConditional 
                      ? 'You meet core criteria subject to specified conditions (e.g. final year degree proof or height relaxation).' 
                      : 'Your profile currently does not meet one or more mandatory eligibility requirements for this exam.'}
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right shrink-0">
              <span className="text-2xl font-black">{result.matchPercentage}%</span>
              <span className="block text-[10px] text-slate-400">Match Score</span>
            </div>
          </div>

          {/* Official Website Redirection Callout Box */}
          <div className="p-4 bg-gradient-to-r from-navy-900 to-navy-850 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">Official Govt Recruiting Portal</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    ✓ Verified Official Link
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {result.officialPortalName || result.officialWebsite}
                </p>
              </div>
            </div>

            <a
              href={result.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold rounded-xl shadow-lg transition-all text-xs shrink-0"
              onClick={onApplyClick}
            >
              <span>Apply / Visit Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* EXACT REASONS & CRITERIA EVALUATION */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4" />
              <span>Detailed Eligibility Breakdown & Reasons</span>
            </h3>

            <div className="space-y-2 bg-navy-900/60 p-4 rounded-xl border border-navy-800">
              {result.reasons && result.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs py-1 leading-relaxed">
                  <span className="mt-0.5 shrink-0">
                    {reason.startsWith('✅') ? '✅' : reason.startsWith('❌') ? '❌' : reason.startsWith('⚠️') ? '⚠️' : 'ℹ️'}
                  </span>
                  <span className={reason.startsWith('❌') ? 'text-red-300 font-medium' : reason.startsWith('⚠️') ? 'text-amber-300 font-medium' : 'text-slate-200'}>
                    {reason.replace(/^[✅❌⚠️ℹ️]\s*/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AGE & RELAXATION INFO */}
          {result.ageResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-navy-900/60 border border-navy-800 rounded-xl">
                <span className="text-[11px] font-bold text-slate-300 block mb-1">Age Eligibility & Cutoff Window</span>
                <p className="text-xs text-slate-400">
                  Calculated Age: <strong className="text-amber-400">{result.ageResult.userAge ? `${result.ageResult.userAge} Years` : 'N/A'}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Allowed Age Range: <strong className="text-slate-200">{result.ageResult.minAge} to {result.ageResult.maxAge} Years</strong>
                </p>
                {result.ageResult.relaxationApplied && (
                  <span className="inline-block mt-2 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {result.ageResult.relaxationApplied}
                  </span>
                )}
              </div>

              {/* VACANCIES & DEADLINES */}
              <div className="p-3.5 bg-navy-900/60 border border-navy-800 rounded-xl">
                <span className="text-[11px] font-bold text-slate-300 block mb-1">Vacancies & Important Dates</span>
                <p className="text-xs text-slate-400">
                  Vacancies: <strong className="text-emerald-400">{result.vacancies || 'As per notification'}</strong>
                </p>
                {result.importantDates && (
                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-1.5">
                    <p>Apply Deadline: <strong className="text-white">{result.importantDates.applyDeadline || 'N/A'}</strong></p>
                    <p>Exam Date: <strong className="text-amber-300">{result.importantDates.examDate || 'N/A'}</strong></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IMPORTANT CONDITIONS */}
          {result.importantConditions && result.importantConditions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4" />
                <span>Important Exam Conditions</span>
              </h3>
              <ul className="space-y-1 text-slate-300 bg-navy-900/40 p-3 rounded-xl border border-navy-800">
                {result.importantConditions.map((cond, idx) => (
                  <li key={idx} className="text-xs leading-relaxed text-slate-300">
                    {cond}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* REQUIRED DOCUMENTS CHECKLIST */}
          {result.requiredDocuments && result.requiredDocuments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4" />
                <span>Required Documents Checklist</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-navy-900/60 rounded-lg border border-navy-800 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SELECTION PROCESS */}
          {result.selectionProcess && result.selectionProcess.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <Layers className="w-4 h-4" />
                <span>Selection Process Stages</span>
              </h3>
              <div className="space-y-1.5">
                {result.selectionProcess.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 bg-navy-900/60 px-3 py-2 rounded-lg border border-navy-800">
                    <span className="w-5 h-5 bg-amber-500/20 text-amber-300 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-500/40">
                      {idx + 1}
                    </span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Close Window
          </button>

          <a
            href={result.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-navy-950 font-bold rounded-xl shadow-lg transition-all text-xs"
            onClick={onApplyClick}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply Now on {result.conductingBody} Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
