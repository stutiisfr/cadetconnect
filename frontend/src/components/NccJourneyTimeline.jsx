import React from 'react';
import { Award, Flag, Shield, Star, CheckCircle, ChevronDown, Plus } from 'lucide-react';

export const NccJourneyTimeline = ({ items = [], isOwner = false, onAddMilestone }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-navy-900 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-olive-700" />
            NCC Visual Journey Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological record of service, camps, certificates, and appointments</p>
        </div>
        {isOwner && (
          <button
            onClick={onAddMilestone}
            className="flex items-center space-x-1 text-xs font-semibold bg-olive-700 text-white px-3 py-1.5 rounded-md hover:bg-olive-600 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-sand-50 rounded-lg border border-dashed border-slate-300">
          <Shield className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No journey milestones added yet.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Build your professional defence timeline by adding your enrollment date, CATC camps, RDC/TSC achievements, and ranks.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-olive-700/30">
          {items.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-olive-700 text-white flex items-center justify-center border-2 border-white shadow-sm">
                {item.category === 'Rank' ? (
                  <Shield className="w-3 h-3" />
                ) : item.category === 'Camp' ? (
                  <Flag className="w-3 h-3" />
                ) : item.category === 'Certificate' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Star className="w-3 h-3" />
                )}
              </div>

              {/* Milestone Card */}
              <div className="bg-sand-50 border border-slate-200 rounded-md p-4 transition-all hover:border-olive-500 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-olive-700 bg-olive-100 px-2 py-0.5 rounded border border-olive-200">
                    {item.year}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded">
                    {item.category || 'Milestone'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-navy-900 mt-2">{item.title}</h4>
                {item.detail && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
