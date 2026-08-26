import React from 'react';
import { 
  ShieldCheck, ExternalLink, CheckCircle, Clock, Calendar, 
  Award, Bookmark, ArrowRight, Sparkles, Building2, Users
} from 'lucide-react';

export const ExamCard = ({ exam, onCheckEligibility, isSaved, onToggleSave }) => {
  const statusColor = 
    exam.notificationStatus === 'Active / Open' 
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : exam.notificationStatus === 'Upcoming'
        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        : 'bg-slate-500/10 border-slate-700 text-slate-400';

  return (
    <div className="bg-navy-900/80 border border-navy-700/80 hover:border-amber-500/50 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative group backdrop-blur-md">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              {exam.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
              ● {exam.notificationStatus}
            </span>
          </div>

          <button
            onClick={() => onToggleSave && onToggleSave(exam.id)}
            className={`p-1.5 rounded-xl transition-colors ${
              isSaved 
                ? 'bg-amber-500 text-navy-950 shadow-md' 
                : 'text-slate-400 hover:text-white bg-navy-800 hover:bg-navy-700'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Exam'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
          {exam.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-300">{exam.conductingBody}</span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mt-2.5 leading-relaxed">
          {exam.description}
        </p>

        {/* Quick Criteria Highlights */}
        <div className="mt-4 pt-3 border-t border-navy-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 block">Min Qualification</span>
            <strong className="text-white font-semibold">{exam.eligibilityCriteria.education.minLevel}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Age Range</span>
            <strong className="text-amber-300 font-semibold">
              {exam.eligibilityCriteria.age.minAge} - {exam.eligibilityCriteria.age.maxAge} Yrs
            </strong>
          </div>
          {exam.vacancies && (
            <div className="col-span-2 mt-1">
              <span className="text-[10px] text-slate-400 inline-block mr-1">Vacancies:</span>
              <span className="text-emerald-400 font-bold">{exam.vacancies}</span>
            </div>
          )}
        </div>

        {/* Official Gazette Source Verification Badge */}
        <div className="mt-3 flex items-center justify-between bg-navy-950/70 p-2 rounded-xl border border-navy-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[170px] sm:max-w-[200px]">{exam.source || 'Official Gazette Verified'}</span>
          </div>
          <span className="text-slate-500 font-mono text-[9px]">{exam.lastVerifiedDate ? exam.lastVerifiedDate.split(' ')[0] : 'Latest'}</span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-5 pt-3 border-t border-navy-800 flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => onCheckEligibility(exam)}
          className="w-full sm:flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold rounded-xl transition-all text-xs shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Check My Eligibility</span>
        </button>

        <a
          href={exam.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs shadow-md whitespace-nowrap"
          title={`Open ${exam.officialPortalName || exam.conductingBody} website`}
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
};
