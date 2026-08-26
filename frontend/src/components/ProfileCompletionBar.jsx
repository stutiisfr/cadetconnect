import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfileCompletionBar = ({ profile }) => {
  if (!profile) return null;

  let points = 0;
  const total = 100;
  const missingItems = [];

  if (profile.avatar || profile.profile_image) {
    points += 20;
  } else {
    missingItems.push('Add profile photo');
  }

  if (profile.headline || profile.bio) {
    points += 20;
  } else {
    missingItems.push('Add headline & bio');
  }

  if (profile.education && profile.education.length > 0) {
    points += 20;
  } else {
    missingItems.push('Add education record');
  }

  if (profile.experience && profile.experience.length > 0) {
    points += 20;
  } else {
    missingItems.push('Add leadership experience');
  }

  if (profile.wing || profile.rank || profile.cadetDetails) {
    points += 20;
  } else {
    missingItems.push('Set NCC Wing & Wing Details');
  }

  const percentage = Math.min(100, points);

  let badgeColor = 'bg-amber-500';
  let levelName = 'Beginner Profile';
  if (percentage >= 80) {
    badgeColor = 'bg-emerald-600';
    levelName = 'All-Star Cadet Profile';
  } else if (percentage >= 50) {
    badgeColor = 'bg-olive-600';
    levelName = 'Intermediate Profile';
  }

  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-olive-950 text-white rounded-2xl p-4 sm:p-5 border border-navy-800 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <h4 className="text-xs sm:text-sm font-bold tracking-tight">Profile Strength</h4>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>
            {levelName}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-amber-300">{percentage}% Complete</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-navy-800/80 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-amber-400 via-olive-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {missingItems.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Next step to boost profile: <strong className="text-white font-bold">{missingItems[0]}</strong></span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Your CadetConnect profile is fully complete and verified!</span>
        </div>
      )}
    </div>
  );
};
